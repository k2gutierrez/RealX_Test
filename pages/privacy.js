import { Layout } from "../PageComponents/Components";
import { PrivacyOne, PrivacyTwo } from "../PageComponents/PrivacyPage";

export default function PrivacyPage() {
  return <Layout title="Privacy and safety | Kevintrolix RealX"><PrivacyOne /><section className="ue-section"><div className="ue-container narrow"><PrivacyTwo /></div></section></Layout>;
}
