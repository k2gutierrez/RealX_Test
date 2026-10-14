import { Layout } from "../PageComponents/Components";
import { ForgetFour, ForgetOne, ForgetThree, ForgetTwo } from "../PageComponents/ForgetPage";

export default function ForgetPage() {
  return <Layout title="Wallet recovery guidance | Kevintrolix RealX"><ForgetOne /><section className="ue-section"><div className="ue-container narrow"><div className="ue-recovery-grid"><ForgetTwo /><ForgetThree /></div><ForgetFour /></div></section></Layout>;
}
