import { useRouter } from "next/router";
import { AuthorFive, AuthorFour, AuthorOne, AuthorThree, AuthorTwo } from "../PageComponents/AuthorPage";
import { Layout } from "../PageComponents/Components";
import { useRealEstate } from "../context";

export default function Author() {
  const { query } = useRouter();
  const { properties, currentAccount, shortAddress, modeLabel } = useRealEstate();
  const requestedAddress = Array.isArray(query.address) ? query.address[0] : query.address;
  const address = String(requestedAddress || currentAccount || "");
  const owned = address ? properties.filter((property) => property.owner?.toLowerCase() === address.toLowerCase()) : [];

  return (
    <Layout title="Property portfolio | Kevintrolix RealX">
      <AuthorOne address={address} shortAddress={shortAddress} external={Boolean(requestedAddress)} />
      <section className="ue-section">
        <div className="ue-container">
          <AuthorTwo owned={owned} all={properties} />
          <AuthorThree owned={owned} all={properties} hasAddress={Boolean(address)} />
          <AuthorFour />
          <AuthorFive modeLabel={modeLabel} />
        </div>
      </section>
    </Layout>
  );
}
