import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sparkles, Wand2, Loader2, CheckCircle2, XCircle, Check } from 'lucide-react';
import type { Product, Category } from './_shared/types';

export default function AIDescriptionsPanel({ products, categories }: { products: Product[], categories: Category[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [descriptionMode, setDescriptionMode] = useState<'empty' | 'overwrite'>('empty');
  const [selectedStyle, setSelectedStyle] = useState<string>('energetic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [results, setResults] = useState<Array<{ name: string; success: boolean; message: string }>>([]);
  const queryClient = useQueryClient();

  const styles = [
    { value: 'professional', label: 'Profesyonel' },
    { value: 'energetic', label: 'Enerjik' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'luxury', label: 'Lüks' },
    { value: 'natural', label: 'Doğal' },
  ];

  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'all' || 
      p.categoryId === selectedCategory || 
      (p.categoryIds && p.categoryIds.includes(selectedCategory));
    if (descriptionMode === 'empty') {
      return categoryMatch && (!p.description || p.description.trim() === '');
    }
    return categoryMatch;
  });

  const generateDescriptions = async () => {
    if (filteredProducts.length === 0) return;
    
    setIsGenerating(true);
    setProgress({ current: 0, total: filteredProducts.length, success: 0, failed: 0 });
    setResults([]);
    
    let successCount = 0;
    let failedCount = 0;
    const newResults: Array<{ name: string; success: boolean; message: string }> = [];

    for (let i = 0; i < filteredProducts.length; i++) {
      const product = filteredProducts[i];
      setProgress(prev => ({ ...prev, current: i + 1 }));
      
      try {
        const response = await fetch(`/api/admin/products/${product.id}/generate-description`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ style: selectedStyle }),
        });
        
        if (response.ok) {
          successCount++;
          newResults.push({ name: product.name, success: true, message: 'Açıklama oluşturuldu' });
        } else {
          failedCount++;
          newResults.push({ name: product.name, success: false, message: 'Hata oluştu' });
        }
      } catch (error) {
        failedCount++;
        newResults.push({ name: product.name, success: false, message: 'Bağlantı hatası' });
      }
      
      setProgress(prev => ({ ...prev, success: successCount, failed: failedCount }));
      setResults([...newResults]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsGenerating(false);
    queryClient.invalidateQueries({ queryKey: ['/api/products'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-amber-500" />
            AI Ürün Açıklamaları
          </h2>
          <p className="text-zinc-400 mt-1">Yapay zeka ile toplu ürün açıklaması oluşturun</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              disabled={isGenerating}
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Açıklama Modu</label>
            <div className="flex gap-2">
              <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                descriptionMode === 'empty' 
                  ? 'bg-amber-600/20 border-amber-600 text-amber-400' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}>
                <input
                  type="radio"
                  name="mode"
                  value="empty"
                  checked={descriptionMode === 'empty'}
                  onChange={() => setDescriptionMode('empty')}
                  className="sr-only"
                  disabled={isGenerating}
                />
                <span className="text-sm">Sadece Boşlar</span>
              </label>
              <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                descriptionMode === 'overwrite' 
                  ? 'bg-amber-600/20 border-amber-600 text-amber-400' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}>
                <input
                  type="radio"
                  name="mode"
                  value="overwrite"
                  checked={descriptionMode === 'overwrite'}
                  onChange={() => setDescriptionMode('overwrite')}
                  className="sr-only"
                  disabled={isGenerating}
                />
                <span className="text-sm">Üzerine Yaz</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Yazım Stili</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              disabled={isGenerating}
            >
              {styles.map(style => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-zinc-400">
            {filteredProducts.length} ürün seçildi
          </p>
          <button
            onClick={generateDescriptions}
            disabled={isGenerating || filteredProducts.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                İşleniyor... ({progress.current}/{progress.total})
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Açıklamaları Oluştur
              </>
            )}
          </button>
        </div>

        {isGenerating && (
          <div className="mt-6">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-emerald-400">{progress.success} başarılı</span>
              <span className="text-red-400">{progress.failed} başarısız</span>
            </div>
          </div>
        )}

        {results.length > 0 && !isGenerating && (
          <div className="mt-6 max-h-64 overflow-y-auto space-y-2">
            {results.map((result, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  result.success ? 'bg-emerald-500/10' : 'bg-red-500/10'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <span className="text-white text-sm truncate">{result.name}</span>
                <span className={`text-xs ml-auto ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

