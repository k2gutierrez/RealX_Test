import Link from "next/link";
import { useRealEstate } from "../../context";

const RankingTwo = ({ mode, creators, properties }) => {
  const { shortAddress } = useRealEstate();
  if (mode === "Properties") {
    return (
      <div className="ue-ranking-table">
        <div className="ue-ranking-head"><span>Rank</span><span>Property</span><span>Category</span><span>Owner</span><span>Price</span></div>
        {[...properties].sort((a, b) => Number(b.price) - Number(a.price)).map((property, index) => (
          <Link href={`/detail?id=${property.productID}`} className="ue-ranking-row" key={property.productID}>
            <span className="ue-rank">{String(index + 1).padStart(2, "0")}</span>
            <span><strong>{property.propertyTitle}</strong><small>Property #{property.productID}</small></span>
            <span>{property.category}</span>
            <span>{shortAddress(property.owner)}</span>
            <span><strong>{Number(property.price || 0).toFixed(2)} POL</strong></span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="ue-ranking-table">
      <div className="ue-ranking-head"><span>Rank</span><span>Creator</span><span>Properties</span><span>Share</span><span>Portfolio</span></div>
      {creators.map((creator, index) => {
        const totalMarket = creators.reduce((sum, item) => sum + item.total, 0);
        const share = totalMarket ? (creator.total / totalMarket) * 100 : 0;
        return (
          <Link href={`/author?address=${creator.owner}`} className="ue-ranking-row" key={creator.owner}>
            <span className="ue-rank">{String(index + 1).padStart(2, "0")}</span>
            <span><strong>{shortAddress(creator.owner)}</strong><small>Marketplace creator</small></span>
            <span>{creator.count}</span>
            <span>{share.toFixed(1)}%</span>
            <span><strong>{creator.total.toFixed(2)} POL</strong></span>
          </Link>
        );
      })}
    </div>
  );
};

export default RankingTwo;
