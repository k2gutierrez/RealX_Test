import Link from "next/link";
import { useRealEstate } from "../../context";

const LoginTwo = () => {
  const { currentAccount, connectWallet, walletStatus, shortAddress } = useRealEstate();
  return <div className="ue-access-card"><span className="ue-wallet-orb">W</span><h2>{currentAccount ? "Wallet connected" : "Connect a browser wallet"}</h2><p>{currentAccount ? `${shortAddress(currentAccount)} is your active marketplace identity.` : "Your wallet asks for permission before sharing its public address. Connecting does not send a transaction."}</p>{currentAccount ? <div className="ue-inline-actions"><Link href="/author" className="ue-button primary">Open my portfolio</Link><Link href="/connect" className="ue-button ghost">Wallet details</Link></div> : <button type="button" className="ue-button primary wide" onClick={connectWallet} disabled={walletStatus === "connecting"}>{walletStatus === "connecting" ? "Connecting..." : "Connect wallet"}</button>}<small>Never enter a seed phrase or private key on this site.</small></div>;
};

export default LoginTwo;
