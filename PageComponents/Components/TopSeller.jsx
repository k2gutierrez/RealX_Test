import Link from "next/link";
import { useRealEstate } from "../../context";

const TopSeller = ({ creators = [] }) => {
  const { shortAddress } = useRealEstate();
  return <div className="ue-creators-list">{creators.slice(0, 5).map((creator, index) => (
    <Link href={`/author?address=${creator.owner}`} className="ue-creator-row" key={creator.owner}><span className="ue-rank">{String(index + 1).padStart(2, "0")}</span><span className="ue-avatar large">{creator.owner.slice(2, 4).toUpperCase()}</span><span className="ue-creator-name"><strong>{shortAddress(creator.owner)}</strong><small>{creator.count} properties</small></span><span className="ue-creator-value"><strong>{creator.total.toFixed(2)} POL</strong><small>Portfolio worth</small></span></Link>
  ))}</div>;
};
export default TopSeller;
