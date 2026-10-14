import { useMemo, useState } from "react";
import { Layout, Loader, PageHero, PropertyGrid } from "../PageComponents/Components";
import { useRealEstate } from "../context";
import { CATEGORIES } from "../data/properties";

export default function Explore() {
  const { properties, loading } = useRealEstate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const filtered = useMemo(() => {
    const result = properties.filter((property) => {
      const matchCategory = category === "All" || property.category === category;
      const haystack = `${property.propertyTitle} ${property.propertyAddress} ${property.description}`.toLowerCase();
      return matchCategory && haystack.includes(query.toLowerCase());
    });
    return [...result].sort((a, b) => sort === "low" ? Number(a.price) - Number(b.price) : sort === "high" ? Number(b.price) - Number(a.price) : Number(b.productID) - Number(a.productID));
  }, [category, properties, query, sort]);
  return (
    <Layout title="Explore properties | Kevintrolix RealX"><PageHero title="Explore properties" copy="Browse every property currently available in the RealX marketplace." />
      <section className="ue-section"><div className="ue-container"><div className="ue-filterbar"><label className="ue-search"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by property or location" /></label><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Recently listed</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div><div className="ue-tabs">{["All", ...CATEGORIES].map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="ue-results-row"><strong>{filtered.length} properties</strong><span>Transparent pricing in POL</span></div>{loading ? <Loader /> : <PropertyGrid properties={filtered} />}</div></section>
    </Layout>
  );
}
