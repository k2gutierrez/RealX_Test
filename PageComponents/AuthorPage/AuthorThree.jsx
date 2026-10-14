import { useState } from "react";
import { PropertyGrid } from "../Components";

const AuthorThree = ({ owned = [], all = [], hasAddress }) => {
  const [view, setView] = useState("Owned properties");
  const visible = view === "All properties" ? all : owned;
  return (
    <section className="ue-author-portfolio" aria-labelledby="portfolio-heading">
      <div className="ue-author-toolbar">
        <div><span className="ue-eyebrow">PROPERTY PORTFOLIO</span><h2 id="portfolio-heading">{view}</h2></div>
        <div className="ue-tabs">{["Owned properties", "All properties"].map((item) => <button type="button" key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{item}</button>)}</div>
      </div>
      <PropertyGrid properties={visible} empty={hasAddress ? `No ${view.toLowerCase()} found.` : "Connect a wallet to view owned properties."} />
    </section>
  );
};

export default AuthorThree;
