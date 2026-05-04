import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/**
 * In the cloned document, replace every <textarea> with a <div>
 * that shows the same text — html2canvas renders textareas poorly.
 */
function replaceTextareasInClone(clonedDoc) {
  clonedDoc.querySelectorAll("textarea").forEach((ta) => {
    const div = clonedDoc.createElement("div");
    const cs = ta.ownerDocument.defaultView.getComputedStyle(ta);
    div.style.cssText = [
      `font-family:${cs.fontFamily}`,
      `font-size:${cs.fontSize}`,
      `font-weight:${cs.fontWeight}`,
      `line-height:${cs.lineHeight}`,
      `color:${cs.color}`,
      `text-indent:${cs.textIndent}`,  
      `padding:${cs.padding}`,
      `margin:${cs.margin}`,
      `width:${cs.width}`,
      `white-space:pre-wrap`,
      `word-break:break-all`,
      `overflow-wrap:break-word`,
    ].join(";");
    div.textContent = ta.value;
    ta.parentNode.replaceChild(div, ta);
  });
}

/**
 * Capture all elements with [data-pdf-page] inside `container`
 * and return a PDF Blob.
 */
export default async function capturePagesToPDF(container) {
  const pages = container.querySelectorAll("[data-pdf-page]");
  if (pages.length === 0) throw new Error("No pages found");

  const A4_W = 595.28; // pt
  const A4_H = 841.89; // pt

  const pdf = new jsPDF({ unit: "pt", format: "a4" });

  for (let i = 0; i < pages.length; i++) {
    const el = pages[i];

    // hide print:hidden elements temporarily
    const hiddenEls = el.querySelectorAll(".print\\:hidden");
    hiddenEls.forEach((h) => (h.style.display = "none"));

    const canvas = await html2canvas(el, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      height: el.offsetHeight,
      windowHeight: el.offsetHeight,
      onclone: (_doc, clonedEl) => {
        replaceTextareasInClone(clonedEl.ownerDocument);
      },
    });

    // restore hidden elements
    hiddenEls.forEach((h) => (h.style.display = ""));

    const imgData = canvas.toDataURL("image/jpeg", 0.75);
    const imgW = A4_W;
    const imgH = (canvas.height / canvas.width) * A4_W;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, imgW, Math.min(imgH, A4_H));
  }

  return pdf.output("blob");
}
