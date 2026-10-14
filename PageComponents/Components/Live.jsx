import React from "react";

const Live = ({ label = "Marketplace data", active = false }) => {
  return <span className={`ue-demo-pill ${active ? "live" : "demo"}`}>{label}</span>;
};

export default Live;
