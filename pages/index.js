import Link from "next/link";
import { Banner, Collection, Layout, Loader, Product, Service, TopSeller } from "../PageComponents/Components";
import { useRealEstate } from "../context";

export default function Home() {
  const { properties, creators, loading } = useRealEstate();
  return (
    <Layout title="Kevintrolix RealX | On-chain property marketplace">
      <Banner propertyCount={properties.length} creatorCount={creators.length} />
      <section className="ue-section"><div className="ue-container"><div className="ue-section-heading"><div><span className="ue-eyebrow">LIVE MARKETPLACE</span><h2>Discover remarkable properties</h2></div><Link href="/explor" className="ue-text-link">View all properties →</Link></div>{loading ? <Loader /> : <div className="ue-property-grid">{properties.slice(0, 6).map((property) => <Product key={property.productID} property={property} />)}</div>}</div></section>
      <section className="ue-section muted"><div className="ue-container"><div className="ue-section-heading"><div><span className="ue-eyebrow">CURATED COLLECTIONS</span><h2>Find your kind of place</h2></div></div><Collection properties={properties} /></div></section>
      <section className="ue-section dark"><div className="ue-container"><div className="ue-section-heading light"><div><span className="ue-eyebrow">MARKET LEADERS</span><h2>Top property creators</h2></div><Link href="/creator" className="ue-text-link">View rankings →</Link></div><TopSeller creators={creators} /></div></section>
      <section className="ue-section"><div className="ue-container"><div className="ue-section-heading centered"><div><span className="ue-eyebrow">HOW IT WORKS</span><h2>Own the next move</h2><p>Three simple steps connect property discovery with blockchain transparency.</p></div></div><Service /></div></section>
      <section className="ue-container ue-cta"><div><span className="ue-eyebrow">YOUR PROPERTY. YOUR TERMS.</span><h2>Ready to list on RealX?</h2><p>Create a property record, set the price and publish it to the marketplace.</p></div><Link href="/create" className="ue-button light">Create property</Link></section>
    </Layout>
  );
}
