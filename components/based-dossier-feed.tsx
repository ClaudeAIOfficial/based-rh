"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Advanced1 from "@/components/ui/8bit-advanced1";
import TextTypewriter from "@/components/ui/the-typewriter";

type Dossier = {
  ticker: string;
  name: string;
  thesis: string;
};

const DOSSIERS: Dossier[] = [
  {
    ticker: "NVDA",
    name: "Nvidia",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A dominant supplier of strategic AI compute can become a single point of dependency for an entire industry. The dark-side thesis is not that scarcity alone is wrongdoing, but that scarce chips, proprietary software ecosystems, and extreme demand can create lock-in, pricing power, and a market where smaller builders have little room to negotiate. In this simulation, B.A.S.E.D. treats concentration of compute as concentration of influence: whoever controls the accelerators can indirectly shape which AI products get built, who gets access first, and how expensive progress becomes.",
  },
  {
    ticker: "SPY",
    name: "S&P 500 ETF",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Passive index ownership can make markets look diversified while concentrating enormous flows into the same largest companies. The darker thesis is structural: money enters because a company is large, the inflow can help keep it large, and the cycle can reward scale over discovery. B.A.S.E.D. flags the possibility that a market increasingly driven by index mechanics becomes less about selecting businesses and more about automatically feeding capital into whatever already dominates.",
  },
  {
    ticker: "SPCX",
    name: "SpaceX",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A private space-and-infrastructure giant can accumulate unusual leverage when communications, launch capacity, orbital access, and national-strategic infrastructure overlap. The risk thesis is that technical leadership can evolve into dependency: governments, companies, and users may rely on systems they do not control. B.A.S.E.D. classifies that dependence as a power imbalance rather than an accusation of misconduct, especially when critical infrastructure is concentrated in a private operator.",
  },
  {
    ticker: "GME",
    name: "GameStop",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A legacy retail business tied to intense speculative attention can become less a normal equity and more a battlefield between narrative, liquidity, short positioning, and social momentum. The risk is that price can detach from ordinary business signals, making retail participants vulnerable to violent reversals. B.A.S.E.D. treats the ticker as an example of how market structure and online coordination can turn ownership into a reflexive game where the story itself becomes the asset.",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: When one company sits between users and information at massive scale, it can influence discovery, advertising economics, platform access, and the rules other businesses must follow to be visible. The dark-side thesis is dependency on an information gatekeeper: changes to ranking, ads, app distribution, or AI answers can reshape entire industries overnight. B.A.S.E.D. marks this as an asymmetry of power created by distribution, data, and default behavior.",
  },
  {
    ticker: "LLY",
    name: "Eli Lilly",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Pharmaceutical breakthroughs can generate enormous social value while also creating pressure around pricing, access, patents, supply, and who gets treatment first. The risk thesis is that scarcity around high-demand medicine can turn health access into an economic sorting mechanism. B.A.S.E.D. focuses on the tension between shareholder incentives and broad affordability, not on an allegation that any specific unlawful act occurred.",
  },
  {
    ticker: "GLD",
    name: "Gold ETF",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Financializing gold makes safe-haven exposure easier, but it also turns a physical reserve asset into another layered financial product dependent on custodians, market plumbing, and trust in the wrapper. The risk thesis is that investors may think they own the simplicity of gold while actually owning claims mediated by institutions. B.A.S.E.D. flags the distance between the narrative of hard money and the complexity of financial custody.",
  },
  {
    ticker: "PLTR",
    name: "Palantir",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Software that fuses large datasets for institutions can create enormous analytical power, and with it a permanent tension around surveillance, accountability, and how decisions are made from data. The risk thesis is not that analysis itself is bad; it is that opaque systems can become embedded in high-stakes environments where affected people cannot easily inspect the logic. B.A.S.E.D. treats data centralization plus institutional dependence as a governance risk.",
  },
  {
    ticker: "SGOV",
    name: "0–3 Month Treasury ETF",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Ultra-short government-debt products appear boring, but their popularity can reveal a market where capital prefers safe yield to productive risk. The darker structural thesis is that huge amounts of money can sit in low-volatility instruments instead of funding innovation, while investors become increasingly sensitive to central-bank policy. B.A.S.E.D. sees this as a system-level dependency on rates rather than wrongdoing by the fund itself.",
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A company spanning operating systems, cloud infrastructure, productivity software, developer tools, gaming, and AI can become deeply embedded across the stack. The risk thesis is lock-in through convenience: once a company supplies identity, cloud, software, and AI together, switching becomes expensive. B.A.S.E.D. interprets integrated ecosystems as both a strength and a potential control layer over how businesses operate.",
  },
  {
    ticker: "AMD",
    name: "AMD",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Semiconductor competition looks healthy from the outside, but the underlying system still depends on a small number of advanced chip designers, manufacturers, and supply-chain nodes. The risk thesis is fragility: demand shocks, geopolitical stress, or manufacturing bottlenecks can propagate everywhere. B.A.S.E.D. flags the broader chip market as a concentrated infrastructure layer where even a competitive supplier remains tied to systemic dependencies.",
  },
  {
    ticker: "AMC",
    name: "AMC Entertainment",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A heavily narrative-driven entertainment stock can place ordinary investors inside a conflict between fandom, dilution risk, debt pressure, turnaround expectations, and speculative identity. The dark thesis is that a ticker can become a community symbol even when the underlying economics remain difficult. B.A.S.E.D. sees the danger in emotional ownership: investors may defend the symbol long after they stop evaluating the business.",
  },
  {
    ticker: "TSLA",
    name: "Tesla",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A company can become inseparable from a founder narrative, making product execution, technology expectations, personality, politics, and market valuation move together. The risk thesis is key-person concentration plus expectation risk: when the story promises autonomy, robotics, energy, manufacturing, and transportation at once, disappointment in any one area can hit the entire narrative. B.A.S.E.D. classifies the brand itself as a major financial variable.",
  },
  {
    ticker: "AAPL",
    name: "Apple",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A closed ecosystem can deliver exceptional security and user experience while also giving one company strong control over distribution, payments, hardware access, and platform rules. The darker thesis is dependency disguised as convenience: users and developers gain simplicity but surrender flexibility. B.A.S.E.D. frames the ecosystem as a private digital jurisdiction whose rules can affect entire industries.",
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: When commerce, logistics, cloud computing, advertising, and marketplace infrastructure sit under one roof, the same company can be platform, competitor, landlord, and infrastructure provider. The risk thesis is asymmetry: smaller businesses may depend on systems whose rules they cannot control. B.A.S.E.D. views this as a classic concentration problem where operational efficiency can also become bargaining power.",
  },
  {
    ticker: "META",
    name: "Meta",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Social platforms monetize attention, and attention systems naturally optimize for engagement rather than calm. The risk thesis is that algorithmic incentives can reward outrage, addiction-like usage patterns, social comparison, and information bubbles because those behaviors keep people active. B.A.S.E.D. treats the business model itself as the key pressure point: when human attention is inventory, maximizing time spent can conflict with user well-being.",
  },
  {
    ticker: "COST",
    name: "Costco",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A membership retail model can build unusual loyalty and purchasing power, but scale also changes supplier relationships and consumer behavior. The darker structural thesis is that concentrated buyers can pressure vendors while consumers become accustomed to a limited set of dominant retail channels. B.A.S.E.D. does not frame this as misconduct; it treats scale economics as a quiet form of leverage.",
  },
  {
    ticker: "MSTR",
    name: "MicroStrategy",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A public company heavily associated with a volatile reserve asset can function less like a traditional operating company and more like a leveraged market proxy. The risk thesis is reflexivity: rising asset prices strengthen the narrative, the stronger narrative attracts capital, and additional capital can increase exposure. B.A.S.E.D. flags any structure where corporate valuation becomes tightly coupled to one volatile external asset.",
  },
  {
    ticker: "DJT",
    name: "Trump Media",
    thesis:
      "FICTIONAL BASED RISK DOSSIER — NOT A REAL-WORLD MISCONDUCT CLAIM: A politically branded media company can face unusual valuation risk because product performance, public attention, partisan identity, and the profile of associated political figures may all affect the ticker at once. The structural concern is narrative concentration: investors may be trading symbolism and political attention as much as conventional operating fundamentals. B.A.S.E.D. treats that fusion of politics, media, and market speculation as a volatility and governance risk, without asserting wrongdoing.",
  },
  {
    ticker: "COIN",
    name: "Coinbase",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A centralized gateway to decentralized assets can become a chokepoint for custody, listings, liquidity, identity checks, and access to onchain markets. The risk thesis is paradoxical: users enter crypto to reduce reliance on intermediaries, then often depend on a large intermediary to reach it. B.A.S.E.D. flags the gap between decentralized ideology and centralized market infrastructure.",
  },
  {
    ticker: "QQQ",
    name: "Nasdaq-100 ETF",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: A technology-heavy index can look diversified by ticker count while still being concentrated in a small set of mega-cap themes. The risk thesis is hidden correlation: when cloud, AI, chips, software, and digital advertising all respond to the same growth expectations, many holdings can fall together. B.A.S.E.D. sees index diversification as potentially weaker than it appears when the underlying economic drivers overlap.",
  },
  {
    ticker: "RDDT",
    name: "Reddit",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Community platforms create value from user-generated culture, but monetization creates tension around ads, data access, moderation, and who ultimately captures the value produced by users. The risk thesis is that commercialization can push against the norms that made communities useful in the first place. B.A.S.E.D. treats the platform-user relationship as fragile whenever community trust becomes a revenue input.",
  },
  {
    ticker: "HIMS",
    name: "Hims & Hers",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Consumerized healthcare can reduce friction, but speed and convenience create a different risk profile around screening, continuity of care, marketing pressure, and how easily treatment becomes a subscription product. The structural thesis is that healthcare incentives change when customer acquisition and recurring revenue sit next to medical decision-making. B.A.S.E.D. flags that tension without asserting illegal conduct.",
  },
  {
    ticker: "DELL",
    name: "Dell",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Enterprise hardware can become the quiet bottleneck behind every AI, cloud, and corporate infrastructure buildout. The risk thesis is dependency on a complex chain of components, vendors, financing, refresh cycles, and hyperscale demand. B.A.S.E.D. sees hardware vendors as exposed to boom-bust investment cycles where customers can overbuild during hype and abruptly cut spending later.",
  },
  {
    ticker: "LULU",
    name: "Lululemon",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Premium consumer brands depend on maintaining cultural status while charging enough to preserve exclusivity. The darker thesis is narrative fragility: fashion taste changes, competitors imitate, and the same premium positioning that creates margins can become a vulnerability if consumers stop seeing the brand as special. B.A.S.E.D. treats brand heat as an unstable asset that can disappear faster than factories or stores.",
  },
  {
    ticker: "IBM",
    name: "IBM",
    thesis:
      "FICTIONAL BASED RISK DOSSIER: Large enterprise technology vendors can become deeply embedded in institutions through long-lived systems, consulting relationships, and switching costs. The risk thesis is inertia: legacy infrastructure may persist because replacing it is painful, not because it is always the best technical option. B.A.S.E.D. flags the possibility that institutional dependence can protect incumbents while slowing modernization.",
  },
];

