import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, Package, BadgePercent, Star, Award, BarChart3, AlertTriangle, UserPlus, Loader2, Globe } from 'lucide-react';

export default function AnalyticsPanel() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  const fmtPrice = (n: number) => '₺' + new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const { data: kpi, isLoading: kpiLoading } = useQuery({
    queryKey: ['admin-analytics-kpi'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/kpi', { credentials: 'include' });
      return res.json();
    },
    refetchInterval: 60000,
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['admin-sales', period],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/sales?period=${period}`, { credentials: 'include' });
      return res.json();
    },
  });

  const { data: bestSellers, isLoading: bestSellersLoading } = useQuery({
    queryKey: ['admin-best-sellers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/best-sellers?limit=8', { credentials: 'include' });
      return res.json();
    },
  });

  const { data: statusBreakdown } = useQuery({
    queryKey: ['admin-status-breakdown'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/status-breakdown', { credentials: 'include' });
      return res.json();
    },
  });

  const { data: countryBreakdown } = useQuery({
    queryKey: ['admin-country-breakdown'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/country-breakdown', { credentials: 'include' });
      return res.json();
    },
  });

  const STATUS_META: Record<string, { label: string; color: string }> = {
    confirmed:  { label: 'Yeni Sipariş',  color: '#f97316' },
    pending:    { label: 'Beklemede',     color: '#f59e0b' },
    processing: { label: 'İşleniyor',    color: '#3b82f6' },
    shipped:    { label: 'Kargoda',      color: '#a855f7' },
    completed:  { label: 'Tamamlandı',   color: '#10b981' },
    cancelled:  { label: 'İptal',        color: '#ef4444' },
  };

  const totalOrders = (statusBreakdown || []).reduce((s: number, r: any) => s + r.count, 0);
  const maxBestRevenue = bestSellers?.length > 0 ? Math.max(...bestSellers.map((b: any) => b.revenue)) : 1;
  const maxSalesRev = salesData?.revenue?.length > 0 ? Math.max(...salesData.revenue, 1) : 1;
  const chartHeight = 180;

  const KpiCard = ({ icon: Icon, iconClass, label, value, sub, change, loading }: {
    icon: any; iconClass: string; label: string; value: string; sub?: string; change?: number; loading?: boolean;
  }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      )}
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign} iconClass="bg-emerald-500/10 text-emerald-400"
          label="Bu ay gelir" sub={kpi ? `Geçen ay: ${fmtPrice(kpi.lastMonth?.revenue || 0)}` : undefined}
          value={kpi ? fmtPrice(kpi.thisMonth?.revenue || 0) : '—'}
          change={kpi?.changes?.revenue}
          loading={kpiLoading}
        />
        <KpiCard
          icon={ShoppingBag} iconClass="bg-blue-500/10 text-blue-400"
          label="Bu ay sipariş" sub={kpi ? `Geçen ay: ${kpi.lastMonth?.orders || 0} sipariş` : undefined}
          value={kpi ? fmt(kpi.thisMonth?.orders || 0) : '—'}
          change={kpi?.changes?.orders}
          loading={kpiLoading}
        />
        <KpiCard
          icon={TrendingUp} iconClass="bg-purple-500/10 text-purple-400"
          label="Ortalama sepet" sub={kpi ? `Geçen ay: ${fmtPrice(kpi.lastMonth?.avgOrder || 0)}` : undefined}
          value={kpi ? fmtPrice(kpi.thisMonth?.avgOrder || 0) : '—'}
          change={kpi?.changes?.avgOrder}
          loading={kpiLoading}
        />
        <KpiCard
          icon={UserPlus} iconClass="bg-orange-500/10 text-orange-400"
          label="Yeni müşteri" sub={kpi ? `İptal oranı: %${(kpi.thisMonth?.cancelRate || 0).toFixed(1)}` : undefined}
          value={kpi ? fmt(kpi.thisMonth?.newCustomers || 0) : '—'}
          loading={kpiLoading}
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-white">Satış Grafiği</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Gelir ve sipariş dağılımı</p>
          </div>
          <div className="flex bg-zinc-800 rounded-lg p-0.5 gap-0.5">
            {(['day', 'week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === p ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                {p === 'day' ? '24 Saat' : p === 'week' ? 'Hafta' : p === 'month' ? '30 Gün' : 'Yıl'}
              </button>
            ))}
          </div>
        </div>

        {salesLoading ? (
          <div className="flex items-center justify-center" style={{ height: chartHeight + 40 }}>
            <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
          </div>
        ) : salesData?.labels?.length > 0 ? (
          <div>
            <div className="relative" style={{ height: chartHeight }}>
              {[0, 25, 50, 75, 100].map(pct => (
                <div key={pct} className="absolute w-full border-t border-zinc-800/60" style={{ bottom: `${pct}%` }}>
                  {pct > 0 && (
                    <span className="absolute right-0 -translate-y-1/2 text-[10px] text-zinc-600 pr-1 select-none">
                      {fmtPrice((maxSalesRev * pct) / 100)}
                    </span>
                  )}
                </div>
              ))}
              <div className="absolute inset-0 flex items-end gap-1 pr-14">
                {salesData.revenue.map((rev: number, i: number) => {
                  const h = maxSalesRev > 0 ? Math.max((rev / maxSalesRev) * 100, rev > 0 ? 2 : 0) : 0;
                  const isLast = i === salesData.revenue.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end group relative" style={{ height: '100%' }}>
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 cursor-default ${isLast ? 'bg-white' : 'bg-zinc-700 group-hover:bg-zinc-500'}`}
                        style={{ height: `${h}%`, minHeight: rev > 0 ? '4px' : '0' }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl z-20 pointer-events-none whitespace-nowrap">
                          <span className="text-white text-xs font-semibold">{fmtPrice(rev)}</span>
                          <span className="text-zinc-400 text-[10px]">{salesData.orders?.[i] || 0} sipariş</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-1 mt-2 pr-14">
              {salesData.labels.map((label: string, i: number) => (
                <div key={i} className="flex-1 text-center">
                  <span className="text-[9px] text-zinc-600 block truncate">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-zinc-800">
              <div>
                <p className="text-xs text-zinc-500">Toplam Gelir</p>
                <p className="text-sm font-semibold text-white">{fmtPrice(salesData.revenue.reduce((a: number, b: number) => a + b, 0))}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Toplam Sipariş</p>
                <p className="text-sm font-semibold text-white">{fmt(salesData.orders?.reduce((a: number, b: number) => a + b, 0) || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Ort. Sipariş Değeri</p>
                <p className="text-sm font-semibold text-white">
                  {(salesData.orders?.reduce((a: number, b: number) => a + b, 0) || 0) > 0
                    ? fmtPrice(salesData.revenue.reduce((a: number, b: number) => a + b, 0) / salesData.orders.reduce((a: number, b: number) => a + b, 0))
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-zinc-500 text-sm" style={{ height: chartHeight }}>
            Bu dönem için veri bulunamadı
          </div>
        )}
      </div>

      {/* Best sellers + Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Best sellers */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-white">En Çok Satan Ürünler</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Tüm zamanlar, satış adedine göre</p>
            </div>
            <Award className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="divide-y divide-zinc-800/60">
            {bestSellersLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div>
            ) : bestSellers?.filter((b: any) => b.totalSold > 0).length > 0 ? (
              bestSellers.filter((b: any) => b.totalSold > 0).map((item: any, index: number) => {
                const barPct = maxBestRevenue > 0 ? (item.revenue / maxBestRevenue) * 100 : 0;
                const rankColors = ['text-yellow-400', 'text-zinc-300', 'text-amber-600'];
                return (
                  <div key={item.product.id} className="flex items-center gap-3 px-6 py-3 hover:bg-zinc-800/40 transition-colors">
                    <span className={`w-5 text-xs font-bold text-center flex-shrink-0 ${rankColors[index] || 'text-zinc-600'}`}>
                      {index + 1}
                    </span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      {item.product.images?.[0]
                        ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-zinc-600" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-zinc-800 rounded-full h-1">
                          <div className="bg-white h-1 rounded-full transition-all" style={{ width: `${barPct}%` }} />
                        </div>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">{item.totalSold} adet</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-white">{fmtPrice(item.revenue)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-zinc-500 text-sm">Henüz satış verisi yok</div>
            )}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Sipariş Dağılımı</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Duruma göre tüm zamanlar</p>
            </div>
            <BarChart3 className="w-4 h-4 text-zinc-500" />
          </div>

          {statusBreakdown?.length > 0 && (
            <div className="flex justify-center py-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    return (statusBreakdown || []).map((r: any) => {
                      const pct = totalOrders > 0 ? (r.count / totalOrders) * 100 : 0;
                      const color = STATUS_META[r.status]?.color || '#71717a';
                      const el = (
                        <circle
                          key={r.status}
                          cx="50" cy="50" r="15.9"
                          fill="none"
                          stroke={color}
                          strokeWidth="31.8"
                          strokeDasharray={`${pct} ${100 - pct}`}
                          strokeDashoffset={-offset}
                        />
                      );
                      offset += pct;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-bold text-white">{totalOrders}</p>
                  <p className="text-[10px] text-zinc-500">sipariş</p>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 pb-4 space-y-2.5">
            {(statusBreakdown || []).map((r: any) => {
              const meta = STATUS_META[r.status] || { label: r.status, color: '#71717a' };
              const pct = totalOrders > 0 ? (r.count / totalOrders) * 100 : 0;
              return (
                <div key={r.status} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                  <span className="text-xs text-zinc-400 flex-1">{meta.label}</span>
                  <span className="text-xs font-semibold text-white">{r.count}</span>
                  <span className="text-[10px] text-zinc-600 w-8 text-right">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Country breakdown */}
      {countryBreakdown?.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Ülke Bazında Gelir</h3>
              <p className="text-xs text-zinc-500 mt-0.5">İptal edilen siparişler hariç</p>
            </div>
            <Globe className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Ülke</th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Sipariş</th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Gelir</th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {countryBreakdown.map((row: any) => {
                  const totalRevenue = countryBreakdown.reduce((s: number, r: any) => s + r.revenue, 0);
                  const share = totalRevenue > 0 ? (row.revenue / totalRevenue) * 100 : 0;
                  return (
                    <tr key={row.country} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Globe className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          <span className="text-sm text-white">{row.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-zinc-300">{row.count}</td>
                      <td className="px-6 py-3 text-right text-sm font-semibold text-white">{fmtPrice(row.revenue)}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-zinc-800 rounded-full h-1">
                            <div className="bg-zinc-400 h-1 rounded-full" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-xs text-zinc-500 w-8 text-right">{share.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


