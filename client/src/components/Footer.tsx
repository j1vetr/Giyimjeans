import { Link } from 'wouter';
import { Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';
import polenLogo from '@assets/Polen-Sticker-1.pdf_1777239312980.png';

export function Footer() {
  const { data: allCategories = [] } = useCategories();
  const categories = allCategories
    .filter(c => (c.displayOrder ?? 0) < 100)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .slice(0, 6);

  return (
    <footer className="bg-[hsl(var(--polen-stone))] text-white py-16 lg:py-20 px-6" data-testid="footer">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-14">
          {/* Sol kolon: Logo + Tagline + Instagram + İletişim */}
          <div className="md:col-span-5 lg:col-span-5">
            <Link href="/" className="inline-block mb-6" data-testid="link-footer-logo">
              <img
                src={polenLogo}
                alt="Polen Stone — Doğal Taş & Mermer"
                className="h-[88px] w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-white/55 text-sm leading-relaxed mb-7 max-w-md">
              Türkiye'nin en zengin doğal taş mirasını modern mekânlara taşıyoruz. Mermer, granit,
              traverten ve oniks koleksiyonumuzla doğanın ihtişamını evinize getiriyoruz.
            </p>

            <a
              href="https://www.instagram.com/polenstonecom/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-white/75 hover:text-polen-orange transition-colors text-sm font-medium mb-7 group"
              data-testid="link-instagram-footer"
            >
              <span className="w-9 h-9 rounded-full border border-white/15 group-hover:border-polen-orange flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" strokeWidth={1.75} />
              </span>
              @polenstonecom
            </a>

            <ul className="space-y-3.5 text-sm text-white/65">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-polen-orange shrink-0 mt-0.5" strokeWidth={1.75} />
                <span data-testid="text-footer-address" className="leading-relaxed">
                  Yunus Emre, Barbaros Blv. 42 d,<br />
                  34791 Sancaktepe / İstanbul
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-polen-orange shrink-0" strokeWidth={1.75} />
                <a
                  href="tel:+905326956183"
                  className="hover:text-polen-orange transition-colors"
                  data-testid="link-footer-phone"
                >
                  0532 695 61 83
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-polen-orange shrink-0" strokeWidth={1.75} />
                <a
                  href="mailto:info@polenstone.com.tr"
                  className="hover:text-polen-orange transition-colors"
                  data-testid="link-footer-email"
                >
                  info@polenstone.com.tr
                </a>
              </li>
            </ul>
          </div>

          {/* Orta kolon: Mağaza & Kategoriler */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-xs font-semibold tracking-[0.22em] uppercase text-white/40 mb-6">
              Mağaza
            </h4>
            <ul className="space-y-3.5 text-sm text-white/70">
              <li>
                <Link href="/magaza" className="hover:text-polen-orange transition-colors" data-testid="link-footer-shop">
                  Tüm Ürünler
                </Link>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="hover:text-polen-orange transition-colors"
                    data-testid={`link-footer-cat-${cat.slug}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sağ kolon: Kurumsal & Yasal */}
          <div className="md:col-span-4 lg:col-span-4">
            <h4 className="text-xs font-semibold tracking-[0.22em] uppercase text-white/40 mb-6">
              Kurumsal & Yasal
            </h4>
            <ul className="space-y-3.5 text-sm text-white/70">
              <li>
                <Link href="/hakkimizda" className="hover:text-polen-orange transition-colors" data-testid="link-footer-about">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/siparis-takip" className="hover:text-polen-orange transition-colors" data-testid="link-footer-order-track">
                  Sipariş Takip
                </Link>
              </li>
              <li>
                <Link href="/teslimat-kosullari" className="hover:text-polen-orange transition-colors" data-testid="link-footer-delivery">
                  Teslimat Koşulları
                </Link>
              </li>
              <li>
                <Link href="/iptal-ve-iade" className="hover:text-polen-orange transition-colors" data-testid="link-footer-returns">
                  İptal ve İade
                </Link>
              </li>
              <li>
                <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-polen-orange transition-colors" data-testid="link-footer-distance-sales">
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="hover:text-polen-orange transition-colors" data-testid="link-footer-kvkk">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">© 2026 Polen Stone. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-2 text-xs text-white/35">
            <span>Geliştirici & Tasarım:</span>
            <a
              href="https://toov.com.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <img
                src="https://toov.com.tr/assets/toov_logo-DODYNPrj.png"
                alt="TOOV"
                className="h-4"
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
