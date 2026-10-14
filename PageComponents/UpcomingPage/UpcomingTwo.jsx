import Link from "next/link";

const items = [
  ["01", "Create the Pinata account", "Generate a public-upload JWT, configure the server secret and verify a real IPFS image."],
  ["02", "Deploy to Polygon Amoy", "Deploy with a dedicated funded test wallet and publish the generated contract manifest."],
  ["03", "Run multi-wallet acceptance tests", "Exercise listing, updates, purchases, reviews and ownership transitions against the deployed address."],
  ["04", "Complete launch governance", "Approve contact delivery, privacy wording, legal review, monitoring and production support ownership."],
];

const UpcomingTwo = () => <div><div className="ue-roadmap-grid">{items.map(([number, title, copy]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{copy}</p></article>)}</div><div className="ue-cta"><div><span className="ue-eyebrow">PRE-DEPLOYMENT GATE</span><h2>Follow the release checklist</h2><p>Secrets, wallets and public services must be configured outside source control.</p></div><Link href="/contact" className="ue-button light">Ask a question</Link></div></div>;

export default UpcomingTwo;
