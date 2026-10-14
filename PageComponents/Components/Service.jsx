const steps = [
  ["01", "Connect your wallet", "Use MetaMask or another EVM wallet to enter the marketplace."],
  ["02", "Discover or list", "Browse category collections or publish a property with its price and details."],
  ["03", "Transact on-chain", "Confirm purchases, ownership updates, reviews and likes through the smart contract."],
];
const Service = () => <div className="ue-steps">{steps.map(([number, title, copy]) => <article className="ue-step" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p><i aria-hidden="true">→</i></article>)}</div>;
export default Service;
