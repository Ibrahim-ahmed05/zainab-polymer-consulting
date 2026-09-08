/** Preserve the supplied transparent artwork's square composition. */
export function BrandLogo({ prominent = false }: { prominent?: boolean }) {
  return (
    <img
      src="/zainab-polymer-mark.webp"
      alt="Zainab Polymer Consulting"
      width={1254}
      height={1254}
      loading={prominent ? "lazy" : "eager"}
      decoding="async"
      className={prominent ? "brand-logo brand-logo--prominent" : "brand-logo"}
    />
  );
}
