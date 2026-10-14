import { Layout } from "../PageComponents/Components";
import { ProductFour, ProductOne, ProductThree, ProductTwo } from "../PageComponents/ProductPAge";
import { useRealEstate } from "../context";

export default function ProductPage() {
  const { properties } = useRealEstate();
  return <Layout title="Property catalogue | Kevintrolix RealX"><ProductOne /><section className="ue-section"><div className="ue-container"><ProductTwo properties={properties} /></div></section><section className="ue-section soft"><div className="ue-container"><ProductThree properties={properties} /><ProductFour /></div></section></Layout>;
}
