import { createFileRoute } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Award, Beaker, Cog, GraduationCap, Lightbulb, X, ChevronLeft, ChevronRight } from "lucide-react";
import heroPlant from "@/assets/hero-plant.webp";
import pellets from "@/assets/pellets.webp";
import lab from "@/assets/lab.webp";
import extrusion from "@/assets/extrusion.webp";
import consultant from "@/assets/founder.webp";
import films from "@/assets/films.webp";
import engel from "@/assets/engel-tradeshow.webp";
import thermoformingChain from "@/assets/thermoforming-chain.webp";
import techExtrusion from "@/assets/tech-extrusion.webp";
import mwdCurves from "@/assets/mwd-curves.webp";
import fiberTech from "@/assets/fiber-tech.webp";
import image1 from "@/assets/image1.webp";
import image2 from "@/assets/image2.webp";
import image3 from "@/assets/image3.webp";
import image4 from "@/assets/image4.webp";
import image5 from "@/assets/image5.webp";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ----------------------------- helpers ----------------------------- */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function Counter({ to, suffix = "", duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    let frame = 0;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !started) {
          started = true;
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(to); return; }
          const start = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(to * eased));
            if (p < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        }
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [to, duration]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ----------------------------- data ----------------------------- */

const NAV = [
  { id: "about", label: "About" },
  { id: "expertise", label: "Expertise" },
  { id: "industries", label: "Industries" },
  { id: "publications", label: "Publications" },
  { id: "conferences", label: "Conferences" },
  { id: "why", label: "Why Us" },
  { id: "contact", label: "Contact" },
];

const EXPERTISE_PILLARS = [
  {
    id: "science",
    label: "Materials & Science",
    summary: "Structure, formulation, and performance from molecular scale to commercial resin.",
    icon: Beaker,
    items: [
      { t: "Polymer Science", d: "Structure–property correlation, morphology, and performance analysis across PE and PP systems." },
      { t: "Polyolefin Technology", d: "PE and PP synthesis, copolymer design, and process optimization from lab to plant." },
      { t: "Polymerization", d: "Reaction design, kinetics, and scale-up support from bench to commercial production." },
      { t: "Catalyst Selection", d: "Ziegler-Natta and metallocene systems tailored to product architecture and throughput." },
      { t: "Material Formulation", d: "Compound and blend engineering for targeted mechanical and processing outcomes." },
    ],
  },
  {
    id: "manufacturing",
    label: "Manufacturing & Process",
    summary: "Plant-floor optimization across molding, extrusion, and equipment selection.",
    icon: Cog,
    items: [
      { t: "Stabilization", d: "Antioxidant packages, UV protection, and tailored formulations for demanding service life." },
      { t: "Degradation Analysis", d: "Thermal, photo-oxidative, and mechanical degradation studies with lifetime prediction." },
      { t: "Injection Molding", d: "Process optimization, defect analysis, mold design guidance, and cycle refinement." },
      { t: "Extrusion", d: "Profile, film, and pipe extrusion troubleshooting, screw design and process scaling." },
      { t: "Machine Selection", d: "Objective specification and cost–profit modelling for capital equipment decisions." },
    ],
  },
  {
    id: "advisory",
    label: "Advisory & Development",
    summary: "End-to-end product development, failure investigation, and knowledge transfer.",
    icon: Lightbulb,
    items: [
      { t: "Product Development", d: "End-to-end development from resin selection through prototype validation." },
      { t: "Failure Analysis", d: "Root-cause investigation of field failures backed by laboratory evidence." },
      { t: "Training & Workshops", d: "Structured programs for engineering teams on polymer processing and reliability." },
      { t: "Scale-up Support", d: "De-risked transition from R&D trials to steady-state commercial operation." },
    ],
  },
] as const;

const INDUSTRIES = [
  { t: "Research & Development", img: lab },
  { t: "Packaging & Films", img: films },
  { t: "Automotive & Industrial", img: engel },
  { t: "Pipes & Fittings", img: extrusion },
  { t: "Consumer Goods", img: pellets },
  { t: "Agricultural Products", img: hero(heroPlant) },
];
function hero(x: string) { return x; }

const WHY = [
  { t: "Scientific Rigor", d: "Research-driven recommendations backed by analytical data, not intuition." },
  { t: "Industry Experience", d: "Decades inside commercial polyolefin operations across the Middle East and Asia." },
  { t: "Research-Based Solutions", d: "Peer-reviewed methodology applied to real production constraints." },
  { t: "Customized Consulting", d: "Every engagement is scoped to the client's product, process, and economics." },
  { t: "Confidentiality", d: "Discreet, professional partnership protecting client intellectual property." },
  { t: "Practical Depth", d: "Plant-floor troubleshooting experience across injection molding and extrusion." },
  { t: "International Exposure", d: "Continuous participation in the world's leading polymer conferences." },
];

const PUBLICATIONS = [
  { y: "2014", title: "Regulatory compliance of Products", where: "Xpressions, Xenel Group Magazine, 26th Issue, pp. 29–31", authors: "N. Ahmed, A. Karimi, F. Tamim" },
  { y: "2013", title: "Polypropylene — the material of choice", where: "Xpressions, Xenel Group Magazine, 22nd Issue, pp. 14–17", authors: "N. Ahmed" },
  { y: "2012", title: "Plastics and environment", where: "Xpressions, Xenel Group Magazine, 17th Issue, pp. 20–21", authors: "N. Ahmed" },
  { y: "2007", title: "Effect of weathering and reprocessing on recycled HDPE", where: "7th International Conference on Chemistry in Industry, Mar 23–25", authors: "N. Ahmed, M. N. Akhtar" },
  { y: "2006", title: "Recycling of HDPE bottle crates using the re-stabilization technique", where: "5th Middle East Refining & Petrochemicals Conference (PETROTECH), Jan 16–18", authors: "M. N. Akhtar, N. Ahmed" },
  { y: "2002", title: "Effect of recycling of thermoplastics: virgin & recycled HDPE mixtures", where: "Proceedings of the 6th Saudi Engineering Conference, Vol. 2, pp. 359–368", authors: "N. Ahmed, J. H. Khan" },
  { y: "2001", title: "Photo-oxidative degradation of recycled HDPE: chemical, thermal and mechanical property changes", where: "J. Mater. Sci. and Tech., Vol. 9, No. 3, pp. 153–164", authors: "J. H. Khan, N. Ahmed" },
  { y: "1999", title: "Thermal, Chemical and Mechanical Property Evaluation of Recycled-Reprocessed HDPE", where: "J. Polym. Mater., Vol. 16, pp. 341–345", authors: "N. Ahmed, J. H. Khan, I. Hussain, S. H. Hamid" },
  { y: "1999", title: "Performance Evaluation of New Chemical Soil Stabilizers", where: "Proceedings of the 5th Saudi Engineering Conference, Vol. 3, pp. 215–226", authors: "S. M. Lahalih, N. Ahmed" },
  { y: "1998", title: "Effect of New Soil Additives on the Compressive Strength of Dune Sands", where: "Construction and Building Materials, Vol. 12, No. 7, pp. 321–328", authors: "S. M. Lahalih, N. Ahmed" },
];

