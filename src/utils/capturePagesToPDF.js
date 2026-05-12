import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/**
 * แทน <textarea> เป็น <div> ใน cloned doc
 * (html2canvas render textarea ได้แย่)
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
 * วัด layout size (pre-transform) ของ SVG parent ในแต่ละ .doc-footer
 *
 * ใช้ offsetWidth/offsetHeight ไม่ใช้ getBoundingClientRect — เพราะต้องการ
 * ขนาดก่อนถูก transform: ตอน scaleY(0.5) ก็ยังคืน 120px เหมือนเดิม
 * เพื่อให้ scaleY บน .doc-footer ทำงานต่อปกติ (scale ทั้ง footer รวม text+icons)
 */
function measureFooterSVGs(liveContainer) {
  const result = [];
  liveContainer.querySelectorAll(".doc-footer").forEach((footer) => {
    const svg = footer.querySelector("svg");
    if (!svg) {
      result.push(null);
      return;
    }
    const svgParent = svg.parentElement;
    result.push({
      width: svgParent.offsetWidth,
      height: svgParent.offsetHeight,
    });
  });
  return result;
}

function measureHeaderDecos(liveContainer) {
  const result = [];
  liveContainer.querySelectorAll(".doc-header-deco").forEach((deco) => {
    result.push({
      width: deco.offsetWidth,
      height: deco.offsetHeight,
    });
  });
  return result;
}

function measureFooterBgs(liveContainer) {
  const result = [];
  liveContainer.querySelectorAll(".doc-footer-bg").forEach((bg) => {
    const img = bg.querySelector("img");
    if (!img) {
      result.push(null);
      return;
    }
    result.push({
      width: img.offsetWidth || bg.offsetWidth,
      height: img.offsetHeight || Math.round(bg.offsetHeight * 1.3),
    });
  });
  return result;
}

