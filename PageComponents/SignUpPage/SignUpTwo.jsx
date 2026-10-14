import Link from "next/link";
import { useRealEstate } from "../../context";

const SignUpTwo = () => {
  const { currentAccount, connectWallet, walletStatus } = useRealEstate();
  return <div className="ue-access-steps"><article><span>01</span><h2>Install a wallet</h2><p>Use an EIP-1193 compatible browser wallet and keep its recovery phrase offline.</p></article><article><span>02</span><h2>Connect safely</h2><p>Approve only the public-address connection request and confirm the active network.</p></article><article><span>03</span><h2>Use the marketplace</h2><p>Browse in demo mode or use test POL for transactions on Polygon Amoy.</p></article><div className="ue-access-action">{currentAccount ? <Link href="/create" className="ue-button primary">Create a property</Link> : <button className="ue-button primary" type="button" onClick={connectWallet} disabled={walletStatus === "connecting"}>{walletStatus === "connecting" ? "Connecting..." : "Connect wallet"}</button>}</div></div>;
};

export default SignUpTwo;