const CONFERENCES = [
  { y: "2015", items: ["Arabplast, Dubai — UAE"] },
  { y: "2014", items: ["US/Global Biocides Regulation Conference, Washington — USA", "Driving Business Through Research & Innovation, Dubai — UAE", "Chinaplas, Shanghai — China"] },
  { y: "2013", items: ["Arabplast, Dubai — UAE", "K-Show, Düsseldorf — Germany", "Mediplas, Birmingham — UK"] },
  { y: "2012", items: ["Chinaplas, Shanghai — China", "Flexible Packaging Middle East, Dubai — UAE"] },
  { y: "2011", items: ["Arabplast Summit, Dubai — UAE", "Middle East Plastic Pipe, Dubai — UAE", "EUROTECH / Equiplast, Barcelona — Spain", "GPCA Spring Conference, Abu Dhabi — UAE", "Plastic Packaging, Riyadh — Saudi Arabia"] },
  { y: "2010", items: ["Chinaplas, Shanghai — China", "Polyolefin Additives, Cologne — Germany"] },
  { y: "2009", items: ["Arabplast, Dubai — UAE", "PEPP, Zurich — Switzerland"] },
  { y: "2008", items: ["Multilayer Packaging Film, Cologne — Germany", "Polyolefin Thermoplastics: Advances and Innovations, Dhahran — Saudi Arabia"] },
  { y: "2007", items: ["K-Show, Düsseldorf — Germany", "Chemindix, Manama — Bahrain"] },
];

const HONORS_MEMBERSHIPS = [
  { t: "Life Member", org: "Pakistan Engineering Council", note: "Chartered professional standing" },
  { t: "Member", org: "Saudi Council of Engineers", note: "Registered engineering practitioner — KSA" },
];

const HONORS_ACADEMIC = [
  { t: "Research Assistantship", org: "M.S., King Fahd University of Petroleum and Minerals", note: "Awarded on academic merit" },
  { t: "University Scholarship", org: "B.E., N.E.D. University of Engineering & Technology", note: "Undergraduate merit award" },
  { t: "Government of Pakistan Scholarship", org: "Higher Secondary", note: "National merit scholarship" },
  { t: "Merit Scholarship", org: "Comilla Zila School", note: "Early-career academic distinction" },
];

const TIMELINE = [
  { y: "1984", h: "B.E. Mechanical Engineering", s: "N.E.D. University of Engineering and Technology, Karachi" },
  { y: "1984–1990", h: "Engineering Design (Mechanical Equipment)", s: "Karachi Shipyard and Engineering Works" },
  { y: "1993", h: "M.S. Mechanical Engineering", s: "King Fahd University of Petroleum and Minerals — Design Dynamics and Control" },
  { y: "1998–2014", h: "Industrial R&D and Consultancy", s: "Polyolefin research, stabilization, and commercial process optimization across the Gulf" },
  { y: "Today", h: "Zainab Polymer Consulting Services", s: "Independent consultancy for manufacturers and research centers worldwide" },
];

const TECH_LIBRARY = [
  {
    id: "fig-thermoforming",
    num: "Fig. 01",
    title: "Thermoforming Value Chain",
    category: "process" as const,
    img: thermoformingChain,
    desc: "PP supplier · sheet extrusion · thermoforming · packaging · end-user converting logistics",
  },
  {
    id: "fig-extrusion",
    num: "Fig. 02",
    title: "Extrusion — Screw & Die Architecture",
    category: "process" as const,
    img: techExtrusion,
    desc: "Blown film · cast film · downstream converting and melt filtration optimization",
  },
  {
    id: "fig-mwd",
    num: "Fig. 03",
    title: "Molecular Weight Distribution (MWD)",
    category: "science" as const,
    img: mwdCurves,
    desc: "Monomodal vs. bimodal grade selection and molecular weight design constraints",
  },
  {
    id: "fig-image3",
    num: "Fig. 04",
    title: "Melt Flow Rheology & Viscosity Profiling",
    category: "science" as const,
    img: image3,
    desc: "Shear thinning behavior and mechanical stability across PE and PP resin families",
  },
  {
    id: "fig-image4",
    num: "Fig. 05",
    title: "Crystalline Morphology & Thermal Kinetics",
    category: "science" as const,
    img: image4,
    desc: "Spherulite structure growth mapping under controlled thermal cooling rates",
  },
  {
    id: "fig-fiber",
    num: "Fig. 06",
    title: "Fibre Extrusion — BCF, CF & Melt-Blown",
    category: "process" as const,
    img: fiberTech,
    desc: "Spinneret geometry, quench cabinet dynamics, and nonwoven web laydown systems",
  },
  {
    id: "fig-image5",
    num: "Fig. 07",
    title: "BOPP Film Stenter Orientation Profiles",
    category: "process" as const,
    img: image5,
    desc: "Mechanical orientation in machine direction (MDO) and transverse direction (TDO)",
  },
];

/* ----------------------------- component ----------------------------- */

