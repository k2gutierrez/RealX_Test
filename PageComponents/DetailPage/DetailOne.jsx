import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout, Loader, PropertyGrid } from "../Components";
import { useRealEstate } from "../../context";
import { resolveMediaUrl } from "../../services/media";

const stars = (rating) => "★".repeat(Number(rating) || 0) + "☆".repeat(5 - (Number(rating) || 0));

const DetailOne = () => {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const {
    properties,
    currentAccount,
    shortAddress,
    getProperty,
    getPropertyReviews,
    buyProperty,
    updatePrice,
    addReview,
    likeReview,
    transactionState,
    notify,
    modeLabel,
  } = useRealEstate();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const busy = ["preparing", "pending"].includes(transactionState.phase);

  const loadReviews = useCallback(async () => {
    if (!id) return;
    setReviews(await getPropertyReviews(id));
  }, [getPropertyReviews, id]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      setProperty(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getProperty(id).then((result) => {
      if (!active) return;
      setProperty(result);
      setPrice(result?.price || "");
      setLoading(false);
    });
    loadReviews();
    return () => { active = false; };
  }, [getProperty, id, loadReviews, properties, router.isReady]);

  const isOwner = Boolean(
    property?.owner && currentAccount && property.owner.toLowerCase() === currentAccount.toLowerCase()
  );
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating), 0) / reviews.length
    : 0;
  const related = useMemo(
    () => properties.filter((item) => item.category === property?.category && String(item.productID) !== String(id)).slice(0, 3),
    [id, properties, property?.category]
  );

  const purchase = async () => {
    if (await buyProperty(property)) {
      const refreshed = await getProperty(id);
      setProperty(refreshed);
    }
  };

  const submitPrice = async (event) => {
    event.preventDefault();
    if (await updatePrice(id, price)) {
      const refreshed = await getProperty(id);
      setProperty(refreshed);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (await addReview(id, rating, comment)) {
      setComment("");
      await loadReviews();
    }
  };

  const submitLike = async (reviewIndex) => {
    if (await likeReview(id, reviewIndex)) await loadReviews();
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("success", "Property link copied.");
    } catch (_) {
      notify("info", "Copy the address from your browser to share this property.");
    }
  };

  if (loading) return <Layout title="Loading property | Kevintrolix RealX"><section className="ue-section"><div className="ue-container"><Loader label="Loading property…" /></div></section></Layout>;

  if (!property) return (
    <Layout title="Property not found | Kevintrolix RealX">
      <section className="ue-section"><div className="ue-container ue-not-found"><span>404</span><h1>Property not found</h1><p>The property may not exist on the selected marketplace data source.</p><Link className="ue-button primary" href="/explor">Explore properties</Link></div></section>
    </Layout>
  );

  return (
    <Layout title={`${property.propertyTitle} | Kevintrolix RealX`} description={property.description}>
      <section className="ue-detail-hero">
        <div className="ue-container ue-detail-grid">
          <div className="ue-detail-media"><img src={resolveMediaUrl(property.images) || "/portfolio/portfolio-01.jpg"} alt={property.propertyTitle} onError={(event) => { event.currentTarget.src = "/portfolio/portfolio-01.jpg"; }} /><span className="ue-category-pill">{property.category}</span><button type="button" className="ue-share-button" onClick={share}>Share</button></div>
          <div className="ue-detail-summary">
            <span className="ue-eyebrow">PROPERTY #{property.productID} · {modeLabel.toUpperCase()}</span>
            <h1>{property.propertyTitle}</h1>
            <p className="ue-detail-address">{property.propertyAddress}</p>
            <div className="ue-rating-summary"><strong>{averageRating ? averageRating.toFixed(1) : "New"}</strong><span>{averageRating ? stars(Math.round(averageRating)) : "No ratings yet"}<small>{reviews.length} review{reviews.length === 1 ? "" : "s"}</small></span></div>
            <div className="ue-owner-panel"><span className="ue-avatar large">{property.owner?.slice(2, 4).toUpperCase()}</span><div><small>Current owner</small><Link href={`/author?address=${property.owner}`}>{shortAddress(property.owner)}</Link></div>{isOwner && <span className="ue-owner-badge">Your property</span>}</div>
            <div className="ue-purchase-panel"><div><small>Current marketplace price</small><strong>{Number(property.price).toFixed(4)} POL</strong></div>{isOwner ? <Link href={`/update?id=${property.productID}`} className="ue-button primary">Edit property</Link> : <button className="ue-button primary" onClick={purchase} disabled={busy}>{busy ? "Transaction pending…" : currentAccount ? "Buy property" : "Connect wallet to buy"}</button>}</div>
            {!isOwner && <p className="ue-chain-note">The exact listed amount is transferred to the owner after wallet confirmation.</p>}
          </div>
        </div>
      </section>

      <section className="ue-section"><div className="ue-container ue-detail-content">
        <article className="ue-property-description"><span className="ue-eyebrow">ABOUT THIS PROPERTY</span><h2>Property overview</h2><p>{property.description}</p><dl><div><dt>Category</dt><dd>{property.category}</dd></div><div><dt>Property ID</dt><dd>#{property.productID}</dd></div><div><dt>Network record</dt><dd>{modeLabel}</dd></div><div><dt>Owner</dt><dd>{shortAddress(property.owner)}</dd></div></dl></article>
        <aside className="ue-owner-actions">
          {isOwner ? <><span className="ue-eyebrow">OWNER CONTROLS</span><h3>Update asking price</h3><p>Changing the price requires a wallet transaction.</p><form onSubmit={submitPrice}><div className="ue-input-suffix"><input type="number" min="0.000001" step="0.000001" value={price} onChange={(event) => setPrice(event.target.value)} required /><strong>POL</strong></div><button className="ue-button dark wide" disabled={busy}>{busy ? "Updating…" : "Update price"}</button></form><Link href={`/update?id=${property.productID}`} className="ue-text-link">Edit property information →</Link></> : <><span className="ue-eyebrow">TRANSPARENT OWNERSHIP</span><h3>Wallet-secured transfer</h3><p>The contract validates the exact price, prevents self-purchase, transfers funds and records the new owner.</p></>}
        </aside>
      </div></section>

      <section className="ue-section muted"><div className="ue-container ue-review-layout">
        <div className="ue-review-list"><div className="ue-section-heading"><div><span className="ue-eyebrow">COMMUNITY REVIEWS</span><h2>What people are saying</h2></div><strong>{reviews.length}</strong></div>{reviews.length ? reviews.map((review) => <article className="ue-review-card" key={review.reviewIndex}><div className="ue-review-head"><span className="ue-avatar">{review.reviewer?.slice(2, 4).toUpperCase()}</span><div><strong>{shortAddress(review.reviewer)}</strong><span className="ue-stars">{stars(review.rating)}</span></div></div><p>{review.comment}</p><button type="button" onClick={() => submitLike(review.reviewIndex)} disabled={busy}>♡ {review.likes} helpful</button></article>) : <div className="ue-empty compact"><h3>No reviews yet</h3><p>Be the first to share an informed view of this property.</p></div>}</div>
        <aside className="ue-review-form"><span className="ue-eyebrow">ADD YOUR REVIEW</span><h3>Rate this property</h3><form onSubmit={submitReview}><label className="ue-field"><span>Rating</span><select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} — {stars(value)}</option>)}</select></label><label className="ue-field"><span>Comment</span><textarea rows={5} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Share a useful observation…" maxLength={1000} required /></label><button className="ue-button primary wide" disabled={busy}>{busy ? "Publishing…" : currentAccount ? "Publish review" : "Connect wallet and review"}</button></form></aside>
      </div></section>

      {related.length > 0 && <section className="ue-section"><div className="ue-container"><div className="ue-section-heading"><div><span className="ue-eyebrow">MORE IN {property.category.toUpperCase()}</span><h2>Related properties</h2></div><Link href={`/category/${property.category.toLowerCase()}`} className="ue-text-link">View collection →</Link></div><PropertyGrid properties={related} /></div></section>}
    </Layout>
  );
};

export default DetailOne;
