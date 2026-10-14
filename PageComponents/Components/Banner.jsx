import Image from "next/image";
import Link from "next/link";

const Banner = ({ propertyCount = 0, creatorCount = 0 }) => (
  <section className="ue-hero">
    <div className="ue-container ue-hero-grid">
      <div className="ue-hero-copy">
        <span className="ue-eyebrow"><i /> THE ON-CHAIN PROPERTY MARKETPLACE</span>
        <h1>A smarter way to <em>discover and own</em> real estate.</h1>
        <p>Explore remarkable properties, connect your wallet and move ownership with confidence through transparent blockchain transactions.</p>
        <div className="ue-hero-actions"><Link href="/explor" className="ue-button primary">Explore properties <span aria-hidden="true">↗</span></Link><Link href="/create" className="ue-button ghost">List your property <span aria-hidden="true">+</span></Link></div>
        <div className="ue-hero-trust"><span>✓</span> Wallet-secured <span>✓</span> Transparent records <span>✓</span> Built on Polygon</div>
        <div className="ue-hero-stats"><div><strong>{propertyCount}+</strong><span>Properties</span></div><div><strong>{creatorCount}+</strong><span>Owners</span></div><div><strong>100%</strong><span>Transparent</span></div></div>
      </div>
      <div className="ue-hero-visual">
        <div className="ue-hero-orbit" />
        <div className="ue-hero-image"><Image src="/portfolio/portfolio-01.jpg" alt="Modern white luxury property" fill priority sizes="(max-width: 820px) 100vw, 50vw" /></div>
        <div className="ue-hero-image-label"><span>Featured residence</span><strong>Modern living, verified ownership</strong></div>
        <div className="ue-floating-card top"><span>P</span><div><small>Live network</small><strong>Polygon Amoy</strong></div></div>
        <div className="ue-floating-card bottom"><span>✓</span><div><small>Ownership</small><strong>Smart-contract verified</strong></div></div>
      </div>
    </div>
  </section>
);
export default Banner;
