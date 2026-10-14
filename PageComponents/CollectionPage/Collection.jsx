import { Collection as CollectionGrid, Layout, PropertyGrid } from "../Components";
import { useRealEstate } from "../../context";
import Title from "./Title";

const Collection = () => {
  const { properties } = useRealEstate();
  return (
    <Layout title="Property collections | Kevintrolix RealX">
      <Title />
      <section className="ue-section"><div className="ue-container"><CollectionGrid properties={properties} /></div></section>
      <section className="ue-section soft"><div className="ue-container"><div className="ue-section-heading"><div><span className="ue-eyebrow">LATEST ACROSS COLLECTIONS</span><h2>Recently listed properties</h2></div></div><PropertyGrid properties={[...properties].reverse().slice(0, 6)} /></div></section>
    </Layout>
  );
};

export default Collection;
