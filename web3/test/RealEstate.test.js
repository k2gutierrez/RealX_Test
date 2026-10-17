const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealEstate", function () {
  let marketplace;
  let deployer;
  let seller;
  let buyer;
  let reviewer;
  let otherBuyer;

  const oneEther = ethers.utils.parseEther("1");

  async function expectRevert(promise, message) {
    try {
      await promise;
      expect.fail("Expected transaction to revert");
    } catch (error) {
      expect(error.message).to.include(message);
    }
  }

  beforeEach(async function () {
    [deployer, seller, buyer, reviewer, otherBuyer] = await ethers.getSigners();
    const RealEstate = await ethers.getContractFactory("RealEstate");
    marketplace = await RealEstate.deploy();
    await marketplace.deployed();
  });

  async function listProperty(
    owner = seller,
    price = oneEther,
    title = "Skyline Villa",
    overrides = {}
  ) {
    return marketplace.connect(owner).listProperty(
      owner.address,
      price,
      title,
      "Housing",
      "https://images.example/villa.jpg",
      "12 Palm Avenue, Lagos",
      "A modern four-bedroom home with a private garden.",
      overrides
    );
  }

  it("lists and retrieves the same property shape used by the frontend", async function () {
    const receipt = await (await listProperty()).wait();
    const listed = receipt.events.find((event) => event.event === "PropertyListed");
    expect(listed.args.id.toString()).to.equal("1");
    expect(listed.args.owner).to.equal(seller.address);
    expect(listed.args.price.toString()).to.equal(oneEther.toString());

    const property = await marketplace.getProperty(1);
    expect(property[0].toString()).to.equal("1");
    expect(property[1]).to.equal(seller.address);
    expect(property[2].toString()).to.equal(oneEther.toString());
    expect(property[3]).to.equal("Skyline Villa");
    expect(property[4]).to.equal("Housing");

    const all = await marketplace.getAllProperties();
    expect(all).to.have.length(1);
  });

  it("lets only the current owner update details and price", async function () {
    await listProperty();

    const updateReceipt = await (await marketplace.connect(seller).updateProperty(
      seller.address,
      1,
      "Updated Villa",
      "Farmhouse",
      "https://images.example/updated.jpg",
      "Lekki, Lagos",
      "Updated description"
    )).wait();
    expect(updateReceipt.events.find((event) => event.event === "PropertyUpdated").args.id.toString()).to.equal("1");

    const newPrice = ethers.utils.parseEther("2");
    const priceReceipt = await (
      await marketplace.connect(seller).updatePrice(seller.address, 1, newPrice)
    ).wait();
    const priceEvent = priceReceipt.events.find((event) => event.event === "PropertyPriceUpdated");
    expect(priceEvent.args.oldPrice.toString()).to.equal(oneEther.toString());
    expect(priceEvent.args.newPrice.toString()).to.equal(newPrice.toString());

    const property = await marketplace.getProperty(1);
    expect(property[2].toString()).to.equal(ethers.utils.parseEther("2").toString());
    expect(property[3]).to.equal("Updated Villa");

    await expectRevert(
      marketplace.connect(buyer).updatePrice(buyer.address, 1, oneEther)
    , "You are not the owner");
  });

  it("transfers the exact purchase amount and changes property ownership", async function () {
    await listProperty();
    const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

    const receipt = await (
      await marketplace.connect(buyer).buyProperty(1, buyer.address, { value: oneEther })
    ).wait();
    const sold = receipt.events.find((event) => event.event === "PropertySold");
    expect(sold.args.id.toString()).to.equal("1");
    expect(sold.args.oldOwner).to.equal(seller.address);
    expect(sold.args.newOwner).to.equal(buyer.address);
    expect(sold.args.price.toString()).to.equal(oneEther.toString());

    const property = await marketplace.getProperty(1);
    expect(property[1]).to.equal(buyer.address);
    expect((await ethers.provider.getBalance(seller.address)).toString()).to.equal(
      sellerBalanceBefore.add(oneEther).toString()
    );

    await expectRevert(
      marketplace.connect(buyer).buyProperty(1, buyer.address, { value: oneEther })
    , "RealEstate__CannotBuyOwnProperty");
  });

  it("rejects underpayment, overpayment, and forged wallet arguments", async function () {
    await listProperty();

    await expectRevert(
      marketplace.connect(buyer).buyProperty(1, buyer.address, { value: ethers.utils.parseEther("0.9") }),
      "Send the exact property price"
    );
    await expectRevert(
      marketplace.connect(buyer).buyProperty(1, buyer.address, { value: ethers.utils.parseEther("1.1") }),
      "Send the exact property price"
    );
    await expectRevert(
      marketplace.connect(buyer).buyProperty(1, reviewer.address, { value: oneEther })
    , "Buyer must be caller");
  });

  it("stores reviews, prevents duplicate likes, and identifies the highest-rated property", async function () {
    await listProperty();
    await listProperty(seller, ethers.utils.parseEther("2"), "Ocean View Office");

    const reviewReceipt = await (
      await marketplace.connect(reviewer).addReview(1, 4, "Great location", reviewer.address)
    ).wait();
    const added = reviewReceipt.events.find((event) => event.event === "ReviewAdded");
    expect(added.args.productId.toString()).to.equal("1");
    expect(added.args.reviewer).to.equal(reviewer.address);
    await marketplace.connect(buyer).addReview(2, 5, "Excellent workspace", buyer.address);

    let reviews = await marketplace.getProductReviews(1);
    expect(reviews).to.have.length(1);
    expect(reviews[0].rating).to.equal(4);

    await marketplace.connect(buyer).likeReview(1, 0, buyer.address);
    reviews = await marketplace.getProductReviews(1);
    expect(reviews[0].likes.toString()).to.equal("1");
    await expectRevert(
      marketplace.connect(buyer).likeReview(1, 0, buyer.address),
      "Review already liked"
    );

    expect((await marketplace.getHighestRatedProduct()).toString()).to.equal("2");
    expect(await marketplace.getUserReviews(reviewer.address)).to.have.length(1);
  });

  it("filters properties by their current wallet owner", async function () {
    await listProperty();
    await marketplace.connect(buyer).buyProperty(1, buyer.address, { value: oneEther });

    expect(await marketplace.getUserProperties(seller.address)).to.have.length(0);
    expect(await marketplace.getUserProperties(buyer.address)).to.have.length(1);
  });

  it("allows only the deployer to update the optional listing price", async function () {
    const fee = ethers.utils.parseEther("0.01");
    await marketplace.updateListingPrice(fee, deployer.address);
    expect((await marketplace.getListingPrice()).toString()).to.equal(fee.toString());

    await expectRevert(
      marketplace.connect(seller).updateListingPrice(fee, seller.address),
      "Only contract owner"
    );
  });

  it("validates all required listing fields and forged seller addresses", async function () {
    await expectRevert(
      marketplace.connect(seller).listProperty(
        buyer.address,
        oneEther,
        "Skyline Villa",
        "Housing",
        "https://images.example/villa.jpg",
        "12 Palm Avenue, Lagos",
        "Description"
      ),
      "Owner must be caller"
    );
    await expectRevert(listProperty(seller, 0), "Price must be greater than zero");
    await expectRevert(listProperty(seller, oneEther, ""), "Title is required");
    await expectRevert(
      marketplace.connect(seller).listProperty(
        seller.address,
        oneEther,
        "Skyline Villa",
        "Housing",
        "https://images.example/villa.jpg",
        "",
        "Description"
      ),
      "Property address is required"
    );
    await expectRevert(
      marketplace.connect(seller).listProperty(
        seller.address,
        oneEther,
        "Skyline Villa",
        "Housing",
        "https://images.example/villa.jpg",
        "12 Palm Avenue, Lagos",
        ""
      ),
      "Description is required"
    );
  });

  it("enforces, accounts for, and withdraws the optional listing fee", async function () {
    const fee = ethers.utils.parseEther("0.01");
    const updateReceipt = await (
      await marketplace.updateListingPrice(fee, deployer.address)
    ).wait();
    const updated = updateReceipt.events.find((event) => event.event === "ListingPriceUpdated");
    expect(updated.args.oldPrice.toString()).to.equal("0");
    expect(updated.args.newPrice.toString()).to.equal(fee.toString());

    await expectRevert(listProperty(), "Send the exact listing price");
    await expectRevert(
      listProperty(seller, oneEther, "Skyline Villa", { value: fee.add(1) }),
      "Send the exact listing price"
    );
    await listProperty(seller, oneEther, "Skyline Villa", { value: fee });
    expect((await ethers.provider.getBalance(marketplace.address)).toString()).to.equal(fee.toString());

    await expectRevert(
      marketplace.connect(seller).withdrawListingFees(),
      "Only contract owner"
    );
    const withdrawReceipt = await (await marketplace.withdrawListingFees()).wait();
    const withdrawn = withdrawReceipt.events.find((event) => event.event === "ListingFeesWithdrawn");
    expect(withdrawn.args.recipient).to.equal(deployer.address);
    expect(withdrawn.args.amount.toString()).to.equal(fee.toString());
    expect((await ethers.provider.getBalance(marketplace.address)).toString()).to.equal("0");
    await expectRevert(marketplace.withdrawListingFees(), "No listing fees to withdraw");
  });

  it("rejects invalid reviews, forged reviewers, and mismatched review likes", async function () {
    await listProperty();
    await listProperty(seller, ethers.utils.parseEther("2"), "Ocean View Office");

    await expectRevert(
      marketplace.connect(reviewer).addReview(1, 0, "Too low", reviewer.address),
      "Rating must be between 1 and 5"
    );
    await expectRevert(
      marketplace.connect(reviewer).addReview(1, 6, "Too high", reviewer.address),
      "Rating must be between 1 and 5"
    );
    await expectRevert(
      marketplace.connect(reviewer).addReview(1, 5, "", reviewer.address),
      "Comment is required"
    );
    await expectRevert(
      marketplace.connect(reviewer).addReview(1, 5, "Forged", buyer.address),
      "Reviewer must be caller"
    );

    await marketplace.connect(reviewer).addReview(1, 5, "Excellent", reviewer.address);
    await expectRevert(
      marketplace.connect(buyer).likeReview(2, 0, buyer.address),
      "Review does not belong to property"
    );
    await expectRevert(
      marketplace.connect(buyer).likeReview(1, 0, otherBuyer.address),
      "Liker must be caller"
    );
    await expectRevert(
      marketplace.connect(buyer).likeReview(1, 99, buyer.address),
      "Review does not exist"
    );
  });

  it("moves update rights with ownership across repeated sales", async function () {
    await listProperty();
    await marketplace.connect(buyer).buyProperty(1, buyer.address, { value: oneEther });

    await expectRevert(
      marketplace.connect(seller).updatePrice(seller.address, 1, ethers.utils.parseEther("2")),
      "You are not the owner"
    );

    const resalePrice = ethers.utils.parseEther("1.5");
    await marketplace.connect(buyer).updatePrice(buyer.address, 1, resalePrice);
    const receipt = await (
      await marketplace.connect(otherBuyer).buyProperty(1, otherBuyer.address, { value: resalePrice })
    ).wait();
    const resold = receipt.events.find((event) => event.event === "PropertyResold");
    expect(resold.args.oldOwner).to.equal(buyer.address);
    expect(resold.args.newOwner).to.equal(otherBuyer.address);
    expect((await marketplace.getProperty(1))[1]).to.equal(otherBuyer.address);
  });

  it("uses review count as the tie-breaker for equal average ratings", async function () {
    await listProperty();
    await listProperty(seller, ethers.utils.parseEther("2"), "Ocean View Office");

    await marketplace.connect(reviewer).addReview(1, 4, "Good", reviewer.address);
    await marketplace.connect(buyer).addReview(2, 5, "Excellent", buyer.address);
    await marketplace.connect(otherBuyer).addReview(2, 3, "Average", otherBuyer.address);

    expect((await marketplace.getHighestRatedProduct()).toString()).to.equal("2");
  });
});
