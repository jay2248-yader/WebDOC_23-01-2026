import { useEffect, useMemo, useRef, useState } from "react";
import { pack, hierarchy } from "d3-hierarchy";
import Card from "../common/Card";
import { useDashboardCategoryPercent } from "../../hooks/useDashboardCategoryPercent";

const WIDTH = 440;
const HEIGHT = 400;

const MOCK_DATA = [
  { label: "ໃບສະເໜີ", count: 1850, percent: 15.2 },
  { label: "ສັນຍາ", count: 1420, percent: 11.7 },
  { label: "ໃບຄຳຮ້ອງ", count: 1180, percent: 9.7 },
  { label: "ໃບລາພັກ", count: 960, percent: 7.9 },
  { label: "ໃບເບີກເງິນ", count: 820, percent: 6.7 },
  { label: "ໃບແຈ້ງການ", count: 740, percent: 6.1 },
  { label: "ບົດລາຍງານ", count: 680, percent: 5.6 },
  { label: "ຄຳສັ່ງ", count: 590, percent: 4.8 },
  { label: "ໜັງສືເຊີນ", count: 510, percent: 4.2 },
  { label: "ບັນທຶກ", count: 445, percent: 3.7 },
  { label: "ໃບຢັ້ງຢືນ", count: 390, percent: 3.2 },
  { label: "ໃບຮັບເງິນ", count: 340, percent: 2.8 },
  { label: "ແຜນງານ", count: 295, percent: 2.4 },
  { label: "ຂໍ້ຕົກລົງ", count: 260, percent: 2.1 },
  { label: "ໃບມອບສິດ", count: 225, percent: 1.8 },
  { label: "ໃບແຈ້ງໜີ້", count: 195, percent: 1.6 },
  { label: "ໃບສັ່ງຊື້", count: 175, percent: 1.4 },
  { label: "ໃບສົ່ງຂອງ", count: 155, percent: 1.3 },
  { label: "ໃບສະຫຼຸບ", count: 140, percent: 1.2 },
  { label: "ໃບອະນຸຍາດ", count: 125, percent: 1.0 },
  { label: "ບົດບັນທຶກປະຊຸມ", count: 110, percent: 0.9 },
  { label: "ໃບແຈ້ງໂອນ", count: 98, percent: 0.8 },
  { label: "ໃບສັ່ງວຽກ", count: 88, percent: 0.7 },
  { label: "ໃບປະເມີນ", count: 78, percent: 0.6 },
  { label: "ໃບຂໍອະນຸມັດ", count: 70, percent: 0.6 },
  { label: "ໃບຂໍຊື້", count: 62, percent: 0.5 },
  { label: "ໃບຕິດຕາມ", count: 55, percent: 0.5 },
  { label: "ໃບຮັບຮອງ", count: 48, percent: 0.4 },
  { label: "ໃບມອບໝາຍ", count: 42, percent: 0.3 },
  { label: "ໃບແຕ່ງຕັ້ງ", count: 37, percent: 0.3 },
  { label: "ໃບຖອນເງິນ", count: 33, percent: 0.3 },
  { label: "ໃບຊົດໃຊ້", count: 29, percent: 0.2 },
  { label: "ໃບຄືນເງິນ", count: 25, percent: 0.2 },
  { label: "ໃບຍົກເລີກ", count: 22, percent: 0.2 },
  { label: "ໃບແກ້ໄຂ", count: 19, percent: 0.2 },
  { label: "ໃບແຈ້ງຍ້າຍ", count: 16, percent: 0.1 },
  { label: "ໃບລາອອກ", count: 14, percent: 0.1 },
  { label: "ໃບປົດຕຳແໜ່ງ", count: 12, percent: 0.1 },
  { label: "ໃບຂໍທຶນ", count: 10, percent: 0.1 },
  { label: "ອື່ນໆ", count: 8, percent: 0.1 },
];

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function colorByLabel(label) {
  const h = 170 + (hashString(label) % 121);
  const s = 55 + (hashString(label + "s") % 30);
  const l = 45 + (hashString(label + "l") % 15);
  return `hsl(${h} ${s}% ${l}%)`;
}

function AnimatedBubbles({ nodes }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-md">
      {nodes.map((n, i) => {
        const color = colorByLabel(n.data.label);
        return (
          <g
            key={i}
            transform={`translate(${n.x},${n.y})`}
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 300ms ease-out",
              transitionDelay: `${i * 30}ms`,
            }}
          >
            <title>{`${n.data.label}: ${n.data.count} (${n.data.percent}%)`}</title>
            <circle
              r={mounted ? n.r : 0}
              fill={color}
              opacity={0.92}
              style={{
                transition: "r 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                transitionDelay: `${i * 30}ms`,
              }}
            />
            <text
              textAnchor="middle"
              dy="0.35em"
              fill="#fff"
              fontSize={Math.max(Math.min(n.r / 2.5, 14), 6)}
              fontWeight="600"
            >
              {n.data.percent}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function BubbleChart({ year = new Date().getFullYear(), mock = false }) {
  const { data: apiData, loading: apiLoading, error: apiError } = useDashboardCategoryPercent(mock ? null : year);
  const data = mock ? MOCK_DATA : apiData;
  const loading = mock ? false : apiLoading;
  const error = mock ? null : apiError;

  const [visible, setVisible] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const nodes = useMemo(() => {
    if (!data.length) return [];
    const root = hierarchy({ children: data }).sum((d) => d.count || 0.0001);
    const layout = pack().size([WIDTH, HEIGHT]).padding(4);
    return layout(root).leaves();
  }, [data]);

  return (
    <div ref={rootRef}>
    <Card className="h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        ຈຳນວນເອກະສານຕາມປະເພດ {year}
      </h3>

      <div className="flex justify-center min-h-75 items-center">
        {error && <span className="text-red-500 text-sm">ໂຫລດຂໍ້ມູນບໍ່ສຳເລັດ</span>}
        {!error && (loading || !data.length) && (
          <div className="w-full max-w-md flex justify-center items-center" style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}>
            <div className="relative w-[80%] aspect-square">
              <div className="absolute rounded-full bg-gray-100 animate-pulse" style={{ width: "55%", height: "55%", top: "10%", left: "8%" }} />
              <div className="absolute rounded-full bg-gray-100 animate-pulse" style={{ width: "38%", height: "38%", top: "12%", right: "5%" }} />
              <div className="absolute rounded-full bg-gray-100 animate-pulse" style={{ width: "30%", height: "30%", bottom: "8%", left: "20%" }} />
              <div className="absolute rounded-full bg-gray-100 animate-pulse" style={{ width: "22%", height: "22%", bottom: "10%", right: "18%" }} />
              <div className="absolute rounded-full bg-gray-100 animate-pulse" style={{ width: "16%", height: "16%", top: "55%", right: "5%" }} />
            </div>
          </div>
        )}
        {!error && !loading && data.length > 0 && visible && (
          <AnimatedBubbles nodes={nodes} />
        )}
      </div>

      {!error && (loading || !data.length) && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-100 animate-pulse shrink-0" />
              <span className="h-3 bg-gray-100 rounded animate-pulse flex-1" />
            </div>
          ))}
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
          {data.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-2 min-w-0"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 400ms ease-out, transform 400ms ease-out",
                transitionDelay: `${600 + i * 20}ms`,
              }}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: colorByLabel(c.label) }}
              />
              <span className="truncate text-gray-700">{c.label}</span>
              <span className="ml-auto shrink-0 text-gray-500 tabular-nums">
                {c.count.toLocaleString()} ({c.percent}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
    </div>
  );
}
