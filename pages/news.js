import { Layout } from "../PageComponents/Components";
import { NewsOne, NewsThree, NewsTwo } from "../PageComponents/NewsPage";

export default function NewsPage() {
  return <Layout title="News | Kevintrolix RealX"><NewsOne /><section className="ue-section"><div className="ue-container"><NewsTwo /></div></section><section className="ue-section soft"><div className="ue-container"><NewsThree /></div></section></Layout>;
}
