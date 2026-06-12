import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface SizeChart {
  id: string;
  columns: string[];
  rows: string[][];
}

const FALLBACK_CHART: SizeChart = {
  id: 'fallback',
  columns: ['Beden', 'Bel (cm)', 'Kalça (cm)', 'TR No', 'US No'],
  rows: [
    ['XS', '60–63', '86–89', '34', '24'],
    ['S', '64–67', '90–93', '36', '26'],
    ['M', '68–71', '94–97', '38', '28'],
    ['L', '72–75', '98–101', '40', '30'],
    ['XL', '76–79', '102–105', '42', '32'],
    ['XXL', '80–83', '106–109', '44', '34'],
  ],
};

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
}

export function SizeGuideModal({ isOpen, onClose, categoryId }: SizeGuideModalProps) {
  const { data: chart } = useQuery<SizeChart | null>({
    queryKey: ['size-chart-category', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const res = await fetch(`/api/size-charts/category/${categoryId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!categoryId && isOpen,
    staleTime: 10 * 60 * 1000,
  });

  const displayChart = chart ?? FALLBACK_CHART;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label="Beden Rehberi"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[111] w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-black/8 shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
              <h2 className="font-display text-xl tracking-wide text-black">Beden Rehberi</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center bg-black/6 hover:bg-black/12 transition-colors"
                aria-label="Kapat"
                data-testid="button-size-guide-close"
              >
                <X className="w-4 h-4 text-black/60" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-[12px] text-black/50 mb-5 leading-relaxed">
                Doğru bedeni bulmak için bel ve kalça ölçülerinizi alın. Ölçüleriniz iki beden arasındaysa büyük bedeni tercih edin.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse" data-testid="table-size-guide">
                  <thead>
                    <tr className="bg-stone-50">
                      {displayChart.columns.map((col, i) => (
                        <th
                          key={i}
                          className="text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-black/55 border border-black/8 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayChart.rows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`px-3 py-2.5 border border-black/8 ${
                              j === 0 ? 'font-semibold text-black' : 'text-black/65'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-black/35 mt-4">
                * Ölçüler vücut ölçülerinizi yansıtmaktadır, giysi ölçüleri değildir.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
