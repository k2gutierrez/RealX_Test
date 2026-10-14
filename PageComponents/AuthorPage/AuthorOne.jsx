import { PageHero } from "../Components";

const AuthorOne = ({ address, shortAddress, external }) => (
  <PageHero
    eyebrow={external ? "CREATOR PORTFOLIO" : "YOUR COLLECTION"}
    title={address ? `${shortAddress(address)} properties` : "Connect your wallet"}
    copy={address ? "Review the wallet's current property portfolio and compare it with the full marketplace." : "Connect a wallet to see the properties it currently owns."}
  />
);

export default AuthorOne;
