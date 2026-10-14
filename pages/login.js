import { Layout } from "../PageComponents/Components";
import { LoginOne, LoginTwo } from "../PageComponents/LoginPage";

export default function LoginPage() {
  return <Layout title="Wallet sign in | Kevintrolix RealX"><LoginOne /><section className="ue-section"><div className="ue-container narrow"><LoginTwo /></div></section></Layout>;
}
