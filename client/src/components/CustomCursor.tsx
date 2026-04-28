import { useEffect, useRef, useState } from 'react';

type CursorVariant = 'default' | 'hover' | 'cta';

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [label, setLabel] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const isNarrow = window.innerWidth < 1024;
    if (isCoarse || isNarrow) return;
    setEnabled(true);

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let raf = 0;

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
      }
    }

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    function findCursorTarget(start: HTMLElement | null) {
      let el: HTMLElement | null = start;
      let labelText = '';
      let v: CursorVariant = 'default';
      while (el && el !== document.body) {
        if (el.dataset?.cursorLabel && !labelText) labelText = el.dataset.cursorLabel;
        if (el.dataset?.cursor === 'cta') { v = 'cta'; break; }
        if (el.dataset?.cursor === 'hover') { v = 'hover'; break; }
        if (v === 'default' && (el.tagName === 'A' || el.tagName === 'BUTTON')) {
          v = 'hover';
        }
        el = el.parentElement;
      }
      return { v, labelText };
    }

    function onOver(e: MouseEvent) {
      const { v, labelText } = findCursorTarget(e.target as HTMLElement);
      setVariant(v);
      setLabel(labelText);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    document.documentElement.classList.add('has-custom-cursor');

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  if (!enabled) return null;

  const ringSize =
    variant === 'cta' ? 128 : variant === 'hover' ? 72 : 36;
  const ringBg =
    variant === 'cta'
      ? 'rgba(241,90,34,0.92)'
      : variant === 'hover'
      ? 'rgba(255,255,255,0.04)'
      : 'transparent';
  const ringBorder =
    variant === 'cta'
      ? '0px solid transparent'
      : variant === 'hover'
      ? '1px solid rgba(255,255,255,0.55)'
      : '1px solid rgba(255,255,255,0.35)';

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#fff',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9998] flex items-center justify-center"
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: '50%',
          background: ringBg,
          border: ringBorder,
          mixBlendMode: variant === 'cta' ? 'normal' : 'difference',
          transition:
            'width 320ms cubic-bezier(0.16,1,0.3,1), height 320ms cubic-bezier(0.16,1,0.3,1), background-color 240ms ease, border 240ms ease',
          willChange: 'transform, width, height',
        }}
      >
        {label && variant !== 'default' && (
          <span
            className="font-mono text-[9px] tracking-[0.22em] uppercase whitespace-nowrap"
            style={{ color: variant === 'cta' ? '#fff' : '#fff' }}
          >
            {label}
          </span>
        )}
      </div>
    </>
  );
}
