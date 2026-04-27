import { useState, useEffect } from 'react';
import { X, Loader2, ShoppingCart, DollarSign, Calendar, Package } from 'lucide-react';
import type { User } from '../_shared/types';

export default function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string | null;
    products: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${user.id}/stats`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [user.id]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h3 className="text-xl font-semibold text-white">Kullanıcı Detayı</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-white text-2xl font-bold">
              {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{user.firstName} {user.lastName}</p>
              <p className="text-zinc-400">{user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-500">Telefon</p>
              <p className="text-white">{user.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Kayıt Tarihi</p>
              <p className="text-white">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>

          {/* Order Stats */}
          {isLoading ? (
            <div className="text-center py-4 text-zinc-400">Yükleniyor...</div>
          ) : stats && (
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                  <p className="text-xs text-zinc-400">Toplam Sipariş</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{stats.totalSpent.toFixed(2)}₺</p>
                  <p className="text-xs text-zinc-400">Toplam Harcama</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-white">
                    {stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString('tr-TR') : '-'}
                  </p>
                  <p className="text-xs text-zinc-400">Son Sipariş</p>
                </div>
              </div>

              {stats.products.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Satın Alınan Ürünler</p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {stats.products.map((product, index) => (
                      <span key={index} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

