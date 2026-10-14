export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_REAL_ESTATE_CONTRACT || "";

export const TARGET_CHAIN = {
  chainId: "0x13882",
  chainName: "Polygon Amoy",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: [
    process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com",
    "https://polygon-amoy.drpc.org",
  ],
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
};

export const REAL_ESTATE_ABI = [
  "function listProperty(address owner,uint256 price,string _propertyTitle,string _category,string _images,string _propertyAddress,string _description) payable returns (uint256,string,string,string,string)",
  "function updateProperty(address owner,uint256 productId,string _propertyTitle,string _category,string _images,string _propertyAddress,string _description) returns (uint256,string,string,string,string,string)",
  "function updatePrice(address owner,uint256 productId,uint256 price) returns (string)",
  "function buyProperty(uint256 id,address buyer) payable",
  "function getAllProperties() view returns (tuple(uint256 productID,address owner,uint256 price,string propertyTitle,string category,string images,string propertyAddress,string description,address[] reviewers,string[] reviews)[])",
  "function getProperty(uint256 id) view returns (uint256,address,uint256,string,string,string,string,string,address[],string[])",
  "function getUserProperties(address user) view returns (tuple(uint256 productID,address owner,uint256 price,string propertyTitle,string category,string images,string propertyAddress,string description,address[] reviewers,string[] reviews)[])",
  "function addReview(uint256 productId,uint8 rating,string comment,address user)",
  "function getProductReviews(uint256 productId) view returns (tuple(address reviewer,uint256 productId,uint8 rating,string comment,uint256 likes,uint256 reviewIndex)[])",
  "function getUserReviews(address user) view returns (tuple(address reviewer,uint256 productId,uint8 rating,string comment,uint256 likes,uint256 reviewIndex)[])",
  "function likeReview(uint256 productId,uint256 reviewIndex,address user)",
  "function getHighestRatedProduct() view returns (uint256)",
  "function getListingPrice() view returns (uint256)",
  "function updateListingPrice(uint256 _listingPrice,address owner)",
  "function withdrawListingFees()",
  "event PropertyListed(uint256 indexed id,address indexed owner,uint256 price)",
  "event PropertySold(uint256 indexed id,address indexed oldOwner,address indexed newOwner,uint256 price)",
  "event PropertyResold(uint256 indexed id,address indexed oldOwner,address indexed newOwner,uint256 price)",
  "event PropertyUpdated(uint256 indexed id,address indexed owner)",
  "event PropertyPriceUpdated(uint256 indexed id,address indexed owner,uint256 oldPrice,uint256 newPrice)",
  "event ReviewAdded(uint256 indexed productId,address indexed reviewer,uint8 rating,string comment)",
  "event ReviewLiked(uint256 indexed productId,uint256 indexed reviewIndex,address indexed liker,uint256 likes)",
  "event ListingPriceUpdated(uint256 oldPrice,uint256 newPrice)",
  "event ListingFeesWithdrawn(address indexed recipient,uint256 amount)",
];
