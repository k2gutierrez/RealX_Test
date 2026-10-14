import Link from "next/link";
import { Layout } from "../PageComponents/Components";

export default function PageNotFound() {
  return <Layout title="Page not found | Kevintrolix RealX"><section className="ue-not-found"><div className="ue-container"><span>404</span><h1>This property page does not exist</h1><p>The address may be outdated, or the route may have moved.</p><div className="ue-inline-actions"><Link href="/" className="ue-button primary">Return home</Link><Link href="/explor" className="ue-button ghost">Explore properties</Link></div></div></section></Layout>;
}
