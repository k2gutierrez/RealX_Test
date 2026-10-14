import { BlogOne, BlogTwo } from "../PageComponents/BlogPage";
import { Layout } from "../PageComponents/Components";

export default function BlogPage() {
  return <Layout title="Marketplace journal | Kevintrolix RealX"><BlogOne /><section className="ue-section"><div className="ue-container"><BlogTwo /></div></section></Layout>;
}
