import Link from "next/link";
import { useRealEstate } from "../../context";
import { resolveMediaUrl } from "../../services/media";
import { formatPol } from "../../services/normalizers";

const Product = ({ property, featured = false }) => {
  const { shortAddress } = useRealEstate();
  return (
    <article className={`ue-property-card ${featured ? "featured" : ""}`}>
      <Link href={`/detail?id=${property.productID}`} className="ue-property-image">
        <img src={resolveMediaUrl(property.images) || "/portfolio/portfolio-01.jpg"} alt={property.propertyTitle} loading="lazy" onError={(event) => { event.currentTarget.src = "/portfolio/portfolio-01.jpg"; }} />
        <span className="ue-category-pill">{property.category}</span>
      </Link>
      <div className="ue-property-body">
        <div className="ue-property-meta"><span>{property.propertyAddress}</span><span>#{property.productID}</span></div>
        <h3><Link href={`/detail?id=${property.productID}`}>{property.propertyTitle}</Link></h3>
        <div className="ue-owner-row"><span className="ue-avatar">{property.owner?.slice(2, 4).toUpperCase()}</span><span><small>Owned by</small>{shortAddress(property.owner)}</span></div>
        <div className="ue-property-price"><span><small>Current price</small><strong>{formatPol(property.price)} POL</strong></span><Link href={`/detail?id=${property.productID}`} aria-label={`View ${property.propertyTitle}`}>View <b aria-hidden="true">↗</b></Link></div>
      </div>
    </article>
  );
};

export default Product;
