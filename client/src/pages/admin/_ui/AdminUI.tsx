import { Loader2, Search } from 'lucide-react';
import type { ReactNode, ComponentType, InputHTMLAttributes } from 'react';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h2 className="text-[15px] font-semibold text-neutral-900">{title}</h2>
        {description && (
          <p className="text-[12px] text-neutral-500 mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-neutral-200 rounded-lg ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-10 h-10 text-neutral-300 mb-3" />}
      <p className="text-[14px] font-medium text-neutral-700">{title}</p>
      {description && (
        <p className="text-[12px] text-neutral-500 mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
}

export function LoadingState({ label = 'Yükleniyor…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-neutral-500 text-[13px] py-8">
      <Loader2 className="w-4 h-4 animate-spin" />
      {label}
    </div>
  );
}

export function SearchInput({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
      <input
        type="text"
        {...props}
        className="pl-8 pr-3 h-8 text-[13px] bg-white border border-neutral-200 rounded-md text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 w-64"
      />
    </div>
  );
}

export function PrimaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium bg-white text-neutral-700 border border-neutral-200 rounded-md hover:bg-neutral-50 disabled:opacity-50 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      {children}
    </div>
  );
}
