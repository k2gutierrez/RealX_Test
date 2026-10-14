export const ARTICLES = [
  {
    slug: "how-onchain-property-marketplaces-work",
    title: "How on-chain property marketplaces work",
    category: "Guides",
    date: "July 18, 2026",
    image: "/blog/blog-02.jpg",
    excerpt: "A practical look at wallet ownership, marketplace records and direct peer-to-peer settlement.",
    paragraphs: [
      "Kevintrolix RealX represents each marketplace listing as a structured record in a Solidity contract. The record contains its current owner, price, category, location, description and an image reference.",
      "A purchase sends the exact listed value directly to the current owner and then changes the owner recorded by the contract. This keeps settlement transparent while avoiding custody of sale proceeds inside the marketplace.",
      "The application also supports community reviews and likes. Those interactions are associated with a property identifier so they remain connected as ownership changes.",
    ],
  },
  {
    slug: "using-ipfs-for-property-media",
    title: "Using IPFS for durable property media",
    category: "IPFS",
    date: "July 25, 2026",
    image: "/blog/blog-03.jpg",
    excerpt: "Why portable IPFS references are useful and how the marketplace keeps uploads optional.",
    paragraphs: [
      "Property images can be uploaded to Pinata's public IPFS network or supplied as an existing public URL. Uploaded files are recorded using a portable ipfs:// reference rather than being tied to one gateway domain.",
      "The interface resolves that reference through the configured public gateway. If Pinata is unavailable, users can still paste a URL or select one of the starter images, keeping the listing workflow accessible during development.",
      "Upload credentials stay in the server environment and are never sent to the browser. File type and size checks are applied before the server forwards an image to the pinning provider.",
    ],
  },
  {
    slug: "testing-wallet-marketplace-transactions",
    title: "Testing wallet marketplace transactions safely",
    category: "Security",
    date: "August 1, 2026",
    image: "/blog/blog-04.jpg",
    excerpt: "A release checklist for test wallets, exact-value purchases and ownership transitions.",
    paragraphs: [
      "Use dedicated test wallets and test POL when validating the Polygon Amoy deployment. Never use a wallet containing production funds for development or demonstration transactions.",
      "The most important end-to-end scenarios are listing a property, updating it as the owner, rejecting updates from another wallet, purchasing at the exact price and confirming that update rights move to the buyer.",
      "Reviews, duplicate-like prevention, listing fees and withdrawals should also be verified against the deployed address before the public application is released.",
    ],
  },
  {
    slug: "reading-marketplace-rankings",
    title: "Reading creator and property rankings",
    category: "Marketplace",
    date: "August 3, 2026",
    image: "/blog/blog-05.jpg",
    excerpt: "Understand creator portfolio value, marketplace share and property price rankings.",
    paragraphs: [
      "Creator rankings aggregate the current price of every property owned by the same wallet. This produces a portfolio view rather than a measure of historical sales volume.",
      "Property rankings order active marketplace records by their current listed price. Category collections provide a complementary way to browse without treating price as a quality score.",
      "All ranking values react to the same marketplace state used by property cards and author portfolios, so updates and ownership transfers remain consistent across the interface.",
    ],
  },
];

export const FORUM_TOPICS = [
  { id: "verification", title: "What should a property verification process include?", author: "Community guide", replies: 12, category: "Due diligence" },
  { id: "amoy", title: "Polygon Amoy test-wallet setup and common issues", author: "Kevintrolix support", replies: 8, category: "Development" },
  { id: "media", title: "Choosing between an IPFS image and a public URL", author: "Marketplace creator", replies: 5, category: "IPFS" },
];
