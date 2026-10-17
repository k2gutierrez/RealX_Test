// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Kevintrolix RealX Marketplace
/// @notice Marketplace contract matching the property and review flows used by
/// the reference Real Estate Marketplace DApp tutorial.
contract RealEstate {
    /// Custom Errors
    error RealEstate__CannotBuyOwnProperty();

    struct Property {
        uint256 productID;
        address owner;
        uint256 price;
        string propertyTitle;
        string category;
        string images;
        string propertyAddress;
        string description;
        address[] reviewers;
        string[] reviews;
    }

    struct Review {
        address reviewer;
        uint256 productId;
        uint8 rating;
        string comment;
        uint256 likes;
        uint256 reviewIndex;
    }

    struct ProductRating {
        uint256 productId;
        uint256 totalRating;
        uint256 numberOfReviews;
    }

    address payable public immutable contractOwner;
    uint256 public listingPrice;
    uint256 public propertyIndex;
    uint256 public reviewsCounter;

    mapping(uint256 => Property) private properties;
    mapping(uint256 => Review[]) private productReviews;
    mapping(address => uint256[]) private userReviewIds;
    mapping(uint256 => Review) private reviewsById;
    mapping(uint256 => ProductRating) private productRatings;
    mapping(uint256 => mapping(address => bool)) private reviewLikedBy;
    mapping(uint256 => uint256) private reviewPositionById;

    bool private entered;

    event PropertyListed(uint256 indexed id, address indexed owner, uint256 price);
    event PropertySold(
        uint256 indexed id,
        address indexed oldOwner,
        address indexed newOwner,
        uint256 price
    );
    event PropertyResold(
        uint256 indexed id,
        address indexed oldOwner,
        address indexed newOwner,
        uint256 price
    );
    event PropertyUpdated(uint256 indexed id, address indexed owner);
    event PropertyPriceUpdated(
        uint256 indexed id,
        address indexed owner,
        uint256 oldPrice,
        uint256 newPrice
    );
    event ReviewAdded(
        uint256 indexed productId,
        address indexed reviewer,
        uint8 rating,
        string comment
    );
    event ReviewLiked(
        uint256 indexed productId,
        uint256 indexed reviewIndex,
        address indexed liker,
        uint256 likes
    );
    event ListingPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event ListingFeesWithdrawn(address indexed recipient, uint256 amount);

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only contract owner");
        _;
    }

    modifier nonReentrant() {
        require(!entered, "Reentrant call");
        entered = true;
        _;
        entered = false;
    }

    modifier propertyExists(uint256 id) {
        require(id > 0 && id <= propertyIndex, "Property does not exist");
        _;
    }

    constructor() {
        contractOwner = payable(msg.sender);
        // The tutorial leaves property creation free by default while retaining
        // an owner-controlled listing fee for future monetisation.
        listingPrice = 0;
    }

    function _validatePropertyFields(
        string calldata propertyTitle,
        string calldata category,
        string calldata images,
        string calldata propertyAddress,
        string calldata description
    ) private pure {
        require(bytes(propertyTitle).length > 0, "Title is required");
        require(bytes(category).length > 0, "Category is required");
        require(bytes(images).length > 0, "Image is required");
        require(bytes(propertyAddress).length > 0, "Property address is required");
        require(bytes(description).length > 0, "Description is required");
    }

    function listProperty(
        address owner,
        uint256 price,
        string calldata _propertyTitle,
        string calldata _category,
        string calldata _images,
        string calldata _propertyAddress,
        string calldata _description
    ) external payable returns (uint256, string memory, string memory, string memory, string memory) {
        require(owner == msg.sender, "Owner must be caller");
        require(msg.value == listingPrice, "Send the exact listing price");
        require(price > 0, "Price must be greater than zero");
        _validatePropertyFields(
            _propertyTitle,
            _category,
            _images,
            _propertyAddress,
            _description
        );

        propertyIndex += 1;
        Property storage item = properties[propertyIndex];
        item.productID = propertyIndex;
        item.owner = owner;
        item.price = price;
        item.propertyTitle = _propertyTitle;
        item.category = _category;
        item.images = _images;
        item.propertyAddress = _propertyAddress;
        item.description = _description;

        emit PropertyListed(propertyIndex, owner, price);

        return (propertyIndex, _propertyTitle, _description, _images, _category);
    }

    function updateProperty(
        address owner,
        uint256 productId,
        string calldata _propertyTitle,
        string calldata _category,
        string calldata _images,
        string calldata _propertyAddress,
        string calldata _description
    ) external returns (
        uint256,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory
    ) {
        require(productId > 0 && productId <= propertyIndex, "Property does not exist");
        Property storage item = properties[productId];
        require(owner == msg.sender && item.owner == msg.sender, "You are not the owner");
        _validatePropertyFields(
            _propertyTitle,
            _category,
            _images,
            _propertyAddress,
            _description
        );

        item.propertyTitle = _propertyTitle;
        item.category = _category;
        item.images = _images;
        item.propertyAddress = _propertyAddress;
        item.description = _description;

        emit PropertyUpdated(productId, msg.sender);

        return _updatedPropertyResult(productId);
    }

    function _updatedPropertyResult(uint256 productId)
        private
        view
        returns (
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        Property storage item = properties[productId];
        return (
            productId,
            item.propertyTitle,
            item.category,
            item.images,
            item.propertyAddress,
            item.description
        );
    }

    function updatePrice(
        address owner,
        uint256 productId,
        uint256 price
    ) external propertyExists(productId) returns (string memory) {
        Property storage item = properties[productId];
        require(owner == msg.sender && item.owner == msg.sender, "You are not the owner");
        require(price > 0, "Price must be greater than zero");
        uint256 oldPrice = item.price;
        item.price = price;
        emit PropertyPriceUpdated(productId, msg.sender, oldPrice, price);
        return "Your property price is updated";
    }

    function buyProperty(uint256 id, address buyer)
        external
        payable
        propertyExists(id)
        nonReentrant
    {
        Property storage item = properties[id];
        address payable oldOwner = payable(item.owner);

        require(buyer == msg.sender, "Buyer must be caller");
        if (buyer == oldOwner) revert RealEstate__CannotBuyOwnProperty();
        // require(buyer != oldOwner, "You cannot buy your own property"); -> already checked but I replace ir for a Custom Error.
        require(msg.value == item.price, "Send the exact property price");

        item.owner = buyer;

        emit PropertySold(id, oldOwner, buyer, msg.value);
        emit PropertyResold(id, oldOwner, buyer, msg.value);

        (bool sent, ) = oldOwner.call{value: msg.value}("");
        require(sent, "Payment transfer failed");

    }

    function getAllProperties() external view returns (Property[] memory) {
        Property[] memory items = new Property[](propertyIndex);
        for (uint256 i = 0; i < propertyIndex; i++) {
            items[i] = properties[i + 1];
        }
        return items;
    }

    function getProperty(uint256 id)
        external
        view
        propertyExists(id)
        returns (
            uint256,
            address,
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            address[] memory,
            string[] memory
        )
    {
        Property storage item = properties[id];
        return (
            item.productID,
            item.owner,
            item.price,
            item.propertyTitle,
            item.category,
            item.images,
            item.propertyAddress,
            item.description,
            item.reviewers,
            item.reviews
        );
    }

    function getUserProperties(address user) external view returns (Property[] memory) {
        uint256 count;
        for (uint256 i = 1; i <= propertyIndex; i++) {
            if (properties[i].owner == user) count += 1;
        }

        Property[] memory items = new Property[](count);
        uint256 currentIndex;
        for (uint256 i = 1; i <= propertyIndex; i++) {
            if (properties[i].owner == user) {
                items[currentIndex] = properties[i];
                currentIndex += 1;
            }
        }
        return items;
    }

    function addReview(
        uint256 productId,
        uint8 rating,
        string calldata comment,
        address user
    ) external propertyExists(productId) {
        require(user == msg.sender, "Reviewer must be caller");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        require(bytes(comment).length > 0, "Comment is required");

        Property storage item = properties[productId];
        item.reviewers.push(user);
        item.reviews.push(comment);

        uint256 reviewId = reviewsCounter;
        Review memory review = Review({
            reviewer: user,
            productId: productId,
            rating: rating,
            comment: comment,
            likes: 0,
            reviewIndex: reviewId
        });

        productReviews[productId].push(review);
        reviewsById[reviewId] = review;
        reviewPositionById[reviewId] = productReviews[productId].length;
        userReviewIds[user].push(reviewId);
        productRatings[productId].productId = productId;
        productRatings[productId].totalRating += rating;
        productRatings[productId].numberOfReviews += 1;
        reviewsCounter += 1;

        emit ReviewAdded(productId, user, rating, comment);
    }

    function getProductReviews(uint256 productId)
        external
        view
        propertyExists(productId)
        returns (Review[] memory)
    {
        return productReviews[productId];
    }

    function getUserReviews(address user) external view returns (Review[] memory) {
        uint256[] storage ids = userReviewIds[user];
        Review[] memory result = new Review[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = reviewsById[ids[i]];
        }
        return result;
    }

    function likeReview(
        uint256 productId,
        uint256 reviewIndex,
        address user
    ) external propertyExists(productId) {
        require(user == msg.sender, "Liker must be caller");
        require(reviewIndex < reviewsCounter, "Review does not exist");
        require(reviewsById[reviewIndex].productId == productId, "Review does not belong to property");
        require(!reviewLikedBy[reviewIndex][user], "Review already liked");

        reviewLikedBy[reviewIndex][user] = true;
        reviewsById[reviewIndex].likes += 1;

        uint256 position = reviewPositionById[reviewIndex];
        require(position > 0, "Review does not exist");
        productReviews[productId][position - 1].likes += 1;

        emit ReviewLiked(productId, reviewIndex, user, reviewsById[reviewIndex].likes);
    }

    function getHighestRatedProduct() external view returns (uint256) {
        uint256 highestProductId;
        uint256 highestAverage;
        uint256 highestReviewCount;

        for (uint256 i = 1; i <= propertyIndex; i++) {
            ProductRating storage rating = productRatings[i];
            if (rating.numberOfReviews == 0) continue;

            // Scale the average to preserve precision while comparing integers.
            uint256 average = (rating.totalRating * 1e18) / rating.numberOfReviews;
            if (
                average > highestAverage ||
                (average == highestAverage && rating.numberOfReviews > highestReviewCount)
            ) {
                highestAverage = average;
                highestReviewCount = rating.numberOfReviews;
                highestProductId = i;
            }
        }
        return highestProductId;
    }

    function getListingPrice() external view returns (uint256) {
        return listingPrice;
    }

    function updateListingPrice(uint256 _listingPrice, address owner)
        external
        onlyContractOwner
    {
        require(owner == contractOwner, "Owner address does not match");
        uint256 oldPrice = listingPrice;
        listingPrice = _listingPrice;
        emit ListingPriceUpdated(oldPrice, _listingPrice);
    }

    function withdrawListingFees() external onlyContractOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No listing fees to withdraw");
        (bool sent, ) = contractOwner.call{value: balance}("");
        require(sent, "Withdrawal failed");
        emit ListingFeesWithdrawn(contractOwner, balance);
    }
}
