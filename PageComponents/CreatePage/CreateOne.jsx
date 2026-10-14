import { useRouter } from "next/router";
import { Layout, PageHero, PropertyForm } from "../Components";
import { useRealEstate } from "../../context";

const CreateOne = () => {
  const router = useRouter();
  const { createProperty, listingPrice, modeLabel, transactionState } = useRealEstate();
  const busy = ["preparing", "pending"].includes(transactionState.phase);

  const submit = async (form) => {
    const created = await createProperty(form);
    if (created) router.push("/author");
  };

  return (
    <Layout title="List a property | Kevintrolix RealX">
      <PageHero eyebrow="CREATE ON-CHAIN RECORD" title="List your property" copy="Publish the property details, asking price and media used throughout the marketplace." />
      <section className="ue-section ue-create-section"><div className="ue-container"><PropertyForm onSubmit={submit} busy={busy} listingPrice={listingPrice} modeLabel={modeLabel} /></div></section>
    </Layout>
  );
};

export default CreateOne;