function Index() {
  useReveal();
  const scrolled = useScrolled(30);
  const [open, setOpen] = useState(false);
  const [techTab, setTechTab] = useState<"all" | "science" | "process">("all");
  const [diagramIndex, setDiagramIndex] = useState(0);
  const diagramTouchStart = useRef<number | null>(null);
  const diagrams = TECH_LIBRARY.filter((item) => techTab === "all" || item.category === techTab);
  const activeDiagram = diagrams[diagramIndex % diagrams.length];
  const moveDiagram = (direction: number) => setDiagramIndex((current) => (current + direction + diagrams.length) % diagrams.length);
  const [selectedImgIdx, setSelectedImgIdx] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isViewerOpen = selectedImgIdx !== null;
  useEffect(() => {
    if (!isViewerOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; previousFocus?.focus({ preventScroll: true }); };
  }, [isViewerOpen]);

  const nextImg = () => {
    if (selectedImgIdx !== null) {
      setSelectedImgIdx((selectedImgIdx + 1) % TECH_LIBRARY.length);
    }
  };

  const prevImg = () => {
    if (selectedImgIdx !== null) {
      setSelectedImgIdx((selectedImgIdx - 1 + TECH_LIBRARY.length) % TECH_LIBRARY.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImgIdx === null) return;
      if (e.key === "ArrowRight") nextImg();
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "Escape") setSelectedImgIdx(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImgIdx]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header
        className={
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 " +
          (scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-border shadow-[0_1px_0_rgba(15,23,42,0.04)]"
            : "bg-transparent")
        }
      >
        <div className="container-x site-header-inner flex items-center justify-between">
          <a href="#top" aria-label="Zainab Polymer Consulting Services — home" className="flex shrink-0 items-center gap-3 group rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4">
            <BrandLogo />
            <span className={"flex flex-col leading-none transition-colors duration-500 " + (scrolled ? "text-navy-deep" : "text-white")}>
              <span className="font-display text-[23px] font-normal tracking-[0.15em] uppercase">Zainab</span>
              <span className="text-[10px] tracking-[0.28em] uppercase opacity-70">Polymer Consulting</span>
            </span>
          </a>

          <nav className="hidden xl:flex items-center gap-5">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={
                  "text-[13px] font-medium tracking-wide transition-colors duration-300 " +
                  (scrolled ? "text-ink/70 hover:text-navy-deep" : "text-white/80 hover:text-white")
                }
              >
                {n.label}
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            className={
              "hidden md:inline-flex items-center gap-3 rounded-full border px-6 py-4 text-[12px] font-medium tracking-[0.15em] uppercase transition-all duration-300 " +
              (scrolled
                ? "border-navy-deep bg-navy-deep text-white hover:bg-ink"
                : "border-white/60 bg-white/5 text-white hover:bg-white/15")
            }
          >
            Schedule Consultation
            <span aria-hidden>→</span>
          </a>

          <button
            className={"xl:hidden rounded-sm p-2 " + (scrolled ? "text-navy-deep" : "text-white")}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
        {open && (
          <div id="mobile-navigation" className="xl:hidden bg-white border-t border-border max-h-[calc(100svh-104px)] overflow-y-auto" data-lenis-prevent>
            <div className="container-x py-4 flex flex-col gap-3">
              {NAV.map((n) => (
                <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className="py-2 text-[14px] text-ink/80">
                  {n.label}
                </a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)} className="mt-2 bg-navy-deep text-white px-5 py-3 text-[12px] tracking-[0.15em] uppercase text-center">
                Schedule Consultation
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="consulting-hero">
        <img src="/polymer-hero.webp" alt="Blue and clear polymer pellets spilling from a glass vessel" className="consulting-hero__image" fetchPriority="high" />
        <div className="consulting-hero__shade" />
        <div className="container-x consulting-hero__inner">
          <div className="consulting-hero__copy">
            <p className="consulting-hero__eyebrow">Est. 1993 · Global Practice</p>
            <h1 className="consulting-hero__title">Polyolefin technology<br className="hidden md:block" /> and plastics manufacturing <span>consultancy.</span></h1>
            <p className="consulting-hero__description">
              Helping manufacturers improve <strong>polymer performance</strong>, <strong>production efficiency</strong>, product quality and long-term process reliability — through three decades of industrial expertise led by Engr. Neaz Ahmed.
            </p>
            <div className="consulting-hero__actions">
              <a href="#contact" className="consulting-hero__primary">Book a Consultation <span aria-hidden="true">→</span></a>
              <a href="#expertise" className="consulting-hero__secondary">Explore Expertise <span aria-hidden="true">↗</span></a>
            </div>
            <div className="consulting-hero__stats">
              {[
                { n: 30, s: "+", l: "Years of industry experience" },
                { n: 20, s: "+", l: "International conferences" },
                { n: 10, s: "+", l: "Publications & proceedings" },
                { n: 8, s: "", l: "Countries of practice" },
              ].map((k) => (
                <div key={k.l} className="consulting-hero__stat">
                  <div className="consulting-hero__number"><Counter to={k.n} suffix={k.s} /></div>
                  <div className="consulting-hero__label">{k.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="consulting-hero__annotation" aria-hidden="true">Science<br />Industry<br />A better tomorrow</div>

        </div>
      </section>
      {/* ABOUT */}
      <Section id="about" eyebrow="01 — Profile" title="Bridging Scientific Polymer Research & Industrial Practice.">
        <div className="grid lg:grid-cols-12 gap-14 items-start">
          <div className="lg:col-span-5 reveal flex flex-col gap-6 lg:self-stretch">
            <div className="image-zoom relative aspect-[4/5] shrink-0 bg-mist">
              <img src={consultant} alt="Engr. Neaz Ahmed in industrial environment" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-navy-deep/90 to-transparent">
                <div className="text-white">
                  <div className="font-display text-xl">Engr. Neaz Ahmed</div>
                  <div className="text-[11px] tracking-[0.22em] uppercase text-white/70 mt-1">Founder & Principal Consultant</div>
                </div>
              </div>
            </div>
            <div className="relative aspect-[3/2] overflow-hidden bg-mist lg:flex-1">
              <img
                src="/neaz-ahmed-portrait.webp"
                alt="Engr. Neaz Ahmed smiling while speaking on the phone"
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
              />
            </div>
          </div>

          <div className="lg:col-span-7 reveal">
            <p className="text-[17px] leading-[1.75] text-ink/85">
              Engr. Neaz Ahmed is a seasoned polymer expert specialising in polyolefin materials — polyethylene (PE) and
              polypropylene (PP) — with extensive hands-on experience in polymerization techniques, material stabilization
              and degradation studies. His practice bridges academic research and industrial practice, helping companies
              improve product performance, processing efficiency and long-term material reliability.
            </p>

            <p className="mt-6 text-[15px] leading-[1.85] text-ink/70">
              Formally trained in mechanical engineering at N.E.D. University and King Fahd University of Petroleum and
              Minerals, his career has spanned research assistantships, industrial R&amp;D, and senior consulting engagements
              across the Gulf and beyond. He is bilingual in Urdu, English and Bengali — capable of handling bilateral technical
              engagements at a national level.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              {[
                { k: "Languages", v: "Urdu · English · Bengali" },
                { k: "Base", v: "Middle East & South Asia" },
                { k: "Practice", v: "Independent Consultancy" },
              ].map((x) => (
                <div key={x.k} className="border-t border-border pt-4">
                  <div className="eyebrow">{x.k}</div>
                  <div className="mt-2 text-[14px] text-ink/85">{x.v}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="mt-14">
              <div className="eyebrow mb-6">Career Timeline</div>
              <ol className="relative border-l border-border space-y-8">
                {TIMELINE.map((t) => (
                  <li key={t.y} className="relative pl-8 reveal">
                    <span className="absolute left-0 -translate-x-1/2 mt-1.5 h-3 w-3 rounded-full bg-navy-deep ring-4 ring-background" />
                    <div className="eyebrow text-navy-deep">{t.y}</div>
                    <div className="mt-1 font-display text-xl text-ink">{t.h}</div>
                    <div className="mt-1 text-[14px] text-ink/70">{t.s}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Section>

      {/* EXPERTISE */}
      <Section id="expertise" muted eyebrow="02 — Technical Specialization" title="Deep Engineering Competency Across the Polyolefin Value Chain.">
        <ExpertiseSection />
      </Section>

      {/* INDUSTRIES */}
      <Section id="industries" eyebrow="03 — Industrial Sectors" title="Strategic Technical Advisory Across Primary Plastic Industries.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIES.map((i, idx) => (
            <div key={i.t} className="reveal image-zoom relative aspect-[4/5] group cursor-pointer" style={{ transitionDelay: `${(idx % 3) * 80}ms` }}>
              <img src={i.img} alt={i.t} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="text-[11px] tracking-[0.25em] uppercase text-white/60">Industry {String(idx + 1).padStart(2, "0")}</div>
                <div className="mt-2 font-display text-2xl">{i.t}</div>
                <div className="mt-3 h-px w-8 bg-gold transition-all duration-500 group-hover:w-16" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* MANUFACTURING EXPERTISE / CASE */}
      <Section id="manufacturing" eyebrow="04 — Manufacturing & Process" title="Optimizing Injection Molding, Extrusion, & Machine Dynamics." muted>
        {/* Full-width horizontal images */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          <div className="image-zoom relative aspect-[16/10] bg-mist border border-border shadow-sm reveal">
            <img src={engel} alt="Engineers observing an ENGEL injection molding machine" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-navy-deep/80 to-transparent">
              <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-white/90">Converting & Molding Machinery</span>
            </div>
          </div>
          <div className="image-zoom relative aspect-[16/10] bg-mist border border-border shadow-sm reveal" style={{ transitionDelay: '100ms' }}>
            <img src={image1} alt="Process optimization parameters" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-navy-deep/80 to-transparent">
              <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-white/90">Process Parameters & Diagnostics</span>
            </div>
          </div>
        </div>

        {/* Text grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 reveal">
            <h3 className="font-display text-4xl md:text-5xl text-ink leading-[1.15]">
              Injection molding, extrusion and machine troubleshooting.
            </h3>
            <p className="mt-8 text-[16px] leading-[1.85] text-ink/70">
              From ENGEL injection molding lines to profile, film and pipe extrusion trains — our engagements deliver
              measurable improvements in defect rates, cycle time, and energy consumption without compromising the
              performance of the finished product.
            </p>
          </div>
          <div className="lg:col-span-5 reveal">
            <div className="border border-border p-8 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
              <div className="eyebrow mb-4">Case in brief — Small-Box PP Trial</div>
              <p className="text-[14px] text-ink/70 leading-relaxed">
                Revised barrel-zone temperatures on a PP small-box trial (Z1–Z5: 205 · 220 · 235 · 240 · 240 °C) reduced
                energy consumption without affecting the performance or quality of the final products.
              </p>
              <div className="mt-6 grid grid-cols-5 gap-2">
                {[205, 220, 235, 240, 240].map((v, i) => (
                  <div key={i} className="border border-border p-3 text-center bg-mist/30">
                    <div className="eyebrow text-[10px]">Z{i + 1}</div>
                    <div className="mt-1 font-display text-lg font-medium text-navy-deep tabular-nums">{v}°</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="technology" muted eyebrow="05 — Technical Diagrams" title="Scientific Models & Process Engineering Library.">
        <p className="library-intro">An interactive catalog of the process schematics, crystallization kinetics, molecular distributions, and orientation matrices we actively leverage during client engagements.</p>
        <div className="library-filters" role="group" aria-label="Filter technical diagrams">
          {([{ id: "all", label: "All Diagrams" }, { id: "science", label: "Material & Polymer Science" }, { id: "process", label: "Process & Converting" }] as const).map(tab => (
            <button key={tab.id} type="button" className="library-filter" aria-pressed={techTab === tab.id} aria-controls="technical-library-grid" onClick={() => { setTechTab(tab.id); setDiagramIndex(0); }}>{tab.label}</button>
          ))}
        </div>
        <div id="technical-library-grid" className="diagram-carousel" role="region" aria-roledescription="carousel" aria-label="Technical diagrams"
          onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); moveDiagram(event.key === "ArrowRight" ? 1 : -1); } }}
          onTouchStart={event => { diagramTouchStart.current = event.touches[0].clientX; }}
          onTouchEnd={event => { if (diagramTouchStart.current !== null) { const distance = event.changedTouches[0].clientX - diagramTouchStart.current; if (Math.abs(distance) > 60) moveDiagram(distance < 0 ? 1 : -1); } diagramTouchStart.current = null; }}>
          <article className="diagram-slide" aria-roledescription="slide" aria-label={`${diagramIndex + 1} of ${diagrams.length}`}>
            <button type="button" className="library-preview" aria-label={`Expand View: ${activeDiagram.title}`} onClick={() => setSelectedImgIdx(TECH_LIBRARY.findIndex(item => item.id === activeDiagram.id))}>
              <img src={activeDiagram.img} alt={activeDiagram.title} loading="lazy" decoding="async" />
              <span className="library-expand">Expand View <ArrowUpRight size={15} aria-hidden="true" /></span>
            </button>
            <div className="library-caption" aria-live="polite" aria-atomic="true">
              <div className="library-meta"><span>{activeDiagram.num}</span><span>{activeDiagram.category}</span></div>
              <h3>{activeDiagram.title}</h3><p>{activeDiagram.desc}</p>
            </div>
          </article>
          <div className="diagram-controls">
            <div className="diagram-dots" aria-label="Choose a diagram">{diagrams.map((item, index) => <button key={item.id} type="button" aria-label={`Show ${item.title}`} aria-current={index === diagramIndex ? "true" : undefined} onClick={() => setDiagramIndex(index)}><span /></button>)}</div>
            <div className="diagram-pagination"><span className="diagram-position">{String(diagramIndex + 1).padStart(2, "0")} / {String(diagrams.length).padStart(2, "0")}</span><button type="button" aria-label="Previous diagram" onClick={() => moveDiagram(-1)}><ChevronLeft size={20} /></button><button type="button" aria-label="Next diagram" onClick={() => moveDiagram(1)}><ChevronRight size={20} /></button></div>
          </div>
        </div>
      </Section>
      {/* ENERGY MEASUREMENT */}
      <Section id="energy" eyebrow="06 — Energy Profiling" title="Empirical Telemetry: Translating Electrical Load Into Efficiency.">
        <div className="energy-overview">
          <BrandLogo prominent />
          <p className="energy-description">
            We instrument production lines to profile real electrical demand — line by line, phase by phase. The output
            becomes the basis for objective decisions on set-points, machine selection and process re-design.
          </p>
          <div className="energy-metrics">
            <Stat k="Duration" v="~20 min" />
            <Stat k="Start" v="0.283 kWh" />
            <Stat k="End" v="11.419 kWh" />
            <div className="energy-total"><div className="font-display text-4xl text-navy-deep tabular-nums">11.136</div><div className="eyebrow mt-2">kWh consumed</div></div>
          </div>
        </div>
        <div className="energy-visuals">
          <div className="energy-telemetry">
            <div className="eyebrow mb-5 text-steel">Telemetry Setup</div>
            <img src={image2} alt="Energy measurement telemetry setup" className="w-full aspect-[16/9] object-contain" loading="lazy" />
            <p className="mt-5 text-[12px] leading-relaxed text-ink/60">
              Logging real-time motor current draw and heating band duty cycles during operational extrusion trials.
            </p>
          </div>
          <EnergyChart />
        </div>
      </Section>
      {/* PUBLICATIONS */}
      <Section id="publications" eyebrow="07 — Publications" title="Peer-Reviewed Research Papers, Patents, and Technical Articles." muted>
        <div className="border-t border-border">
          {PUBLICATIONS.map((p, i) => (
            <a
              key={i}
              href="#contact"
              className="group grid grid-cols-12 gap-6 py-8 border-b border-border reveal hover:bg-white transition-colors px-2 -mx-2"
              style={{ transitionDelay: `${(i % 5) * 40}ms` }}
            >
              <div className="col-span-2 md:col-span-1 font-display text-2xl text-navy-deep/60 tabular-nums group-hover:text-navy-deep transition-colors">
                {p.y}
              </div>
              <div className="col-span-10 md:col-span-8">
                <h4 className="font-display text-lg md:text-xl text-ink leading-snug group-hover:text-navy-deep">
                  {p.title}
                </h4>
                <p className="mt-2 text-[13px] text-ink/60">{p.authors}</p>
              </div>
              <div className="col-span-12 md:col-span-3 text-[12.5px] text-steel md:text-right">{p.where}</div>
            </a>
          ))}
        </div>
      </Section>

      {/* CONFERENCES */}
      <Section id="conferences" dark eyebrow="08 — Global Engagement" title="Continuous Academic & Technical Presence Across Four Continents.">
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/15" />
          <ol className="space-y-14">
            {CONFERENCES.map((c, i) => (
              <li key={c.y} className="relative grid md:grid-cols-2 gap-6 md:gap-16 reveal">
                <span className="absolute left-4 md:left-1/2 -translate-x-1/2 top-2 h-3 w-3 rounded-full bg-gold ring-4 ring-navy-deep" />
                <div className={"pl-12 md:pl-0 " + (i % 2 ? "md:text-left md:pl-16 md:order-2" : "md:text-right md:pr-16 md:order-1")}>
                  <div className="font-display text-5xl md:text-6xl text-white/90 tabular-nums">{c.y}</div>
                </div>
                <div className={"pl-12 md:pl-0 " + (i % 2 ? "md:pr-16 md:text-right md:order-1" : "md:pl-16 md:order-2")}>
                  <ul className="space-y-3">
                    {c.items.map((it) => (
                      <li key={it} className="text-[14px] text-white/75 leading-relaxed">{it}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="global-practice">
          <div className="global-practice-art">
            <img src="/global-practice-cutout.webp" alt="Matte blue desktop globe on a brushed metal stand" width={1254} height={1254} loading="lazy" decoding="async" />
            <div className="globe-flags reveal" role="group" aria-label="Countries of practice — illustrative globe pins">
              {[
                { name: "Germany", code: "de", x: 48, y: 24 },
                { name: "UAE", code: "ae", x: 66, y: 43 },
                { name: "USA", code: "us", x: 20, y: 35 },
                { name: "Saudi Arabia", code: "sa", x: 53, y: 48 },
                { name: "Spain", code: "es", x: 33, y: 32 },
                { name: "China", code: "cn", x: 77, y: 32 },
                { name: "Switzerland", code: "ch", x: 43, y: 37 },
                { name: "Bahrain", code: "bh", x: 60, y: 30 },
              ].map((country, index) => (
                <button key={country.code} type="button" className="globe-flag" aria-label={country.name}
                  style={{ left: `${country.x}%`, top: `${country.y}%`, animationDelay: `${index * 240}ms` }}>
                  <span className="globe-pin-head"><img src={`https://flagcdn.com/w80/${country.code}.png`} alt="" width={28} height={20} loading="lazy" /></span>
                  <span className="globe-country-name">{country.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="global-practice-content">
            <div className="global-practice-eyebrow">Countries of Practice</div>
            <h3>International perspective.<br /><span>Local understanding.</span></h3>
            <p className="globe-hint">Explore our countries of practice. Hover over or tap a flag.</p>
            <ul className="global-practice-countries">
              {[
                { name: "Germany", code: "de" },
                { name: "UAE", code: "ae" },
                { name: "USA", code: "us" },
                { name: "Saudi Arabia", code: "sa" },
                { name: "Spain", code: "es" },
                { name: "China", code: "cn" },
                { name: "Switzerland", code: "ch" },
                { name: "Bahrain", code: "bh" },
              ].map((country) => (
                <li key={country.code}>
                  <img src={`https://flagcdn.com/w80/${country.code}.png`} alt="" width={32} height={24} loading="lazy" />
                  <span>{country.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* WHY US */}
      <Section id="why" eyebrow="09 — Advisory Principles" title="Core Pillars of Our Technical Partnership & Consulting Value." muted>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY.map((w, i) => (
            <div key={w.t} className="group bg-white border border-border p-8 lift-card reveal" style={{ transitionDelay: `${(i % 3) * 60}ms` }}>
              <div className="flex items-center justify-between">
                <div className="font-display text-navy-deep/50 tabular-nums">{String(i + 1).padStart(2, "0")}</div>
                <div className="h-8 w-8 rounded-full border border-border grid place-items-center text-steel group-hover:bg-navy-deep group-hover:text-white group-hover:border-navy-deep transition-all">
                  <span className="text-[11px]">✓</span>
                </div>
              </div>
              <h3 className="mt-6 font-display text-xl text-ink">{w.t}</h3>
              <p className="mt-3 text-[14px] leading-[1.7] text-ink/65">{w.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* HONORS */}
      <Section id="honors" eyebrow="10 — Credentials" title="Professional Affiliations & High-Value Academic Honors.">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {[
            { icon: Award, label: "Professional Memberships", items: HONORS_MEMBERSHIPS },
            { icon: GraduationCap, label: "Academic Distinctions & Scholarships", items: HONORS_ACADEMIC },
          ].map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.label} className="reveal">
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                  <span className="grid h-12 w-12 place-items-center rounded-sm bg-navy-deep text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.4} />
                  </span>
                  <div>
                    <div className="eyebrow">Category</div>
                    <div className="font-display text-xl text-ink leading-tight mt-1">{group.label}</div>
                  </div>
                </div>
                <ul className="mt-2 divide-y divide-border">
                  {group.items.map((it) => (
                    <li key={it.t + it.org} className="group grid grid-cols-12 gap-4 py-5 hover:bg-mist/50 transition-colors px-1 -mx-1">
                      <div className="col-span-1 pt-1">
                        <span className="block h-2 w-2 rounded-full bg-gold ring-4 ring-gold/10" />
                      </div>
                      <div className="col-span-11">
                        <div className="font-display text-[17px] text-ink leading-snug group-hover:text-navy-deep transition-colors">
                          {it.t}
                        </div>
                        <div className="mt-1 text-[13.5px] text-ink/70">{it.org}</div>
                        <div className="mt-1 text-[11.5px] tracking-[0.16em] uppercase text-steel">{it.note}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      {/* CTA */}
      <section className="relative bg-navy-deep text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src={pellets} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/60" />
        <div className="relative container-x py-28 md:py-40 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 reveal">
            <div className="eyebrow text-white/60 mb-6">Ready to engage</div>
            <h2 className="font-display text-4xl md:text-6xl font-semibold leading-[1.15] tracking-tight text-balance">
              Need <span className="keyword-accent keyword-accent--dark">expert guidance</span> for your polymer manufacturing process?
            </h2>
            <p className="mt-8 max-w-2xl text-[16px] leading-[1.8] text-white/70">
              Whether you're optimising production, improving material performance, troubleshooting manufacturing issues,
              or developing new polymer solutions — we provide research-driven consultancy tailored to your objectives.
            </p>
          </div>
          <div className="lg:col-span-4 reveal lg:justify-self-end">
            <a href="#contact" className="inline-flex items-center gap-3 bg-white text-navy-deep px-10 py-5 text-[12px] tracking-[0.22em] uppercase font-medium hover:bg-mist transition-all">
              Book Consultation
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <Section id="contact" eyebrow="11 — Consultation" title="Initiate a Secure, High-Value Engagement.">
        <div className="grid lg:grid-cols-12 gap-14">
          <div className="lg:col-span-5 reveal space-y-8">
            <div>
              <div className="eyebrow">Consultancy</div>
              <div className="mt-2 font-display text-2xl text-ink">Zainab Polymer Consulting Services</div>
              <div className="text-[13px] text-ink/60">Engr. Neaz Ahmed · Principal Consultant</div>
            </div>
            {[
              { k: "Email", v: "consult@zainabpolymer.com" },
              { k: "Phone", v: "Available upon request" },
              { k: "Base", v: "Karachi, Pakistan · Serving clients globally" },
              { k: "LinkedIn", v: "Available upon request" },
              { k: "Business Hours", v: "Mon – Sat · 9:00 – 18:00 (PKT)" },
            ].map((r) => (
              <div key={r.k} className="border-t border-border pt-4">
                <div className="eyebrow">{r.k}</div>
                <div className="mt-2 text-[15px] text-ink/85">{r.v}</div>
              </div>
            ))}
            <div className="aspect-[16/9] bg-mist border border-border grid place-items-center">
              <div className="text-center text-steel">
                <div className="eyebrow">Map</div>
                <div className="mt-2 text-[13px]">Location shared during engagement</div>
              </div>
            </div>
          </div>

          <form
            className="lg:col-span-7 reveal border border-border p-8 md:p-12 bg-white"
            onSubmit={(e) => { e.preventDefault(); alert("Thank you. We will respond within one business day."); }}
          >
            <div className="eyebrow">Request a consultation</div>
            <h3 className="mt-2 font-display text-3xl text-ink">Tell us about your project.</h3>

            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              <Field label="Full name" name="name" required />
              <Field label="Company" name="company" />
              <Field label="Email" name="email" type="email" required />
              <Field label="Country" name="country" />
            </div>
            <div className="mt-6">
              <Field label="Area of interest" name="topic" placeholder="e.g. HDPE stabilization, extrusion troubleshooting" />
            </div>
            <div className="mt-6">
              <label className="eyebrow block mb-3">Project brief</label>
              <textarea name="brief" rows={5} className="w-full bg-transparent border-b border-border focus:border-navy-deep py-3 text-[15px] text-ink outline-none transition-colors" />
            </div>
            <button type="submit" className="mt-10 inline-flex items-center gap-3 bg-navy-deep text-white px-10 py-4 text-[12px] tracking-[0.22em] uppercase font-medium hover:bg-ink transition-all">
              Send Enquiry
              <span>→</span>
            </button>
          </form>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="bg-ink text-white/70">
        <div className="container-x py-16 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <a href="#top" aria-label="Zainab Polymer Consulting Services — home" className="inline-flex flex-col items-start gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4">
              <BrandLogo prominent />
              <span className="font-display text-white text-lg">Zainab Polymer Consulting Services</span>
            </a>
            <p className="mt-5 max-w-md text-[13.5px] leading-[1.8]">
              Independent consulting practice in polyolefin technology, polymer science and plastics manufacturing —
              led by Engr. Neaz Ahmed.
            </p>
          </div>
          <div>
            <div className="eyebrow text-white/50">Quick Links</div>
            <ul className="mt-5 space-y-2 text-[13.5px]">
              {NAV.map((n) => <li key={n.id}><a href={`#${n.id}`} className="hover:text-white transition-colors">{n.label}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="eyebrow text-white/50">Services</div>
            <ul className="mt-5 space-y-2 text-[13.5px]">
              <li>Polyolefin Technology</li>
              <li>Stabilization & Degradation</li>
              <li>Injection Molding</li>
              <li>Extrusion Systems</li>
              <li>Failure Analysis</li>
              <li>Training & Workshops</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container-x py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-white/50">
            <div>© {new Date().getFullYear()} Zainab Polymer Consulting Services. All rights reserved.</div>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:text-white">LinkedIn</a>
              <a href="#" className="hover:text-white">Email</a>
              <a href="#top" className="hover:text-white">Back to top ↑</a>
            </div>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX MODAL */}
      {selectedImgIdx !== null && (
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Technical diagram viewer" tabIndex={-1} data-lenis-prevent
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
            if (!buttons?.length) return;
            const first = buttons[0], last = buttons[buttons.length - 1];
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }}
          className="fixed inset-0 z-[100] flex flex-col justify-between overflow-y-auto bg-navy-deep/98 text-white p-4 md:p-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-medium">
                {TECH_LIBRARY[selectedImgIdx].num} · {TECH_LIBRARY[selectedImgIdx].category}
              </span>
              <h3 className="font-display text-xl md:text-2xl mt-1 text-white leading-tight">
                {TECH_LIBRARY[selectedImgIdx].title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedImgIdx(null)}
              className="h-10 w-10 border border-white/10 hover:border-gold hover:text-gold transition-colors flex items-center justify-center rounded-none cursor-pointer"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Stage */}
          <div className="relative flex-1 flex items-center justify-center py-6 md:py-10">
            {/* Prev Button */}
            <button
              onClick={prevImg}
              className="absolute left-0 md:left-4 z-10 h-12 w-12 border border-white/10 hover:border-gold hover:text-gold transition-colors flex items-center justify-center bg-navy-deep/50 backdrop-blur-sm rounded-none cursor-pointer"
              aria-label="Previous diagram"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Image Container */}
            <div className="max-w-5xl max-h-[60vh] md:max-h-[70vh] w-full h-full flex items-center justify-center p-4 bg-white border border-white/10 shadow-2xl rounded-none">
              <img
                src={TECH_LIBRARY[selectedImgIdx].img}
                alt={TECH_LIBRARY[selectedImgIdx].title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={nextImg}
              className="absolute right-0 md:right-4 z-10 h-12 w-12 border border-white/10 hover:border-gold hover:text-gold transition-colors flex items-center justify-center bg-navy-deep/50 backdrop-blur-sm rounded-none cursor-pointer"
              aria-label="Next diagram"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Footer Bar */}
          <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[13px] text-white/70">
            <p className="max-w-2xl leading-relaxed">{TECH_LIBRARY[selectedImgIdx].desc}</p>
            <div className="text-[11px] tracking-wider uppercase text-white/40 select-none">
              Use <kbd className="border border-white/20 px-1.5 py-0.5 bg-white/5">←</kbd> / <kbd className="border border-white/20 px-1.5 py-0.5 bg-white/5">→</kbd> keys to navigate · <kbd className="border border-white/20 px-1.5 py-0.5 bg-white/5">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- sub-components ----------------------------- */

function ExpertiseSection() {
  return (
    <div className="practice-list">
      {EXPERTISE_PILLARS.map((pillar, pillarIdx) => (
        <div key={pillar.id} className="practice-row">
          <div className="practice-heading">
            <div className="practice-kicker">Pillar {String(pillarIdx + 1).padStart(2, "0")}</div>
            <h3>{pillar.label}</h3>
            <p>{pillar.summary}</p>
            <span className="practice-count">{pillar.items.length} disciplines</span>
          </div>
          <div className="practice-services">
            {pillar.items.map((item, itemIdx) => (
              <div key={item.t} className="practice-service">
                <span className="practice-index">{String(itemIdx + 1).padStart(2, "0")}</span>
                <div><h4>{item.t}</h4><p>{item.d}</p></div>
              </div>
            ))}
            {pillar.id === "advisory" && (
              <a href="#contact" className="practice-custom">
                <span className="practice-kicker">Custom scope</span>
                <p>Every engagement is tailored to your product and process.</p>
                <span className="practice-link">Start a conversation <ArrowUpRight size={16} aria-hidden="true" /></span>
              </a>
            )}
          </div>
        </div>
      ))}
      <div className="practice-outro">
        <div>
          <p className="practice-outro-title">Fourteen disciplines. One integrated practice.</p>
          <p className="practice-outro-description">Engagements are scoped to your product, process, and commercial objectives — from single-issue troubleshooting to full program support.</p>
        </div>
        <a href="#contact" className="practice-button">Discuss your challenge <ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
    </div>
  );
}
const SECTION_KEYWORDS: Record<string, string> = {
  about: "Scientific Polymer Research",
  expertise: "Deep Engineering Competency",
  industries: "Technical Advisory",
  manufacturing: "Injection Molding, Extrusion",
  technology: "Process Engineering",
  energy: "Efficiency",
  publications: "Peer-Reviewed Research",
  conferences: "Four Continents",
  why: "Technical Partnership",
  honors: "Professional Affiliations",
  contact: "High-Value Engagement",
};

function SectionTitle({ title, id, dark }: { title: string; id: string; dark?: boolean }) {
  const keyword = SECTION_KEYWORDS[id];
  const start = keyword ? title.indexOf(keyword) : -1;
  if (start < 0) return <>{title}</>;
  return <>{title.slice(0, start)}<span className={"keyword-accent" + (dark ? " keyword-accent--dark" : "")}>{keyword}</span>{title.slice(start + keyword.length)}</>;
}

function Section({
  id, eyebrow: eye, title, children, dark, muted,
}: { id: string; eyebrow: string; title: string; children: React.ReactNode; dark?: boolean; muted?: boolean }) {
  return (
    <section
      id={id}
      className={
        "relative section-spacing " +
        (dark ? "bg-navy-deep text-white" : muted ? "bg-mist text-ink" : "bg-background text-ink")
      }
    >
      <div className="container-x">
        <div className="section-heading grid lg:grid-cols-12 items-end reveal">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-6 bg-gold shrink-0" />
              <div className={"text-[13px] md:text-[14px] tracking-[0.22em] uppercase font-semibold " + (dark ? "text-white/80" : "text-navy-deep")}>
                {eye}
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <h2 className={"font-display text-3xl md:text-[40px] lg:text-[46px] font-semibold leading-[1.18] tracking-tight text-balance " + (dark ? "text-white" : "text-ink")}>
              <SectionTitle title={title} id={id} dark={dark} />
            </h2>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-border pt-3">
      <div className="eyebrow">{k}</div>
      <div className="mt-1 font-display text-lg text-ink tabular-nums">{v}</div>
    </div>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="eyebrow block mb-3">{label}{required && <span className="text-gold ml-1">*</span>}</label>
      <input
        type={type} name={name} required={required} placeholder={placeholder}
        className="w-full bg-transparent border-b border-border focus:border-navy-deep py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-steel/60"
      />
    </div>
  );
}

function EnergyChart() {
  // Sample cumulative-energy curve derived from the document (0.283 → 11.419 kWh over 20 min)
  const points = [
    [0, 0.28], [2, 1.4], [4, 2.7], [6, 4.1], [8, 5.4],
    [10, 6.6], [12, 7.8], [14, 8.9], [16, 9.9], [18, 10.7], [20, 11.42],
  ] as const;
  const W = 720, H = 340, PAD = 44;
  const maxX = 20, maxY = 12;
  const x = (v: number) => PAD + (v / maxX) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / maxY) * (H - PAD * 2);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p[0])},${y(p[1])}`).join(" ");
  const area = `${path} L${x(maxX)},${y(0)} L${x(0)},${y(0)} Z`;

  return (
    <div className="border border-border bg-white p-6">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="eyebrow">Total energy — L1 connection</div>
          <div className="font-display text-xl mt-1 text-ink">Cumulative kWh · 20-minute window</div>
        </div>
        <div className="text-[11px] tracking-[0.22em] uppercase text-steel">Sample dataset</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.26 0.06 260)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="oklch(0.26 0.06 260)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 3, 6, 9, 12].map((t) => (
          <g key={t}>
            <line x1={PAD} x2={W - PAD} y1={y(t)} y2={y(t)} stroke="oklch(0.92 0.008 260)" strokeDasharray="2 4" />
            <text x={8} y={y(t) + 4} fontSize="11" fill="oklch(0.45 0.02 260)">{t}</text>
          </g>
        ))}
        {[0, 5, 10, 15, 20].map((t) => (
          <text key={t} x={x(t)} y={H - 16} fontSize="11" fill="oklch(0.45 0.02 260)" textAnchor="middle">{t}m</text>
        ))}
        <path d={area} fill="url(#g)" />
        <path d={path} fill="none" stroke="oklch(0.19 0.05 260)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(p[0])} cy={y(p[1])} r="3" fill="white" stroke="oklch(0.19 0.05 260)" strokeWidth="1.5" />
        ))}
        <circle cx={x(20)} cy={y(11.42)} r="6" fill="oklch(0.76 0.11 82)" />
      </svg>
    </div>
  );
}
