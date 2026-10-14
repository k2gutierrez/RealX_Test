const Statistick = ({ properties = [], creators = [] }) => {
  const value = properties.reduce((sum, property) => sum + Number(property.price || 0), 0);
  return <div className="ue-about-stats"><div><strong>{properties.length}</strong><span>Marketplace properties</span></div><div><strong>{creators.length}</strong><span>Current owners</span></div><div><strong>{value.toFixed(2)} POL</strong><span>Combined listing value</span></div><div><strong>80002</strong><span>Polygon Amoy chain</span></div></div>;
};

export default Statistick;
