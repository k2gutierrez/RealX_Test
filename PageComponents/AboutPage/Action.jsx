import Link from "next/link";

const Action = () => <div className="ue-cta"><div><span className="ue-eyebrow">EXPLORE THE MARKETPLACE</span><h2>Find your next property record</h2><p>Browse categories, review creator portfolios or publish a listing.</p></div><div className="ue-inline-actions"><Link href="/explor" className="ue-button light">Explore properties</Link><Link href="/create" className="ue-button dark">Create listing</Link></div></div>;

export default Action;
