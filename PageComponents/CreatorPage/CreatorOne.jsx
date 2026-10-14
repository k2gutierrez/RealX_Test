import Link from "next/link";
import { Layout, PageHero } from "../Components";
import { useRealEstate } from "../../context";

const CreatorOne = () => {
  const { creators, shortAddress } = useRealEstate();
  return (
    <Layout title="Property creators | Kevintrolix RealX">
      <PageHero eyebrow="MARKETPLACE COMMUNITY" title="Meet the property creators" copy="Explore every wallet currently holding property in the marketplace and compare its portfolio." />
      <section className="ue-section">
        <div className="ue-container">
          <div className="ue-section-heading"><div><span className="ue-eyebrow">ALL CREATORS</span><h2>{creators.length} active wallets</h2></div><Link href="/ranking" className="ue-text-link">View rankings</Link></div>
          <div className="ue-creator-grid">
            {creators.map((creator, index) => (
              <Link href={`/author?address=${creator.owner}`} className="ue-creator-card" key={creator.owner}>
                <span className="ue-creator-card-rank">#{String(index + 1).padStart(2, "0")}</span>
                <span className="ue-avatar creator">{creator.owner.slice(2, 4).toUpperCase()}</span>
                <strong>{shortAddress(creator.owner)}</strong>
                <small>{creator.count} {creator.count === 1 ? "property" : "properties"}</small>
                <div><span>Portfolio worth</span><b>{creator.total.toFixed(2)} POL</b></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CreatorOne;
