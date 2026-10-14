import Link from "next/link";

const Footer = () => (
  <footer className="ue-footer">
    <div className="ue-container ue-footer-grid">
      <div>
        <Link href="/" className="ue-brand light"><span className="ue-brand-mark">K</span><span><strong>KEVINTROLIX</strong><small>REALX</small></span></Link>
        <p>A peer-to-peer marketplace where property discovery, reviews and ownership transfers are transparent.</p>
      </div>
      <div><h4>Marketplace</h4><Link href="/explor">Explore properties</Link><Link href="/collection">Collections</Link><Link href="/active">Activity</Link><Link href="/ranking">Rankings</Link></div>
      <div><h4>Resources</h4><Link href="/about">About</Link><Link href="/blog">Journal</Link><Link href="/news">News</Link><Link href="/fourm">Forum</Link><Link href="/privacy">Privacy</Link><Link href="/contact">Contact</Link></div>
      <div><h4>Network</h4><p>Built for Polygon Amoy</p><p>Wallet-secured transactions</p><p>Powered by Solidity</p></div>
    </div>
    <div className="ue-container ue-footer-bottom"><span>Copyright 2026 Kevintrolix RealX</span><span>Property records on-chain. Media and details off-chain.</span></div>
  </footer>
);

export default Footer;
