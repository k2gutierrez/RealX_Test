import { Action, Banner, Blog, Quote, Statistick } from "../PageComponents/AboutPage";
import { Layout } from "../PageComponents/Components";
import { useRealEstate } from "../context";

export default function AboutPage() {
  const { properties, creators } = useRealEstate();
  return <Layout title="About | Kevintrolix RealX"><Banner /><section className="ue-section"><div className="ue-container"><Statistick properties={properties} creators={creators} /><div className="ue-about-story"><div><span className="ue-eyebrow">WHY THIS MARKETPLACE</span><h2>Built for clarity from listing to ownership</h2><p>The project follows the supplied real-estate DApp tutorial while strengthening contract authorization, transaction validation, network handling and demo/live data separation.</p><p>It is an educational marketplace implementation, not a replacement for legal title registration, professional valuation or property due diligence.</p></div><img src="/banner/h-three-banner-02.jpg" alt="Contemporary property exterior" /></div><Quote /><Blog /><Action /></div></section></Layout>;
}
