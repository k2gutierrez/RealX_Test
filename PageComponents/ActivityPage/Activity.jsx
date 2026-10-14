import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Layout, Loader, PageHero } from "../Components";
import { useRealEstate } from "../../context";
import { resolveMediaUrl } from "../../services/media";

const Activity = () => {
  const { properties, creators, getPropertyReviews, loading, shortAddress } = useRealEstate();
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let active = true;
    const loadReviews = async () => {
      setReviewLoading(true);
      const grouped = await Promise.all(properties.map(async (property) => ({
        property,
        reviews: await getPropertyReviews(property.productID),
      })));
      if (active) {
        setReviews(grouped.flatMap(({ property, reviews: items }) => items.map((review) => ({ ...review, property }))));
        setReviewLoading(false);
      }
    };
    loadReviews();
    return () => { active = false; };
  }, [getPropertyReviews, properties]);

  const entries = useMemo(() => {
    const listings = [...properties].reverse().map((property) => ({
      key: `listing-${property.productID}`,
      type: "Listings",
      title: property.propertyTitle,
      copy: `${shortAddress(property.owner)} listed this property for ${Number(property.price || 0).toFixed(2)} POL.`,
      image: property.images,
      href: `/detail?id=${property.productID}`,
      badge: property.category,
    }));
    const reviewEntries = [...reviews].reverse().map((review) => ({
      key: `review-${review.productId}-${review.reviewIndex}`,
      type: "Reviews",
      title: review.property.propertyTitle,
      copy: `${shortAddress(review.reviewer)} rated this property ${review.rating}/5: ${review.comment}`,
      image: review.property.images,
      href: `/detail?id=${review.property.productID}`,
      badge: `${review.likes} likes`,
    }));
    const all = [...reviewEntries, ...listings];
    return filter === "All" ? all : all.filter((entry) => entry.type === filter);
  }, [filter, properties, reviews, shortAddress]);

  const topRated = useMemo(() => {
    const grouped = reviews.reduce((result, review) => {
      const id = review.property.productID;
      if (!result[id]) result[id] = { property: review.property, total: 0, count: 0 };
      result[id].total += Number(review.rating || 0);
      result[id].count += 1;
      return result;
    }, {});
    return Object.values(grouped).sort((a, b) => (b.total / b.count) - (a.total / a.count) || b.count - a.count)[0];
  }, [reviews]);

  return (
    <Layout title="Marketplace activity | Kevintrolix RealX">
      <PageHero eyebrow="MARKETPLACE PULSE" title="Marketplace activity" copy="Review property listings, community feedback and marketplace participation in one place." />
      <section className="ue-section">
        <div className="ue-container">
          <div className="ue-activity-stats">
            <div><span>Properties</span><strong>{properties.length}</strong><small>Marketplace listings</small></div>
            <div><span>Creators</span><strong>{creators.length}</strong><small>Unique property owners</small></div>
            <div><span>Reviews</span><strong>{reviews.length}</strong><small>Community responses</small></div>
            <div><span>Popular</span><strong>{topRated ? `${(topRated.total / topRated.count).toFixed(1)}/5` : "--"}</strong><small>{topRated?.property.propertyTitle || "No ratings yet"}</small></div>
          </div>

          <div className="ue-activity-toolbar">
            <div><span className="ue-eyebrow">RECENT EVENTS</span><h2>All activity</h2></div>
            <div className="ue-tabs" aria-label="Filter marketplace activity">
              {["All", "Listings", "Reviews"].map((option) => <button type="button" key={option} className={filter === option ? "active" : ""} onClick={() => setFilter(option)}>{option}</button>)}
            </div>
          </div>

          {(loading || reviewLoading) ? <Loader label="Loading marketplace activity..." /> : (
            <div className="ue-activity-list">
              {entries.map((entry) => (
                <Link href={entry.href} className="ue-activity-row" key={entry.key}>
                  <img src={resolveMediaUrl(entry.image) || "/portfolio/portfolio-01.jpg"} alt="" onError={(event) => { event.currentTarget.src = "/portfolio/portfolio-01.jpg"; }} />
                  <span className={`ue-activity-type ${entry.type.toLowerCase()}`}>{entry.type === "Listings" ? "Listed" : "Reviewed"}</span>
                  <span className="ue-activity-copy"><strong>{entry.title}</strong><small>{entry.copy}</small></span>
                  <span className="ue-activity-badge">{entry.badge}</span>
                </Link>
              ))}
              {!entries.length && <div className="ue-empty-state"><h3>No activity found</h3><p>Marketplace events will appear here as properties and reviews are added.</p></div>}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Activity;
