import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import { useRealEstate } from "../../context";

const Layout = ({ title = "Kevintrolix RealX", description = "Discover and trade property on-chain.", children }) => {
  const { transactionState, notification, dismissNotification } = useRealEstate();
  const transactionActive = ["preparing", "pending"].includes(transactionState.phase);
  return (
    <>
      <Head><title>{title}</title><meta name="description" content={description} /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:type" content="website" /><meta name="theme-color" content="#6d4aff" /></Head>
      <a className="ue-skip-link" href="#main-content">Skip to content</a>
      <Header />
      {transactionActive && (
        <div className="ue-transaction" role="status" aria-live="polite">
          <span className="ue-spinner" />
          <span>{transactionState.label}</span>
          {transactionState.explorerUrl && (
            <a href={transactionState.explorerUrl} target="_blank" rel="noreferrer">View transaction</a>
          )}
        </div>
      )}
      {notification && (
        <div
          className={`ue-notification ${notification.type}`}
          role={notification.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <span>{notification.message}</span>
          <button onClick={dismissNotification} aria-label="Dismiss notification">&times;</button>
        </div>
      )}
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
