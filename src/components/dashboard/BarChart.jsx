import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../common/Card';
import { useDashboardMonthlyCount } from '../../hooks/useDashboardMonthlyCount';

const BAR_COLORS = [
  'rgb(205, 234, 255)', 'rgb(15, 117, 188)', 'rgb(142, 152, 168)',
  'rgb(33, 63, 154)', 'rgb(20, 38, 92)', 'rgb(36, 150, 229)',
  'rgb(33, 63, 154)', 'rgb(222, 226, 240)', 'rgb(25, 47, 116)',
  'rgb(186, 195, 224)', 'rgb(135, 194, 236)', 'rgb(233, 236, 245)',
];

function buildYTicks(max) {
  if (max <= 0) return [10, 8, 6, 4, 2, 0];
  const niceMax = (() => {
    const exp = Math.pow(10, Math.floor(Math.log10(max)));
    const n = max / exp;
    if (n <= 1) return 1 * exp;
    if (n <= 2) return 2 * exp;
    if (n <= 5) return 5 * exp;
    return 10 * exp;
  })();
  const step = niceMax / 5;
  return [5, 4, 3, 2, 1, 0].map((i) => i * step);
}

function formatTick(v) {
  if (v === 0) return '0';
  if (v >= 1000) return `${+(v / 1000).toFixed(1)}K`;
  return String(v);
}

export default function BarChart({ year = new Date().getFullYear() }) {
  const { data, loading, error } = useDashboardMonthlyCount(year);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setMounted(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.10 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const months = useMemo(() => {
    return data.map((m, i) => ({ ...m, color: BAR_COLORS[i % BAR_COLORS.length] }));
  }, [data]);

  const maxValue = useMemo(
    () => months.reduce((acc, m) => Math.max(acc, m.value), 0),
    [months]
  );
  const yTicks = useMemo(() => buildYTicks(maxValue), [maxValue]);
  const chartMax = yTicks[0] || 1;

  return (
    <div ref={rootRef}>
    <Card className="h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        ຈຳນວນເອກະສານຕໍ່ເດືອນ <span className="font-bold">{year}</span>
      </h3>

      {error && <div className="text-center text-sm text-red-500 py-16">ໂຫລດຂໍ້ມູນບໍ່ສຳເລັດ</div>}
      {!error && (loading || months.length === 0) && (
        <div className="flex gap-3">
          <div className="flex flex-col justify-between h-64 pr-1 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-3 w-6 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
          <div className="flex-1">
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-end justify-between gap-3 px-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const heights = [40, 65, 30, 80, 55, 70, 45, 90, 35, 60, 50, 75];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full rounded-t bg-gray-100 animate-pulse"
                        style={{ height: `${heights[i]}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between gap-3 px-2 mt-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 flex justify-center">
                  <div className="h-3 w-8 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && months.length > 0 && (
      <div className="flex gap-3">
        <div className="flex flex-col justify-between h-64 text-xs text-gray-500 pr-1">
          {yTicks.map((t, i) => (
            <span key={i}>{formatTick(t)}</span>
          ))}
        </div>

        <div className="flex-1">
          <div className="relative h-64">
            {yTicks.map((t, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-gray-100"
                style={{ top: `${(i / (yTicks.length - 1)) * 100}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end justify-between gap-3 px-2">
              {months.map((m, i) => {
                const h = chartMax > 0 ? (m.value / chartMax) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span
                      className="text-[10px] text-gray-700 font-medium mb-1 tabular-nums transition-opacity duration-500"
                      style={{
                        opacity: mounted ? 1 : 0,
                        transitionDelay: `${600 + i * 60}ms`,
                      }}
                    >
                      {m.value.toLocaleString()}
                    </span>
                    <div
                      className="w-full rounded-t ease-out"
                      style={{
                        height: mounted ? `${h}%` : '0%',
                        backgroundColor: m.color,
                        transition: 'height 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                        transitionDelay: `${i * 60}ms`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between gap-3 px-2 mt-2 text-xs text-gray-600">
            {months.map((m, i) => (
              <span key={i} className="flex-1 text-center">{m.label}</span>
            ))}
          </div>
        </div>
      </div>
      )}
    </Card>
    </div>
  );
}
