import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Layout, Loader, PageHero, PropertyForm } from "../PageComponents/Components";
import { useRealEstate } from "../context";

export default function Update() {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const { currentAccount, connectWallet, getProperty, updateProperty, modeLabel, transactionState } = useRealEstate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const busy = ["preparing", "pending"].includes(transactionState.phase);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      setProperty(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getProperty(id).then((result) => {
      if (active) {
        setProperty(result);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [getProperty, id, router.isReady]);

  const isOwner = Boolean(property?.owner && currentAccount && property.owner.toLowerCase() === currentAccount.toLowerCase());
  const submit = async (form) => {
    if (await updateProperty(id, form)) router.push(`/detail?id=${id}`);
  };

  return (
    <Layout title="Update property | Kevintrolix RealX">
      <PageHero eyebrow="OWNER WORKSPACE" title="Update property information" copy="Change the title, category, location, description or media attached to your property record." />
      <section className="ue-section ue-create-section"><div className="ue-container">
        {loading ? <Loader label="Loading property…" /> : !property ? <div className="ue-empty"><h3>Property not found</h3><p>Return to the marketplace and choose an available property.</p><Link href="/explor" className="ue-button primary">Explore properties</Link></div> : !currentAccount ? <div className="ue-access-card"><span className="ue-eyebrow">WALLET REQUIRED</span><h2>Connect the owner wallet</h2><p>Only the wallet currently recorded as owner can update this property.</p><button className="ue-button primary" onClick={connectWallet}>Connect wallet</button></div> : !isOwner ? <div className="ue-access-card"><span className="ue-eyebrow">OWNER-ONLY ACTION</span><h2>This wallet cannot edit the property</h2><p>Switch to the owner wallet or return to the property details.</p><Link href={`/detail?id=${id}`} className="ue-button primary">View property</Link></div> : <PropertyForm initialValues={property} onSubmit={submit} busy={busy} submitLabel="Save property changes" includePrice={false} modeLabel={modeLabel} />}
      </div></section>
    </Layout>
  );
}
