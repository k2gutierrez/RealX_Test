const sections = [
  ["Wallet information", "The application reads the public wallet address, connected chain and native balance through the wallet provider. It never needs a seed phrase or private key."],
  ["Blockchain records", "Property listings, owners, prices, reviews and likes written to a deployed contract are public and cannot be treated as private or easily erased."],
  ["Demo mode", "When no contract address is configured, marketplace changes are stored in the current browser's local storage. Clearing browser data removes those local demo changes."],
  ["Property media", "A creator may use a public URL or upload an image to public IPFS through Pinata. Public IPFS content should be treated as durable and publicly accessible."],
  ["Contact and profile forms", "The current forms operate locally and are not connected to an external customer database. A public deployment must disclose any mail, analytics or storage providers subsequently added."],
  ["Security", "Never enter a private key, recovery phrase or service credential into a marketplace form. Report suspected vulnerabilities without publishing exploitable details."],
  ["Legal status", "Kevintrolix RealX is an educational software project. A contract record is not legal title, property verification, brokerage representation or investment advice."],
];

const PrivacyTwo = () => <div className="ue-policy"><p className="ue-policy-date">Last updated: August 3, 2026</p>{sections.map(([title, copy], index) => <section key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{copy}</p></div></section>)}</div>;

export default PrivacyTwo;
