import { useRouter } from "next/router";
import { Layout, PageHero, PropertyGrid } from "../../PageComponents/Components";
import { useRealEstate } from "../../context";

export default function Category() {
  const { query } = useRouter();
  const { properties } = useRealEstate();
  const name = query.category ? query.category.charAt(0).toUpperCase() + query.category.slice(1) : "Collection";
  const filtered = properties.filter((property) => property.category.toLowerCase() === String(query.category || "").toLowerCase());
  return <Layout title={`${name} properties | Kevintrolix RealX`}><PageHero eyebrow="PROPERTY COLLECTION" title={`${name} properties`} copy={`Discover on-chain listings in the ${name.toLowerCase()} collection.`} /><section className="ue-section"><div className="ue-container"><PropertyGrid properties={filtered} empty={`No ${name.toLowerCase()} properties yet.`} /></div></section></Layout>;
}
