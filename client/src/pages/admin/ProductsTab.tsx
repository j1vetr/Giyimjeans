import { useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, Tag, Edit, Sparkles, Plus, Copy, Trash2 } from 'lucide-react';
import type { Product, Category } from './_shared/types';

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  allVariants: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setEditingProduct: (p: Product | null) => void;
  setShowProductModal: (b: boolean) => void;
  setShowBulkBadgeModal: (b: boolean) => void;
  setShowBulkPriceModal: (b: boolean) => void;
  setShowBulkAIModal: (b: boolean) => void;
  deleteProductMutation: { mutate: (id: string) => void };
}

export default function ProductsTab({
  products,
  categories,
  allVariants,
  searchQuery,
  setSearchQuery,
  setEditingProduct,
  setShowProductModal,
  setShowBulkBadgeModal,
  setShowBulkPriceModal,
  setShowBulkAIModal,
  deleteProductMutation,
}: ProductsTabProps) {
  const queryClient = useQueryClient();
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 w-64"
                    data-testid="input-search-products"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/admin/inventory/fix-variants', {
                          method: 'POST',
                          credentials: 'include',
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert(data.message);
                          queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
                        } else {
                          alert('Hata: ' + (data.error || 'Bilinmeyen hata'));
                        }
                      } catch (error) {
                        alert('Senkronizasyon başarısız');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors"
                    data-testid="button-sync-all-variants"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Bedenleri Senkronize Et
                  </button>
                  <button
                    onClick={() => setShowBulkBadgeModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-500 hover:to-red-500 transition-colors"
                    data-testid="button-bulk-badge"
                  >
                    <Tag className="w-4 h-4" />
                    Toplu Etiket
                  </button>
                  <button
                    onClick={() => setShowBulkPriceModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
                    data-testid="button-bulk-price"
                  >
                    <Edit className="w-4 h-4" />
                    Toplu Düzen
                  </button>
                  <button
                    onClick={() => setShowBulkAIModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-colors"
                    data-testid="button-bulk-ai"
                  >
                    <Sparkles className="w-4 h-4" />
                    Toplu AI Açıklama
                  </button>
                  <button
                    onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                    data-testid="button-add-product"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni Ürün
                  </button>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Ürün</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Kategori</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Fiyat</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Durum</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-t border-zinc-800 hover:bg-zinc-800/30" data-testid={`row-product-${product.id}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] && (
                              <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                            )}
                            <div>
                              <p className="font-medium text-white">{product.name}</p>
                              <div className="flex items-center gap-2 text-sm text-zinc-500">
                                {product.sku && <span className="text-purple-400 font-mono">{product.sku}</span>}
                                <span>{product.slug}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          <div className="flex flex-wrap gap-1">
                            {(product.categoryIds && product.categoryIds.length > 0
                              ? product.categoryIds.map(catId => categories.find(c => c.id === catId)?.name).filter(Boolean)
                              : [categories.find(c => c.id === product.categoryId)?.name]
                            ).filter(Boolean).map((name, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-zinc-800 rounded text-xs">{name}</span>
                            ))}
                            {!product.categoryId && (!product.categoryIds || product.categoryIds.length === 0) && '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white font-medium">{product.basePrice}₺</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {(() => {
                              const productVariants = allVariants.filter((v: any) => v.productId === product.id);
                              const totalStock = productVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
                              if (totalStock === 0 && productVariants.length > 0) {
                                return <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400">Stokta Yok</span>;
                              } else if (!product.isActive) {
                                return <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">Pasif</span>;
                              } else {
                                return <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400">Aktif</span>;
                              }
                            })()}
                            {product.isFeatured && (
                              <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">Öne Çıkan</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => { setEditingProduct(product); setShowProductModal(true); }}
                              className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white"
                              title="Düzenle"
                              data-testid={`button-edit-product-${product.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const duplicatedProduct = {
                                  ...product,
                                  id: undefined,
                                  name: `${product.name} (Kopya)`,
                                  slug: '',
                                  sku: product.sku ? `${product.sku}-KOPYA` : undefined,
                                };
                                setEditingProduct(duplicatedProduct as any);
                                setShowProductModal(true);
                              }}
                              className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white"
                              title="Kopyala"
                              data-testid={`button-copy-product-${product.id}`}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) deleteProductMutation.mutate(product.id); }}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                              title="Sil"
                              data-testid={`button-delete-product-${product.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                          Ürün bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
  );
}
