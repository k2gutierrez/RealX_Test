import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "../../data/properties";

const images = ["/collection/collection-lg-01.jpg", "/collection/collection-lg-02.jpg", "/collection/collection-lg-03.jpg", "/collection/collection-lg-04.jpg"];
const Collection = ({ properties = [] }) => (
  <div className="ue-collection-grid">{CATEGORIES.map((category, index) => {
    const count = properties.filter((item) => item.category.toLowerCase() === category.toLowerCase()).length;
    return <Link href={`/category/${category.toLowerCase()}`} className="ue-collection-card" key={category}><Image src={images[index]} alt={category} fill sizes="25vw" /><span><small>{count} properties</small><strong>{category}</strong></span></Link>;
  })}</div>
);
export default Collection;