function fixFooterBgsInClone(clonedDoc, measurements) {
  const SVG_NS = "http://www.w3.org/2000/svg";
  clonedDoc.querySelectorAll(".doc-footer-bg").forEach((bg, idx) => {
    const m = measurements[idx];
    if (!m) return;
    const img = bg.querySelector("img");
    if (!img) return;

    const svg = clonedDoc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("width", `${m.width}`);
    svg.setAttribute("height", `${m.height}`);
    svg.setAttribute("viewBox", "0 0 595.28 100.58");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.display = "block";
    svg.style.overflow = "hidden";

    const defs = clonedDoc.createElementNS(SVG_NS, "defs");
    const mkGrad = (id, x1, y1, x2, y2) => {
      const g = clonedDoc.createElementNS(SVG_NS, "linearGradient");
      g.setAttribute("id", id);
      g.setAttribute("x1", x1);
      g.setAttribute("y1", y1);
      g.setAttribute("x2", x2);
      g.setAttribute("y2", y2);
      g.setAttribute("gradientUnits", "userSpaceOnUse");
      const stops = [
        ["0", "#11509e"],
        [".51", "#0574bb"],
        ["1", "#11509e"],
      ];
      stops.forEach(([off, col]) => {
        const s = clonedDoc.createElementNS(SVG_NS, "stop");
        s.setAttribute("offset", off);
        s.setAttribute("stop-color", col);
        g.appendChild(s);
      });
      return g;
    };
    defs.appendChild(mkGrad("pf-lg-1", "-2.67", "40.39", "595.71", "40.39"));
    defs.appendChild(mkGrad("pf-lg-2", "-2.23", "58.51", "601.63", "58.51"));
    svg.appendChild(defs);

    const mkPath = (d, fill) => {
      const p = clonedDoc.createElementNS(SVG_NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", fill);
      return p;
    };
    svg.appendChild(
      mkPath(
        "M-2.67,41.99v38.79h598.38V.04h-77.85c-15.64-.48-26.01,3.31-32.57,6.83-6.29,3.37-10.73,4.91-23.01,16.35-3.36,3.13-9.15,7.93-17.36,11.74,0,0-10.78,5.01-23.81,6.09-17.86,1.47-189.43,1.95-423.78.94Z",
        "url(#pf-lg-1)"
      )
    );
    svg.appendChild(
      mkPath(
        "M-1.32,50.3v38.79h598.38V8.34h-87.41c-3.63.2-7.75.75-12.17,1.93-14.53,3.88-24.24,12.41-29.29,17.7-4.2,4.3-9.94,9.17-17.51,13.19,0,0-13.1,6.96-29.5,8.26-20.72,1.65-190.1,2.28-422.51.88Z",
        "#ffff"
      )
    );
    svg.appendChild(
      mkPath(
        "M-2.23,57.89v42.69h602.93c.31-28.05.62-56.09.93-84.14h-89.58c-2.53,0-7.86.21-14.36,2.27-10.17,3.22-17.34,9.25-21.82,13.89-5.87,6.18-14.03,13-24.98,17.86,0,0-12,5.33-26.13,6.4-22.2,1.69-192.94,2.22-427.01,1.04Z",
        "url(#pf-lg-2)"
      )
    );

    img.parentNode.replaceChild(svg, img);
  });
}

function fixHeaderDecosInClone(clonedDoc, measurements) {
  const SVG_NS = "http://www.w3.org/2000/svg";
  clonedDoc.querySelectorAll(".doc-header-deco").forEach((deco, idx) => {
    const m = measurements[idx];
    if (!m) return;
    const img = deco.querySelector("img");
    if (!img) return;
    // แทน <img src=PageHeader.svg> ด้วย inline <svg> ใน clone เท่านั้น
    // (html2canvas render external SVG <img> ขนาด % ผิดเมื่ออยู่ใต้ transform)
    const svg = clonedDoc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("width", `${m.width}`);
    svg.setAttribute("height", `${m.height}`);
    svg.setAttribute("viewBox", "0 0 800 40");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.display = "block";
    svg.style.overflow = "hidden";
    const p1 = clonedDoc.createElementNS(SVG_NS, "path");
    p1.setAttribute("d", "M800 5 L170 5 L140 28 L0 28");
    p1.setAttribute("stroke", "#0F75BC");
    p1.setAttribute("stroke-width", "3");
    p1.setAttribute("fill", "none");
    const p2 = clonedDoc.createElementNS(SVG_NS, "path");
    p2.setAttribute("d", "M800 9 L172 9 L142 32 L0 32");
    p2.setAttribute("stroke", "#0F75BC");
    p2.setAttribute("stroke-width", "2");
    p2.setAttribute("fill", "none");
    svg.appendChild(p1);
    svg.appendChild(p2);
    img.parentNode.replaceChild(svg, img);
  });
}

/**
 * แก้ SVG ใน clone เท่านั้น — ไม่แตะ .doc-footer transform หรือ .h-30
 * (เพื่อให้ scaleY(scale) scale ทั้ง footer รวม text+icons เหมือน browser)
 *
 * 2 จุด:
 * 1. width/height="100%" → explicit pixel (html2canvas resolve % ผิดเมื่อ
 *    containing block อยู่ภายใต้ transform)
 * 2. viewBox "0 0 800 120" → "0 -5 800 125" + ลบ overflow-visible
 *    (html2canvas clip stroke ที่ bleed ขอบบน 4px ทิ้ง)
 */
function fixFooterSVGsInClone(clonedDoc, measurements) {
  clonedDoc.querySelectorAll(".doc-footer").forEach((footer, idx) => {
    const m = measurements[idx];
    if (!m) return;
    footer.querySelectorAll("svg").forEach((svg) => {
      svg.classList.remove("overflow-visible");
      svg.style.overflow = "hidden";
      svg.setAttribute("width", `${m.width}`);
      svg.setAttribute("height", `${m.height}`);
      svg.style.width = `${m.width}px`;
      svg.style.height = `${m.height}px`;
      const vb = svg.getAttribute("viewBox");
      if (vb === "0 0 800 120") {
        svg.setAttribute("viewBox", "0 -5 800 125");
      }
    });
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

    const hiddenEls = el.querySelectorAll(".print\\:hidden");
    hiddenEls.forEach((h) => (h.style.display = "none"));

    // วัด SVG parent size จาก live DOM (หลังจากซ่อน print:hidden)
    const svgMeasurements = measureFooterSVGs(el);
    const headerDecoMeasurements = measureHeaderDecos(el);
    const footerBgMeasurements = measureFooterBgs(el);

    const canvas = await html2canvas(el, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      height: el.offsetHeight,
      windowHeight: el.offsetHeight,
      onclone: (_doc, clonedEl) => {
        replaceTextareasInClone(clonedEl.ownerDocument);
        fixFooterSVGsInClone(clonedEl.ownerDocument, svgMeasurements);
        fixHeaderDecosInClone(clonedEl.ownerDocument, headerDecoMeasurements);
        fixFooterBgsInClone(clonedEl.ownerDocument, footerBgMeasurements);
      },
    });

    hiddenEls.forEach((h) => (h.style.display = ""));

    // PNG (lossless) กันเส้นโค้งคมๆ เบลอ
    const imgData = canvas.toDataURL("image/png");
    const imgW = A4_W;
    const imgH = (canvas.height / canvas.width) * A4_W;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, imgW, Math.min(imgH, A4_H));
  }

  return pdf.output("blob");
}
