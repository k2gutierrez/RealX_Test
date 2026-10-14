import { formatPol } from "../../services/normalizers";

const AuthorTwo = ({ owned = [], all = [] }) => {
  const portfolio = owned.reduce((sum, property) => sum + Number(property.price || 0), 0);
  const categories = new Set(owned.map((property) => property.category)).size;
  return (
    <div className="ue-author-stats">
      <div><span>Owned properties</span><strong>{owned.length}</strong></div>
      <div><span>Portfolio value</span><strong>{formatPol(portfolio)} POL</strong></div>
      <div><span>Categories</span><strong>{categories}</strong></div>
      <div><span>Marketplace share</span><strong>{all.length ? `${((owned.length / all.length) * 100).toFixed(0)}%` : "0%"}</strong></div>
    </div>
  );
};

export default AuthorTwo;
