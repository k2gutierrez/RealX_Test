const assert = require("assert");
const { ethers } = require("ethers");
const {
  ensureTargetChain,
  isContractConfigured,
  normalizeChainId,
  parseWeb3Error,
  transactionUrl,
} = require("../services/web3");
const { normalizeProperty, normalizeReview, shortAddress } = require("../services/normalizers");
const {
  DEMO_STORAGE_KEYS,
  readStoredJson,
  writeStoredJson,
} = require("../services/storage");
const { validatePropertyForm, validateReview } = require("../services/validation");
const {
  MAX_IMAGE_BYTES,
  buildPropertyMetadata,
  resolveMediaUrl,
  validateImageFile,
  validateImageReference,
} = require("../services/media");

const TARGET_CHAIN = {
  chainId: "0x13882",
  chainName: "Polygon Amoy",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: ["https://polygon-amoy.example"],
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
};

class MemoryStorage {
  constructor(initial = {}) {
    this.values = { ...initial };
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.values, key) ? this.values[key] : null;
  }
  setItem(key, value) {
    this.values[key] = value;
  }
}

async function main() {
  assert.equal(normalizeChainId(80002), TARGET_CHAIN.chainId);
  assert.equal(normalizeChainId("0x013882"), TARGET_CHAIN.chainId);
  assert.equal(isContractConfigured(ethers.constants.AddressZero), false);
  assert.equal(isContractConfigured("0x1111111111111111111111111111111111111111"), true);
  assert.equal(parseWeb3Error({ code: 4001 }), "The wallet request was rejected.");
  assert.equal(
    parseWeb3Error({ reason: "execution reverted: You are not the owner" }),
    "You are not the owner"
  );
  assert.equal(
    transactionUrl(TARGET_CHAIN, "0xabc"),
    "https://amoy.polygonscan.com/tx/0xabc"
  );

  const property = normalizeProperty({
    productID: ethers.BigNumber.from(7),
    owner: "0x1111111111111111111111111111111111111111",
    price: ethers.utils.parseEther("1.25"),
    propertyTitle: "Lagoon View",
    category: "Housing",
    images: "ipfs://property",
    propertyAddress: "Lagos",
    description: "Waterfront home",
  });
  assert.equal(property.productID, "7");
  assert.equal(property.price, "1.25");
  assert.equal(shortAddress(property.owner), "0x1111…1111");

  const review = normalizeReview([
    property.owner,
    ethers.BigNumber.from(7),
    5,
    "Excellent",
    ethers.BigNumber.from(3),
    ethers.BigNumber.from(9),
  ]);
  assert.deepEqual(
    { productId: review.productId, rating: review.rating, likes: review.likes, reviewIndex: review.reviewIndex },
    { productId: "7", rating: 5, likes: 3, reviewIndex: "9" }
  );

  const storage = new MemoryStorage();
  const fallback = [{ productID: "1" }];
  const firstRead = readStoredJson(storage, DEMO_STORAGE_KEYS.properties, fallback);
  firstRead[0].productID = "changed";
  assert.equal(fallback[0].productID, "1");
  writeStoredJson(storage, DEMO_STORAGE_KEYS.properties, fallback);
  assert.deepEqual(readStoredJson(storage, DEMO_STORAGE_KEYS.properties, []), fallback);

  assert.equal(
    validatePropertyForm({
      price: "1",
      propertyTitle: "Villa",
      category: "Housing",
      images: "ipfs://villa",
      propertyAddress: "Abuja",
      description: "Four bedrooms",
    }),
    ""
  );
  assert.equal(validatePropertyForm({ price: "0" }), "Price must be greater than zero.");
  assert.equal(validateReview(5, "Great"), "");
  assert.equal(validateReview(6, "Great"), "Rating must be between 1 and 5.");
  assert.equal(resolveMediaUrl("ipfs://bafy-property/image.webp"), "https://gateway.pinata.cloud/ipfs/bafy-property/image.webp");
  assert.equal(resolveMediaUrl("https://example.com/home.jpg"), "https://example.com/home.jpg");
  assert.equal(validateImageReference("javascript:alert(1)"), "Use an http(s), ipfs://, or supplied local image reference.");
  assert.equal(validateImageFile({ type: "image/png", size: MAX_IMAGE_BYTES }), "");
  assert.equal(validateImageFile({ type: "image/svg+xml", size: 100 }), "Choose a JPEG, PNG, WebP, GIF, or AVIF image.");
  assert.deepEqual(buildPropertyMetadata({
    propertyTitle: "Villa",
    description: "Four bedrooms",
    images: "ipfs://villa",
    category: "Housing",
    propertyAddress: "Abuja",
  }), {
    name: "Villa",
    description: "Four bedrooms",
    image: "ipfs://villa",
    external_url: "",
    attributes: [
      { trait_type: "Category", value: "Housing" },
      { trait_type: "Address", value: "Abuja" },
      { trait_type: "Price currency", value: "POL" },
    ],
  });

  const switchCalls = [];
  const switchWallet = {
    request: async ({ method, params }) => {
      switchCalls.push({ method, params });
      if (method === "eth_chainId") return "0x1";
      return null;
    },
  };
  assert.equal(await ensureTargetChain(switchWallet, TARGET_CHAIN), TARGET_CHAIN.chainId);
  assert.equal(switchCalls[1].method, "wallet_switchEthereumChain");

  const addCalls = [];
  const addWallet = {
    request: async ({ method, params }) => {
      addCalls.push({ method, params });
      if (method === "eth_chainId") return "0x1";
      if (method === "wallet_switchEthereumChain") {
        const error = new Error("Unknown chain");
        error.code = 4902;
        throw error;
      }
      return null;
    },
  };
  await ensureTargetChain(addWallet, TARGET_CHAIN);
  assert.equal(addCalls[2].method, "wallet_addEthereumChain");

  console.log("Data-layer checks passed: normalization, storage, media/IPFS, validation, errors, and network switching.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