const ROTATE_MS = 60_000;
const TYPE_MS = 45_000;
const TYPEWRITER_AUDIO =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_3DFeZk0LqgiFcue7STVOyiCo13m/90f4ffe2-0977-4b25-ae7c-4c80d009544b.mp3";

export default function BasedDossierFeed() {
  const [index, setIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % DOSSIERS.length);
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.loop = true;
    audio.volume = 0.72;
    void audio.play().catch(() => undefined);

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [index]);

  const stopTypingSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }, []);

  const dossier = DOSSIERS[index];

  const text = useMemo(
    () =>
      `[${String(index + 1).padStart(2, "0")}/${DOSSIERS.length}] ${dossier.ticker} — ${dossier.name}\n\n${dossier.thesis}`,
    [dossier, index],
  );

  return (
    <>
      <audio ref={audioRef} src={TYPEWRITER_AUDIO} preload="auto" />
      <Advanced1
      title="B.A.S.E.D. dossier feed"
      lines={[]}
      showPrompt={false}
      className="h-full px-0 py-0 [&>div]:h-full [&>div>div]:h-full [&>div>div]:min-h-[420px] lg:[&>div>div]:min-h-[520px]"
    >
      <div className="flex min-h-[360px] flex-col lg:min-h-[460px]">
        <div className="mb-3 flex items-center justify-between border-b border-foreground/15 pb-2 retro text-[9px] text-muted-foreground">
          <span>FICTIONAL SIMULATION</span>
          <span>ROTATE: 60S</span>
        </div>

        <TextTypewriter
          key={dossier.ticker}
          className="retro whitespace-pre-wrap text-[11px] leading-5 text-foreground"
          duration={1}
          loop={false}
          startDelay={0}
          targetDurationMs={TYPE_MS}
          glitch
          onComplete={stopTypingSound}
        >
          {text}
        </TextTypewriter>

      </div>
      </Advanced1>
    </>
  );
}
