import { ContactFour, ContactOne, ContactThree, ContactTwo } from "../PageComponents/ContactPage";
import { Layout } from "../PageComponents/Components";

export default function ContactPage() {
  return <Layout title="Contact | Kevintrolix RealX"><ContactOne /><section className="ue-section"><div className="ue-container"><ContactTwo /><div className="ue-contact-layout"><ContactThree /><div><img src="/contact/contact1.png" alt="Support illustration" /><ContactFour /></div></div></div></section></Layout>;
}
