import type { SiteContent } from "./content-schema";
export const defaultContent: SiteContent = {
  version: 1,
  home: {
    title: "Polyolefin technology and plastics manufacturing",
    accent: "consultancy.",
    description:
      "Helping manufacturers improve polymer performance, production efficiency, product quality and long-term process reliability — through three decades of industrial expertise led by Engr. Neaz Ahmed.",
    years: 30,
    conferences: 20,
    publications: 10,
    image: "/polymer-hero.webp",
  },
  profile: {
    name: "Engr. Neaz Ahmed",
    role: "Founder & Principal Consultant",
    introduction:
      "Engr. Neaz Ahmed is a seasoned polymer expert specialising in polyolefin materials — polyethylene (PE) and polypropylene (PP) — with extensive hands-on experience in polymerization techniques, material stabilization and degradation studies. His practice bridges academic research and industrial practice, helping companies improve product performance, processing efficiency and long-term material reliability.",
    background:
      "Formally trained in mechanical engineering at N.E.D. University and King Fahd University of Petroleum and Minerals, his career has spanned research assistantships, industrial R&D, and senior consulting engagements across the Gulf and beyond. He is bilingual in Urdu, English and Bengali — capable of handling bilateral technical engagements at a national level.",
    languages: "Urdu · English · Bengali",
    region: "Middle East & South Asia",
    practice: "Independent Consultancy",
    image: "/founder.webp",
    secondImage: "/neaz-ahmed-portrait.webp",
  },
  contact: {
    company: "Zainab Polymer Consulting Services",
    email: "consult@zainabpolymer.com",
    phone: "Available upon request",
    location: "Bahria Town, Karachi, Pakistan",
    linkedIn: "",
    hours: "Mon – Sat · 9:00 – 18:00 (PKT)",
    footer:
      "Independent consulting practice in polyolefin technology, polymer science and plastics manufacturing — led by Engr. Neaz Ahmed.",
  },
  timeline: [
    {
      y: "1980–1984",
      h: "B.E. Mechanical Engineering",
      s: "N.E.D. University of Engineering and Technology, Karachi",
    },
    {
      y: "1984–1990",
      h: "Engineering Design (Mechanical Equipment)",
      s: "Karachi Shipyard and Engineering Works",
    },
    {
      y: "1990–1993",
      h: "M.S. Mechanical Engineering",
      s: "King Fahd University of Petroleum and Minerals — Design Dynamics and Control",
    },
    {
      y: "1993–2014",
      h: "Industrial R&D and Consultancy",
      s: "Polyolefin research, stabilization, and commercial process optimization across the Gulf",
    },
    {
      y: "Today",
      h: "Zainab Polymer Consulting Services",
      s: "Independent consultancy for manufacturers and research centers worldwide",
    },
  ],
  publications: [
    {
      y: "2014",
      title: "Regulatory compliance of Products",
      where: "Xpressions, Xenel Group Magazine, 26th Issue, pp. 29–31",
      authors: "N. Ahmed, A. Karimi, F. Tamim",
    },
    {
      y: "2013",
      title: "Polypropylene — the material of choice",
      where: "Xpressions, Xenel Group Magazine, 22nd Issue, pp. 14–17",
      authors: "N. Ahmed",
    },
    {
      y: "2012",
      title: "Plastics and environment",
      where: "Xpressions, Xenel Group Magazine, 17th Issue, pp. 20–21",
      authors: "N. Ahmed",
    },
    {
      y: "2007",
      title: "Effect of weathering and reprocessing on recycled HDPE",
      where: "7th International Conference on Chemistry in Industry, Mar 23–25",
      authors: "N. Ahmed, M. N. Akhtar",
    },
    {
      y: "2006",
      title: "Recycling of HDPE bottle crates using the re-stabilization technique",
      where: "5th Middle East Refining & Petrochemicals Conference (PETROTECH), Jan 16–18",
      authors: "M. N. Akhtar, N. Ahmed",
    },
    {
      y: "2002",
      title: "Effect of recycling of thermoplastics: virgin & recycled HDPE mixtures",
      where: "Proceedings of the 6th Saudi Engineering Conference, Vol. 2, pp. 359–368",
      authors: "N. Ahmed, J. H. Khan",
    },
    {
      y: "2001",
      title:
        "Photo-oxidative degradation of recycled HDPE: chemical, thermal and mechanical property changes",
      where: "J. Mater. Sci. and Tech., Vol. 9, No. 3, pp. 153–164",
      authors: "J. H. Khan, N. Ahmed",
    },
    {
      y: "1999",
      title: "Thermal, Chemical and Mechanical Property Evaluation of Recycled-Reprocessed HDPE",
      where: "J. Polym. Mater., Vol. 16, pp. 341–345",
      authors: "N. Ahmed, J. H. Khan, I. Hussain, S. H. Hamid",
    },
    {
      y: "1999",
      title: "Performance Evaluation of New Chemical Soil Stabilizers",
      where: "Proceedings of the 5th Saudi Engineering Conference, Vol. 3, pp. 215–226",
      authors: "S. M. Lahalih, N. Ahmed",
    },
    {
      y: "1998",
      title: "Effect of New Soil Additives on the Compressive Strength of Dune Sands",
      where: "Construction and Building Materials, Vol. 12, No. 7, pp. 321–328",
      authors: "S. M. Lahalih, N. Ahmed",
    },
  ],
  principles: [
    {
      t: "Scientific Rigor",
      d: "Research-driven recommendations backed by analytical data, not intuition.",
    },
    {
      t: "Industry Experience",
      d: "Decades inside commercial polyolefin operations across the Middle East and Asia.",
    },
    {
      t: "Research-Based Solutions",
      d: "Peer-reviewed methodology applied to real production constraints.",
    },
    {
      t: "Customized Consulting",
      d: "Every engagement is scoped to the client's product, process, and economics.",
    },
    {
      t: "Confidentiality",
      d: "Discreet, professional partnership protecting client intellectual property.",
    },
    {
      t: "Practical Depth",
      d: "Plant-floor troubleshooting experience across injection molding and extrusion.",
    },
    {
      t: "International Exposure",
      d: "Continuous participation in the world's leading polymer conferences.",
    },
  ],
  countries: [
    { name: "Germany", code: "de", x: 48, y: 24 },
    { name: "UAE", code: "ae", x: 66, y: 43 },
    { name: "USA", code: "us", x: 20, y: 35 },
    { name: "Saudi Arabia", code: "sa", x: 53, y: 48 },
    { name: "Spain", code: "es", x: 33, y: 32 },
    { name: "China", code: "cn", x: 77, y: 32 },
    { name: "Switzerland", code: "ch", x: 43, y: 37 },
    { name: "Bahrain", code: "bh", x: 60, y: 30 },
    { name: "Italy", code: "it", x: 38, y: 49 },
    { name: "Greece", code: "gr", x: 46, y: 59 },
    { name: "Turkey", code: "tr", x: 70, y: 57 },
    { name: "Qatar", code: "qa", x: 60, y: 64 },
    { name: "UK", code: "gb", x: 29, y: 20 },
    { name: "Belgium", code: "be", x: 38, y: 17 },
    { name: "France", code: "fr", x: 24, y: 49 },
    { name: "Singapore", code: "sg", x: 80, y: 47 },
  ],
};
