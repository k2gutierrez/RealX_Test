import { Layout } from "../PageComponents/Components";
import { UpcomingOne, UpcomingTwo } from "../PageComponents/UpcomingPage";

export default function UpcomingPage() {
  return <Layout title="Release roadmap | Kevintrolix RealX"><UpcomingOne /><section className="ue-section"><div className="ue-container"><UpcomingTwo /></div></section></Layout>;
}
