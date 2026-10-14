import { Layout } from "../PageComponents/Components";
import { SignUpOne, SignUpTwo } from "../PageComponents/SignUpPage";

export default function SignUpPage() {
  return <Layout title="Join | Kevintrolix RealX"><SignUpOne /><section className="ue-section"><div className="ue-container"><SignUpTwo /></div></section></Layout>;
}
