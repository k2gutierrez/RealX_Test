import Link from "next/link";
import { Layout, PageHero } from "../Components";
import { useRealEstate } from "../../context";

const ConnectOne = () => {
  const {
    currentAccount,
    balance,
    chainId,
    walletStatus,
    networkStatus,
    connectWallet,
    switchNetwork,
    shortAddress,
    modeLabel,
    isDemo,
    notify,
  } = useRealEstate();

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(currentAccount);
      notify("success", "Wallet address copied.");
    } catch (_) {
      notify("info", "Copy the wallet address manually.");
    }
  };

  return (
    <Layout title="Wallet | Kevintrolix RealX">
      <PageHero eyebrow="MARKETPLACE ACCESS" title="Your marketplace wallet" copy="Connect the wallet used to list, review, purchase and manage properties." />
      <section className="ue-section"><div className="ue-container ue-wallet-page">
        <div className="ue-wallet-visual"><img src="/connect/connect-01.jpg" alt="Connect a wallet to the marketplace" /><span className="ue-wallet-visual-badge">{modeLabel}</span></div>
        <div className="ue-wallet-card">
          <span className="ue-eyebrow">WALLET STATUS</span>
          <h2>{currentAccount ? "Wallet connected" : "Connect to continue"}</h2>
          <p>{isDemo ? "Demo mode keeps marketplace records in this browser while still using your wallet address for ownership rules." : "Live mode submits signed transactions to the RealEstate contract on Polygon Amoy."}</p>

          {currentAccount ? <>
            <div className="ue-wallet-identity"><span className="ue-avatar xlarge">{currentAccount.slice(2, 4).toUpperCase()}</span><div><small>Connected account</small><strong>{shortAddress(currentAccount)}</strong><button type="button" onClick={copyAddress}>Copy full address</button></div></div>
            <dl className="ue-wallet-facts"><div><dt>Balance</dt><dd>{balance} {isDemo ? "native" : "POL"}</dd></div><div><dt>Data source</dt><dd>{modeLabel}</dd></div><div><dt>Chain ID</dt><dd>{chainId || "Unavailable"}</dd></div><div><dt>Network status</dt><dd className={networkStatus === "ready" ? "good" : "warning"}>{networkStatus}</dd></div></dl>
            {!isDemo && networkStatus === "wrong-network" && <button className="ue-button primary wide" onClick={switchNetwork}>Switch to Polygon Amoy</button>}
            <div className="ue-wallet-actions"><Link href="/create" className="ue-button primary">List a property</Link><Link href="/author" className="ue-button ghost">My properties</Link></div>
            <p className="ue-wallet-help">To disconnect completely, use the connected-sites control in your wallet extension.</p>
          </> : <>
            <button className="ue-button primary wide" onClick={connectWallet} disabled={walletStatus === "connecting"}>{walletStatus === "connecting" ? "Waiting for wallet…" : "Connect wallet"}</button>
            <div className="ue-wallet-requirements"><strong>Before connecting</strong><ul><li>Install an EVM-compatible wallet such as MetaMask.</li><li>Review every transaction before confirming.</li><li>Use test POL only when the application is configured for Amoy.</li></ul></div>
          </>}
        </div>
      </div></section>
    </Layout>
  );
};

export default ConnectOne;
