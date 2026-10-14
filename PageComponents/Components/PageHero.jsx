const PageHero = ({ eyebrow = "RealX marketplace", title, copy }) => (
  <section className="ue-page-hero"><div className="ue-container"><span className="ue-eyebrow">{eyebrow}</span><h1>{title}</h1>{copy && <p>{copy}</p>}</div></section>
);
export default PageHero;
