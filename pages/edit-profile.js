import { Layout } from "../PageComponents/Components";
import { EditProfileOne, EditProfileTwo } from "../PageComponents/EditProfilepage";

export default function EditProfilePage() {
  return <Layout title="Local profile | Kevintrolix RealX"><EditProfileOne /><section className="ue-section"><div className="ue-container"><EditProfileTwo /></div></section></Layout>;
}
