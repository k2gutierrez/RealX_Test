const isConfiguredAddress = (value) => /^0x[0-9a-fA-F]{40}$/.test(String(value || ""))
  && !/^0x0{40}$/i.test(String(value));

const health = (request, response) => {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  response.setHeader("Cache-Control", "no-store, max-age=0");
  return response.status(200).json({
    status: "ok",
    service: "unlock-estate",
    chainId: 80002,
    liveContractConfigured: isConfiguredAddress(process.env.NEXT_PUBLIC_REAL_ESTATE_CONTRACT),
    ipfsUploadsConfigured: Boolean(String(process.env.PINATA_JWT || "").trim()),
    checkedAt: new Date().toISOString(),
  });
};

export default health;
