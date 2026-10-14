import { useState } from "react";
import { Layout, PageHero } from "../Components";
import { useRealEstate } from "../../context";
import RankingTwo from "./RankingTwo";

const RankingOne = () => {
  const { creators, properties } = useRealEstate();
  const [mode, setMode] = useState("Creators");
  return (
    <Layout title="Marketplace rankings | Kevintrolix RealX">
      <PageHero eyebrow="MARKETPLACE LEADERS" title="Property rankings" copy="Compare creators by portfolio value or properties by their current marketplace price." />
      <section className="ue-section">
        <div className="ue-container">
          <div className="ue-ranking-toolbar"><div><span className="ue-eyebrow">LIVE MARKET DATA</span><h2>{mode} leaderboard</h2></div><div className="ue-tabs">{["Creators", "Properties"].map((item) => <button type="button" key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item}</button>)}</div></div>
          <RankingTwo mode={mode} creators={creators} properties={properties} />
        </div>
      </section>
    </Layout>
  );
};

export default RankingOne;
