import Product from "./Product";

const PropertyGrid = ({ properties, empty = "No properties found." }) => properties?.length ? (
  <div className="ue-property-grid">{properties.map((property) => <Product key={property.productID} property={property} />)}</div>
) : <div className="ue-empty"><h3>{empty}</h3><p>Try another filter or list the first property in this collection.</p></div>;

export default PropertyGrid;
