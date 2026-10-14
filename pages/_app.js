import "../styles/globals.css";
import "../styles/unlock-estate.css";
import "../styles/modern-ui.css";
import { RealEstateProvider } from "../context";

export default function App({ Component, pageProps }) {
  return (
    <RealEstateProvider>
      <Component {...pageProps} />
    </RealEstateProvider>
  );
}
