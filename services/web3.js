const { ethers } = require("ethers");

const normalizeChainId = (chainId) => {
  if (chainId === undefined || chainId === null || chainId === "") return "";
  if (typeof chainId === "string" && chainId.startsWith("0x")) {
    return `0x${BigInt(chainId).toString(16)}`;
  }
  return `0x${BigInt(chainId).toString(16)}`;
};

const isContractConfigured = (address) =>
  ethers.utils.isAddress(address) && address !== ethers.constants.AddressZero;

const createWalletProvider = (ethereum) =>
  ethereum ? new ethers.providers.Web3Provider(ethereum, "any") : null;

const createReadProvider = (targetChain) => {
  const network = {
    chainId: Number(BigInt(targetChain.chainId)),
    name: targetChain.chainName,
  };
  const urls = [...new Set((targetChain.rpcUrls || []).filter(Boolean))];
  const providers = urls.map(
    (url) => new ethers.providers.StaticJsonRpcProvider(url, network)
  );
  if (providers.length <= 1) return providers[0] || null;
  return new ethers.providers.FallbackProvider(
    providers.map((provider, index) => ({
      provider,
      priority: index + 1,
      stallTimeout: 2500,
      weight: 1,
    })),
    1
  );
};

const createContract = ({ address, abi, provider, write = false }) => {
  if (!provider || !isContractConfigured(address)) return null;
  return new ethers.Contract(address, abi, write ? provider.getSigner() : provider);
};

const ensureTargetChain = async (ethereum, targetChain) => {
  if (!ethereum) throw new Error("Install MetaMask or another EVM wallet to connect.");
  const currentChainId = normalizeChainId(
    await ethereum.request({ method: "eth_chainId" })
  );
  const targetChainId = normalizeChainId(targetChain.chainId);
  if (currentChainId === targetChainId) return targetChainId;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainId }],
    });
  } catch (error) {
    if (error?.code !== 4902) throw error;
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{ ...targetChain, chainId: targetChainId }],
    });
  }
  return targetChainId;
};

const parseWeb3Error = (error, fallback = "Transaction failed") => {
  if (error?.code === 4001 || error?.code === "ACTION_REJECTED") {
    return "The wallet request was rejected.";
  }
  if (error?.code === -32002) {
    return "A wallet request is already waiting for your response.";
  }

  const raw =
    error?.error?.data?.message ||
    error?.error?.message ||
    error?.data?.message ||
    error?.reason ||
    error?.message ||
    fallback;

  return String(raw)
    .replace(/^execution reverted:\s*/i, "")
    .replace(/^MetaMask Tx Signature:\s*/i, "")
    .replace(/^Error:\s*/i, "")
    .trim();
};

const transactionUrl = (targetChain, hash) =>
  hash && targetChain.blockExplorerUrls?.[0]
    ? `${targetChain.blockExplorerUrls[0].replace(/\/$/, "")}/tx/${hash}`
    : "";

module.exports = {
  createContract,
  createReadProvider,
  createWalletProvider,
  ensureTargetChain,
  isContractConfigured,
  normalizeChainId,
  parseWeb3Error,
  transactionUrl,
};
