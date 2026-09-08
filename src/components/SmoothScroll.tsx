import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let destroy: (() => void) | undefined;
    const configure = async () => {
      destroy?.();
      destroy = undefined;
      if (preference.matches) return;
      const { default: Lenis } = await import("lenis");
      if (disposed || preference.matches || destroy) return;
      const lenis = new Lenis({ autoRaf: true, duration: 0.85, anchors: { offset: -104 }, syncTouch: false });
      let stopped = false;
      const observer = new MutationObserver(() => {
        const modalOpen = !!document.querySelector('[aria-modal="true"]');
        if (modalOpen === stopped) return;
        stopped = modalOpen;
        if (modalOpen) lenis.stop();
        else lenis.start();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      destroy = () => { observer.disconnect(); lenis.destroy(); };
    };
    void configure();
    preference.addEventListener("change", configure);
    return () => { disposed = true; destroy?.(); preference.removeEventListener("change", configure); };
  }, []);
  return null;
}
