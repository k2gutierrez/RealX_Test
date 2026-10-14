import Link from "next/link";

const Blog = () => <div className="ue-about-principles"><article><span>01</span><h3>Wallet-first access</h3><p>Your wallet is the marketplace identity used for property ownership and transactions.</p></article><article><span>02</span><h3>Direct settlement</h3><p>Purchase value moves directly to the current property owner.</p></article><article><span>03</span><h3>Optional decentralized media</h3><p>Creators may use IPFS uploads or existing public image references.</p></article><Link href="/blog" className="ue-text-link">Read marketplace guides</Link></div>;

export default Blog;
