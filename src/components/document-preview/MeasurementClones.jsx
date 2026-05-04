import BelowBody from "./BelowBody";
import ClosingContent from "./ClosingContent";

const OFFSCREEN_STYLE = {
  position: "absolute",
  left: "-9999px",
  top: 0,
  visibility: "hidden",
  pointerEvents: "none",
  width: "174mm",
  fontFamily: "'TimesDoc', 'Phetsarath', sans-serif",
};

export default function MeasurementClones({
  measureRef,
  belowBodyMeasureRef,
  closingMeasureRef,
  belowBodyProps,
  closingProps,
}) {
  return (
    <>
      <div
        ref={measureRef}
        aria-hidden="true"
        className="print:hidden"
        style={{ position: "absolute", left: "-9999px", top: 0, visibility: "hidden", pointerEvents: "none" }}
      />
      <div
        ref={belowBodyMeasureRef}
        aria-hidden="true"
        className="print:hidden text-sm text-gray-800 space-y-0.5 leading-relaxed"
        style={OFFSCREEN_STYLE}
      >
        <BelowBody {...belowBodyProps} interactive={false} />
      </div>
      <div
        ref={closingMeasureRef}
        aria-hidden="true"
        className="print:hidden text-sm text-gray-800 space-y-0.5 leading-relaxed"
        style={OFFSCREEN_STYLE}
      >
        <ClosingContent {...closingProps} interactive={false} />
      </div>
    </>
  );
}
