import { useState, useEffect } from 'react';
import { X, Upload, Loader2, ImageIcon } from 'lucide-react';
import type { Category } from '../_shared/types';

export default function CategoryModal({ 
  category, 
  onClose, 
  onSave, 
  isSaving 
}: { 
  category: Category | null; 
  onClose: () => void; 
  onSave: (category: Partial<Category>) => void;
  isSaving: boolean;
}) {
  const generateSlug = (name: string) => {
    const turkishMap: { [key: string]: string } = {
      'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
      'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
    };
    return name
      .split('')
      .map(char => turkishMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const [formData, setFormData] = useState({
    name: category?.name || '',
    image: category?.image || '',
    displayOrder: category?.displayOrder || 0,
  });
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(category?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Dosya boyutu 10MB\'dan küçük olmalı');
        return;
      }
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  const removeImage = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = formData.image;
    
    if (pendingFile) {
      setIsUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('images', pendingFile);
        
        const response = await fetch('/api/admin/upload/categories', {
          method: 'POST',
          body: uploadFormData,
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Yükleme başarısız');
        
        const data = await response.json();
        imageUrl = data.urls[0];
      } catch (error) {
        setUploadError('Görsel yüklenirken hata oluştu');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    
    onSave({
      ...category,
      ...formData,
      image: imageUrl,
      slug: category?.slug || generateSlug(formData.name),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h3 className="text-xl font-semibold text-white">
            {category ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Kategori Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
              required
              data-testid="input-category-name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Kategori Görseli</label>
            
            {uploadError && (
              <div className="mb-3 p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-300 text-sm">
                {uploadError}
              </div>
            )}
            
            {previewUrl ? (
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Kategori görseli"
                  className="w-full h-40 object-cover rounded-lg border border-zinc-700"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="category-image-upload"
                  />
                  <label 
                    htmlFor="category-image-upload" 
                    className="text-sm text-zinc-400 hover:text-white cursor-pointer underline"
                  >
                    Değiştir
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-zinc-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="category-image-upload"
                  data-testid="input-category-image"
                />
                <label htmlFor="category-image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                  <p className="text-sm text-zinc-400">
                    Görsel yüklemek için <span className="text-white underline">tıklayın</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP (max 10MB)</p>
                </label>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Sıralama</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
              data-testid="input-category-order"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
              data-testid="button-save-category"
            >
              {isUploading ? 'Yükleniyor...' : isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

