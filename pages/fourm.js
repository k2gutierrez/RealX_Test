import { useEffect, useState } from "react";
import { Layout } from "../PageComponents/Components";
import { FourmFour, FourmOne, FourmThree, FourmTwo } from "../PageComponents/FourmPage";
import { useRealEstate } from "../context";
import { FORUM_TOPICS } from "../data/content";

const STORAGE_KEY = "unlock-estate:forum-topics";

export default function ForumPage() {
  const { currentAccount, shortAddress } = useRealEstate();
  const [topics, setTopics] = useState(FORUM_TOPICS);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); if (Array.isArray(saved)) setTopics(saved); } catch (_) {} }, []);
  const add = ({ title, category }) => {
    const next = [{ id: `local-${Date.now()}`, title: String(title).trim(), category, author: currentAccount ? shortAddress(currentAccount) : "Guest", replies: 0 }, ...topics];
    setTopics(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  return <Layout title="Community forum | Kevintrolix RealX"><FourmOne /><section className="ue-section"><div className="ue-container"><FourmTwo topics={topics} /><div className="ue-forum-toolbar"><div><span className="ue-eyebrow">RECENT DISCUSSIONS</span><h2>Marketplace topics</h2></div><FourmFour onAdd={add} /></div><FourmThree topics={topics} /><p className="ue-author-source">Forum topics are a browser-local demonstration and are not stored on-chain.</p></div></section></Layout>;
}
