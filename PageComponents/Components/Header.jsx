import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useRealEstate } from "../../context";

const nav = [
  ["/", "Home"],
  ["/explor", "Explore"],
  ["/collection", "Collections"],
  ["/active", "Activity"],
  ["/creator", "Creators"],
  ["/author", "My properties"],
];

const Header = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    currentAccount,
    balance,
    connectWallet,
    shortAddress,
    isDemo,
    modeLabel,
    walletStatus,
    networkStatus,
    switchNetwork,
  } = useRealEstate();

  return (
    <header className="ue-header">
      <div className="ue-container ue-header-inner">
        <Link href="/" className="ue-brand" aria-label="Kevintrolix RealX home">
          <span className="ue-brand-mark">K</span>
          <span><strong>KEVINTROLIX</strong><small>REALX</small></span>
        </Link>

        <button className="ue-menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>Menu <span aria-hidden="true">{open ? "×" : "☰"}</span></button>
        <nav className={`ue-nav ${open ? "is-open" : ""}`}>
          {nav.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={router.pathname === href ? "active" : ""}>{label}</Link>
          ))}
        </nav>

        <div className="ue-wallet-wrap">
          <span className={`ue-demo-pill ${isDemo ? "demo" : "live"}`}>{modeLabel}</span>
          {!isDemo && networkStatus === "wrong-network" && (
            <button className="ue-network-button" onClick={switchNetwork}>Switch to Amoy</button>
          )}
          {currentAccount ? (
            <Link href="/connect" className="ue-wallet-button connected">
              <span className="ue-wallet-dot" />
              <span>{shortAddress(currentAccount)}<small>{balance} {isDemo ? "native" : "POL"}</small></span>
            </Link>
          ) : (
            <button className="ue-wallet-button" onClick={connectWallet} disabled={walletStatus === "connecting"}>
              {walletStatus === "connecting" ? "Connecting..." : "Connect wallet"}
            </button>
          )}
          <Link href="/create" className="ue-icon-button" aria-label="List a property">＋</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
