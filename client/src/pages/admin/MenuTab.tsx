import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, GripVertical, ExternalLink, Loader2, X, Menu, Tag, ChevronUp, ChevronDown } from 'lucide-react';
import type { Category } from './_shared/types';

interface MenuManagementPanelProps {
  categories: Category[];
}

interface MenuItemData {
  id: string;
  title: string;
  type: 'category' | 'link' | 'submenu';
  categoryId: string | null;
  url: string | null;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function MenuManagementPanel({ categories }: MenuManagementPanelProps) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'category' as 'category' | 'link' | 'submenu',
    categoryId: '',
    url: '',
    parentId: '',
    isActive: true,
    openInNewTab: false,
  });

  const { data: menuItems = [], isLoading } = useQuery<MenuItemData[]>({
    queryKey: ['admin', 'menu-items'],
    queryFn: async () => {
      const res = await fetch('/api/admin/menu-items', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch menu items');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          categoryId: data.categoryId || null,
          url: data.url || null,
          parentId: data.parentId || null,
          displayOrder: menuItems.length,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create menu item');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`/api/admin/menu-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          categoryId: data.categoryId || null,
          url: data.url || null,
          parentId: data.parentId || null,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update menu item');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/menu-items/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete menu item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; displayOrder: number }[]) => {
      const res = await fetch('/api/admin/menu-items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Failed to reorder menu items');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      title: '',
      type: 'category',
      categoryId: '',
      url: '',
      parentId: '',
      isActive: true,
      openInNewTab: false,
    });
  };

  const openEditModal = (item: MenuItemData) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      categoryId: item.categoryId || '',
      url: item.url || '',
      parentId: item.parentId || '',
      isActive: item.isActive,
      openInNewTab: item.openInNewTab,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const rootItems = menuItems.filter(item => !item.parentId);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rootItems.length) return;

    const reorderedItems = [...rootItems];
    [reorderedItems[index], reorderedItems[newIndex]] = [reorderedItems[newIndex], reorderedItems[index]];

    const updates = reorderedItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    reorderMutation.mutate(updates);
  };

  const rootItems = menuItems.filter(item => !item.parentId);
  const submenuParents = menuItems.filter(item => item.type === 'submenu' && !item.parentId);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'category': return 'Kategori';
      case 'link': return 'Link';
      case 'submenu': return 'Alt Menü';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Menü Yönetimi</h2>
          <p className="text-zinc-400 text-sm mt-1">Sitenin ana navigasyon menüsünü düzenleyin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          data-testid="button-add-menu-item"
        >
          <Plus className="w-5 h-5" />
          Yeni Öğe Ekle
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {rootItems.length === 0 ? (
          <div className="text-center py-12">
            <Menu className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Henüz menü öğesi eklenmemiş</p>
            <p className="text-zinc-500 text-sm mt-1">Yeni öğe ekleyerek menünüzü oluşturmaya başlayın</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {rootItems.map((item, index) => {
              const children = menuItems.filter(child => child.parentId === item.id);
              return (
                <div key={item.id}>
                  <div className="flex items-center gap-4 p-4 hover:bg-zinc-800/50">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0 || reorderMutation.isPending}
                        className="p-1 hover:bg-zinc-700 rounded disabled:opacity-30"
                        data-testid={`button-move-up-${item.id}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === rootItems.length - 1 || reorderMutation.isPending}
                        className="p-1 hover:bg-zinc-700 rounded disabled:opacity-30"
                        data-testid={`button-move-down-${item.id}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{item.title}</span>
                        {!item.isActive && (
                          <span className="px-2 py-0.5 bg-zinc-700 text-zinc-400 text-xs rounded">Pasif</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
                        <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs">{getTypeLabel(item.type)}</span>
                        {item.type === 'category' && item.category && (
                          <span>→ {item.category.name}</span>
                        )}
                        {item.type === 'link' && item.url && (
                          <span className="truncate">→ {item.url}</span>
                        )}
                        {item.type === 'submenu' && (
                          <span>({children.length} alt öğe)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                        data-testid={`button-edit-menu-${item.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Bu menü öğesini silmek istediğinize emin misiniz?')) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-2 hover:bg-red-900/50 rounded text-zinc-400 hover:text-red-400"
                        data-testid={`button-delete-menu-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {children.length > 0 && (
                    <div className="ml-12 border-l border-zinc-700">
                      {children.map((child) => (
                        <div key={child.id} className="flex items-center gap-4 p-4 pl-6 hover:bg-zinc-800/30">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-300">{child.title}</span>
                              {!child.isActive && (
                                <span className="px-2 py-0.5 bg-zinc-700 text-zinc-400 text-xs rounded">Pasif</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
                              <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs">{getTypeLabel(child.type)}</span>
                              {child.type === 'category' && child.category && (
                                <span>→ {child.category.name}</span>
                              )}
                              {child.type === 'link' && child.url && (
                                <span className="truncate">→ {child.url}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(child)}
                              className="p-2 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                              data-testid={`button-edit-submenu-${child.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Bu alt menü öğesini silmek istediğinize emin misiniz?')) {
                                  deleteMutation.mutate(child.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="p-2 hover:bg-red-900/50 rounded text-zinc-400 hover:text-red-400"
                              data-testid={`button-delete-submenu-${child.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Menü Öğesini Düzenle' : 'Yeni Menü Öğesi'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Başlık</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="Menüde görünecek başlık"
                  data-testid="input-menu-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Tür</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['category', 'link', 'submenu'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type, categoryId: '', url: '' })}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        formData.type === type
                          ? 'bg-white text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                      data-testid={`button-type-${type}`}
                    >
                      {getTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              {formData.type === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-white focus:ring-1 focus:ring-white"
                    data-testid="select-menu-category"
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">URL</label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-white focus:ring-1 focus:ring-white"
                    placeholder="https://example.com veya /sayfa"
                    data-testid="input-menu-url"
                  />
                </div>
              )}

              {formData.type === 'submenu' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-400">
                    Alt Menü türü bir dropdown oluşturur. Bu öğeyi oluşturduktan sonra, diğer öğeleri bu alt menünün altına ekleyebilirsiniz.
                  </p>
                </div>
              )}

              {formData.type !== 'submenu' && submenuParents.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Üst Menü (Opsiyonel)</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-white focus:ring-1 focus:ring-white"
                    data-testid="select-parent-menu"
                  >
                    <option value="">Ana menüde göster</option>
                    {submenuParents.filter(p => p.id !== editingItem?.id).map((parent) => (
                      <option key={parent.id} value={parent.id}>{parent.title}</option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">Bir alt menünün altında göstermek için seçin</p>
                </div>
              )}

              {formData.type !== 'submenu' && submenuParents.length === 0 && (
                <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                  <p className="text-sm text-zinc-400">
                    Alt menü öğesi eklemek için önce "Alt Menü" türünde bir öğe oluşturun.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 bg-zinc-700 border-zinc-600 rounded text-white focus:ring-white"
                    data-testid="checkbox-menu-active"
                  />
                  <span className="text-zinc-300">Aktif</span>
                </label>

                {formData.type === 'link' && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.openInNewTab}
                      onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                      className="w-5 h-5 bg-zinc-700 border-zinc-600 rounded text-white focus:ring-white"
                      data-testid="checkbox-new-tab"
                    />
                    <span className="text-zinc-300">Yeni sekmede aç</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  createMutation.isPending || 
                  updateMutation.isPending || 
                  !formData.title ||
                  (formData.type === 'category' && !formData.categoryId) ||
                  (formData.type === 'link' && !formData.url)
                }
                className="px-6 py-2.5 bg-white text-black rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                data-testid="button-save-menu-item"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingItem ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
