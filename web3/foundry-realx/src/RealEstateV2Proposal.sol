// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/utils/ReentrancyGuard.sol";

/// @title Contract based on Kevintrolix RealX Marketplace with minor changes and prepared for security
/// audit according to Cyfrin standards.
/// @notice Marketplace contract matching the property and review flows used by
/// the reference Real Estate Marketplace DApp tutorial.
contract RealEstateV2Proposal is Ownable, ReentrancyGuard {
    /// Custom errors
    error RealEstateV2Proposal__InvalidAddress();
    error RealEstateV2Proposal__PropertyDoesNotExist();
    error RealEstateV2Proposal__NoListingFeesToWithdraw();
    error RealEstateV2Proposal__WithdrawalFailed();
    error RealEstateV2Proposal__InvalidListingPrice();
    error RealEstateV2Proposal__TitleRequired();
    error RealEstateV2Proposal__CategoryRequired();
    error RealEstateV2Proposal__ImageRequired();
    error RealEstateV2Proposal__PropertyAddressRequired();
    error RealEstateV2Proposal__DescriptionRequired();
    error RealEstateV2Proposal__OwnerMustBeCaller();
    error RealEstateV2Proposal__InvalidListingPriceAmount();
    error RealEstateV2Proposal__PriceMustBeGreaterThanZero();
    error RealEstateV2Proposal__TransferFailed();
    error RealEstateV2Proposal__CannotPurchaseOwnProperty();
    error RealEstateV2Proposal__InvalidPropertyPriceAmount();
    error RealEstateV2Proposal__PaymentTransferFailed();
    error RealEstateV2Proposal__MustBeBetween1and5();
    error RealEstateV2Proposal__CommentRequired();
    error RealEstateV2Proposal__ReviewDoesNotExists();
    error RealEstateV2Proposal__ReviewDoesNotBelongsToProperty();
    error RealEstateV2Proposal__ReviewAlreadyLiked();

    /// Structs
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

    /// Constants
    string private constant PROPERTY_PRICE_UPDATE_MESSAGE = "Your property price is updated";

    /// Storage Variables
    uint256 private s_listingPrice;
    uint256 private s_propertyIndex;
    uint256 private s_reviewsCounter;

    mapping(uint256 => Property) private s_properties;
    mapping(uint256 => Review[]) private s_productReviews;
    mapping(address => uint256[]) private s_userReviewIds;
    mapping(uint256 => Review) private s_reviewsById;
    mapping(uint256 => ProductRating) private s_productRatings;
    mapping(uint256 => mapping(address => bool)) private s_reviewLikedBy;
    mapping(uint256 => uint256) private s_reviewPositionById;

    /// Events
    event PropertyListed(uint256 indexed id, address indexed owner, uint256 price);
    event PropertySold(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 price);
    event PropertyResold(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 price);
    event PropertyUpdated(uint256 indexed id, address indexed owner);
    event PropertyPriceUpdated(uint256 indexed id, address indexed owner, uint256 oldPrice, uint256 newPrice);
    event ReviewAdded(uint256 indexed productId, address indexed reviewer, uint8 rating, string comment);
    event ReviewLiked(uint256 indexed productId, uint256 indexed reviewIndex, address indexed liker, uint256 likes);
    event ListingPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event ListingFeesWithdrawn(address indexed recipient, uint256 amount);

    /// Modifiers
    /**
     * @notice Modifier to check if the property is registered
     * @param id property Id
     */
    modifier propertyExists(uint256 id) {
        if (id == 0 || id > s_propertyIndex) revert RealEstateV2Proposal__PropertyDoesNotExist();
        // require(id > 0 && id <= s_propertyIndex, "Property does not exist");
        _;
    }

    /**
     * @dev Usually we just set msg.sender in the Ownable and then use the function 'transferOwnership' to
     * make another address instead of leaving the deployer address. For security reasons the it is convenient to
     * have a different owner instead of the deployer address. So for now I just set it like this.
     * @param newOwner address to gave the ownership to
     */
    constructor(address newOwner) Ownable(newOwner) {
        // The tutorial leaves property creation free by default while retaining
        // an owner-controlled listing fee for future monetisation.
        // s_listingPrice = 0; -> this variable already starts as zero.
    }

    //// External functions
    /// Only Owner external functions
    /**
     * @notice Only Owner function to update the Listing Price.
     * @param _listingPrice New listing price
     */
    function updateListingPrice(uint256 _listingPrice)
        external
        // aderyn-ignore-next-line(centralization-risk)
        onlyOwner
    {
        // require(owner == i_contractOwner, "Owner address does not match");
        if (_listingPrice == s_listingPrice || _listingPrice == 0) revert RealEstateV2Proposal__InvalidListingPrice();
        uint256 oldPrice = s_listingPrice;
        s_listingPrice = _listingPrice;
        emit ListingPriceUpdated(oldPrice, _listingPrice);
    }

    /**
     * @notice Withdraw funds from smart contract (listing fees)
     * Only Owner function
     */
    // aderyn-ignore-next-line(centralization-risk)
    function withdrawListingFees() external nonReentrant onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert RealEstateV2Proposal__NoListingFeesToWithdraw();
        // require(balance > 0, "No listing fees to withdraw");
        (bool sent,) = owner().call{value: balance}("");
        if (!sent) revert RealEstateV2Proposal__WithdrawalFailed();
        // require(sent, "Withdrawal failed");
        emit ListingFeesWithdrawn(owner(), balance);
    }

    /// External users functions

    /**
     * @notice Function to List a property, the owner of the property must be msg.sender
     * @param price Property price
     * @param _propertyTitle Property Title
     * @param _category property category
     * @param _images Property images
     * @param _propertyAddress Property Address
     * @param _description Property description
     */
    function listProperty(
        //address owner, -> if msg.sender must be the owner of property we can enforce it without a check
        uint256 price,
        string calldata _propertyTitle,
        string calldata _category,
        string calldata _images,
        string calldata _propertyAddress,
        string calldata _description
    ) external payable nonReentrant returns (uint256) {
        if (msg.sender == address(0)) revert RealEstateV2Proposal__InvalidAddress();
        uint256 listingPrice = getListingPrice();
        // require(owner == msg.sender, "Owner must be caller");
        if (msg.value < listingPrice) revert RealEstateV2Proposal__InvalidListingPriceAmount();
        // require(msg.value == s_listingPrice, "Send the exact listing price");
        if (price == 0) revert RealEstateV2Proposal__PriceMustBeGreaterThanZero();
        // require(price > 0, "Price must be greater than zero");
        _validatePropertyFields(_propertyTitle, _category, _images, _propertyAddress, _description);

        uint256 newPropertyId = _createProperty(price, _propertyTitle, _category, _images, _propertyAddress, _description);

        // Returns eth back to the caller in case they sent a higher amount.
        uint256 valueAmount = msg.value - listingPrice;
        if (valueAmount > 0) {
            (bool success,) = msg.sender.call{value: valueAmount}("");
            if (!success) revert RealEstateV2Proposal__TransferFailed();
        }

        return (newPropertyId); // , _propertyTitle, _description, _images, _category); Can be viewed using getter function - commented for tack too deep
    }

    /**
     * @notice Function to update a Property, only the owner registered can modify (no price modification)
     * @param productId Property Id
     * @param _propertyTitle Property Title
     * @param _category Property Category
     * @param _images Property Images
     * @param _propertyAddress Property Address
     * @param _description Property Descriotion
     */
    function updateProperty(
        uint256 productId,
        string calldata _propertyTitle,
        string calldata _category,
        string calldata _images,
        string calldata _propertyAddress,
        string calldata _description
    ) external propertyExists(productId) {
        // require(productId > 0 && productId <= s_propertyIndex, "Property does not exist"); changed for the modifier
        Property storage item = s_properties[productId];
        if (item.owner != msg.sender) revert RealEstateV2Proposal__OwnerMustBeCaller();
        // require(owner == msg.sender && item.owner == msg.sender, "You are not the owner");
        _validatePropertyFields(_propertyTitle, _category, _images, _propertyAddress, _description);

        item.propertyTitle = _propertyTitle;
        item.category = _category;
        item.images = _images;
        item.propertyAddress = _propertyAddress;
        item.description = _description;

        emit PropertyUpdated(productId, msg.sender);

        // return id;
        //     productId,
        //     _propertyTitle,
        //     _category,
        //     _images,
        //     _propertyAddress,
        //     _description
        // ); - commented for stack to deep -> Property can be viewd with getter function
    }

    /**
     * @notice Function to update price on a property. Only the owner registered can modify.
     * @param productId Property Id
     * @param price Price
     * @return String message
     */
    function updatePrice(uint256 productId, uint256 price) external propertyExists(productId) returns (string memory) {
        Property storage item = s_properties[productId];
        if (item.owner != msg.sender) revert RealEstateV2Proposal__OwnerMustBeCaller();
        // require(owner == msg.sender && item.owner == msg.sender, "You are not the owner");
        if (price == 0) revert RealEstateV2Proposal__PriceMustBeGreaterThanZero();
        // require(price > 0, "Price must be greater than zero");
        uint256 oldPrice = item.price;
        item.price = price;
        emit PropertyPriceUpdated(productId, msg.sender, oldPrice, price);
        return PROPERTY_PRICE_UPDATE_MESSAGE;
    }

    /**
     * @notice Buy property function
     * @param id Property id
     */
    function buyProperty(uint256 id) external payable nonReentrant propertyExists(id) {
        Property storage item = s_properties[id];
        address payable oldOwner = payable(item.owner);
        uint256 propertyPrice = item.price;
        if (msg.sender == oldOwner) revert RealEstateV2Proposal__CannotPurchaseOwnProperty();
        if (msg.value < propertyPrice) revert RealEstateV2Proposal__InvalidPropertyPriceAmount();

        // require(buyer == msg.sender, "Buyer must be caller");
        // require(buyer != oldOwner, "You cannot buy your own property");
        // require(msg.value == item.price, "Send the exact property price");

        item.owner = msg.sender;

        emit PropertySold(id, oldOwner, msg.sender, propertyPrice);
        emit PropertyResold(id, oldOwner, msg.sender, propertyPrice);

        (bool sent,) = oldOwner.call{value: propertyPrice}("");
        if (!sent) revert RealEstateV2Proposal__PaymentTransferFailed();
        // require(sent, "Payment transfer failed");

        uint256 valueAmountExceeded = msg.value - propertyPrice;
        if (valueAmountExceeded > 0) {
            (bool success,) = msg.sender.call{value: valueAmountExceeded}("");
            if (!success) revert RealEstateV2Proposal__TransferFailed();
        }
    }

    /**
     * @notice Add a review to a property
     * @param productId Property Id
     * @param rating Rating
     * @param comment Comment
     */
    function addReview(uint256 productId, uint8 rating, string calldata comment) external propertyExists(productId) {
        // require(user == msg.sender, "Reviewer must be caller");
        if (rating == 0 || rating > 5) revert RealEstateV2Proposal__MustBeBetween1and5();
        // require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        if (bytes(comment).length == 0) revert RealEstateV2Proposal__CommentRequired();
        // require(bytes(comment).length > 0, "Comment is required");

        Property storage item = s_properties[productId];
        item.reviewers.push(msg.sender);
        item.reviews.push(comment);

        uint256 reviewId = s_reviewsCounter;
        Review memory review = Review({
            reviewer: msg.sender,
            productId: productId,
            rating: rating,
            comment: comment,
            likes: 0,
            reviewIndex: reviewId
        });

        s_productReviews[productId].push(review);
        s_reviewsById[reviewId] = review;
        s_reviewPositionById[reviewId] = s_productReviews[productId].length;
        s_userReviewIds[msg.sender].push(reviewId);
        s_productRatings[productId].productId = productId;
        s_productRatings[productId].totalRating += rating;
        s_productRatings[productId].numberOfReviews += 1;
        s_reviewsCounter += 1;

        emit ReviewAdded(productId, msg.sender, rating, comment);
    }

    /**
     * @notice Like a review
     * @param productId Property Id
     * @param reviewIndex Review index
     */
    function likeReview(uint256 productId, uint256 reviewIndex) external propertyExists(productId) {
        if (reviewIndex >= s_reviewsCounter) revert RealEstateV2Proposal__ReviewDoesNotExists();
        // require(reviewIndex < s_reviewsCounter, "Review does not exist");
        if (s_reviewsById[reviewIndex].productId != productId) {
            revert RealEstateV2Proposal__ReviewDoesNotBelongsToProperty();
        }
        // require(s_reviewsById[reviewIndex].productId == productId, "Review does not belong to property");
        if (s_reviewLikedBy[reviewIndex][msg.sender]) revert RealEstateV2Proposal__ReviewAlreadyLiked();
        // require(!s_reviewLikedBy[reviewIndex][msg.sender], "Review already liked");

        s_reviewLikedBy[reviewIndex][msg.sender] = true;
        s_reviewsById[reviewIndex].likes += 1;

        uint256 position = s_reviewPositionById[reviewIndex];
        if (position == 0) revert RealEstateV2Proposal__ReviewDoesNotExists();
        // require(position > 0, "Review does not exist");
        s_productReviews[productId][position - 1].likes += 1;

        emit ReviewLiked(productId, reviewIndex, msg.sender, s_reviewsById[reviewIndex].likes);
    }

    //// Private functions
    /**
     * @notice A great function to validate there is no empty strings.
     * @param propertyTitle Property Title
     * @param category Category -> If they are standard this could be set as an ENUM.
     * @param images Images
     * @param propertyAddress Property Address
     * @param description Description
     */
    function _validatePropertyFields(
        string calldata propertyTitle,
        string calldata category,
        string calldata images,
        string calldata propertyAddress,
        string calldata description
    ) private pure {
        if (bytes(propertyTitle).length == 0) revert RealEstateV2Proposal__TitleRequired();
        // require(bytes(propertyTitle).length > 0, "Title is required");
        if (bytes(category).length == 0) revert RealEstateV2Proposal__CategoryRequired();
        //require(bytes(category).length > 0, "Category is required");
        if (bytes(images).length == 0) revert RealEstateV2Proposal__ImageRequired();
        // require(bytes(images).length > 0, "Image is required");
        if (bytes(propertyAddress).length == 0) revert RealEstateV2Proposal__PropertyAddressRequired();
        // require(bytes(propertyAddress).length > 0, "Property address is required");
        if (bytes(description).length == 0) revert RealEstateV2Proposal__DescriptionRequired();
        // require(bytes(description).length > 0, "Description is required");
    }

    /**
     * @notice Creates a new property, stores it and emits PropertyListed.
     * @dev Helper to keep listProperty stack usage low: price and the calldata
     *      strings only live here, and the event is emitted before returning.
     * @return newPropertyId The id assigned to the new property.
     */
    function _createProperty(
        uint256 price,
        string calldata _propertyTitle,
        string calldata _category,
        string calldata _images,
        string calldata _propertyAddress,
        string calldata _description
    ) private returns (uint256 newPropertyId) {
        s_propertyIndex += 1;
        newPropertyId = s_propertyIndex;

        Property storage item = s_properties[newPropertyId];
        item.productID = newPropertyId;
        item.owner = msg.sender;
        item.price = price;
        item.propertyTitle = _propertyTitle;
        item.category = _category;
        item.images = _images;
        item.propertyAddress = _propertyAddress;
        item.description = _description;

        emit PropertyListed(newPropertyId, msg.sender, price);
    }

    /// Getter functions
    /**
     * @notice Get all properties Struct info.
     */
    function getAllProperties() external view returns (Property[] memory) {
        Property[] memory items = new Property[](s_propertyIndex);
        for (uint256 i = 0; i < s_propertyIndex; i++) {
            items[i] = s_properties[i + 1];
        }
        return items;
    }

    /**
     * @notice Get property by its Id.
     * @param id property Id
     * @return Product Id
     * @return Owner
     * @return Price
     * @return Property title
     * @return Category
     * @return Images
     * @return Property Address
     * @return Property Description
     * @return Array of reviewers addresses
     * @return Array of reviews
     */
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
        Property memory item = s_properties[id];
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

    /**
     * @notice Get user properties.
     * @param user User to get properties registered
     */
    function getUserProperties(address user) external view returns (Property[] memory) {
        uint256 count;
        for (uint256 i = 1; i <= s_propertyIndex; i++) {
            if (s_properties[i].owner == user) count += 1;
        }

        Property[] memory items = new Property[](count);
        uint256 currentIndex;
        for (uint256 i = 1; i <= s_propertyIndex; i++) {
            if (s_properties[i].owner == user) {
                items[currentIndex] = s_properties[i];
                currentIndex += 1;
            }
        }
        return items;
    }

    /**
     * @notice Get product reviews.
     * @param productId Product / property Id
     */
    function getProductReviews(uint256 productId) external view propertyExists(productId) returns (Review[] memory) {
        return s_productReviews[productId];
    }

    /**
     * @notice Get user reviews
     * @param user user address
     */
    function getUserReviews(address user) external view returns (Review[] memory) {
        uint256[] memory ids = s_userReviewIds[user];
        Review[] memory result = new Review[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = s_reviewsById[ids[i]];
        }
        return result;
    }

    /**
     * @notice Get the highest rated product by Id
     * @return Product Id with the highest rating
     */
    function getHighestRatedProduct() external view returns (uint256) {
        uint256 highestProductId;
        uint256 highestAverage;
        uint256 highestReviewCount;

        for (uint256 i = 1; i <= s_propertyIndex; i++) {
            ProductRating memory rating = s_productRatings[i];
            if (rating.numberOfReviews == 0) continue;

            // Scale the average to preserve precision while comparing integers.
            uint256 average = (rating.totalRating * 1e18) / rating.numberOfReviews;
            if (average > highestAverage || (average == highestAverage && rating.numberOfReviews > highestReviewCount))
            {
                highestAverage = average;
                highestReviewCount = rating.numberOfReviews;
                highestProductId = i;
            }
        }
        return highestProductId;
    }

    /**
     * @notice Get the listing Price.
     */
    function getListingPrice() public view returns (uint256) {
        return s_listingPrice;
    }

    /**
     * @notice Get property Index.
     */
    function getPropertyIndex() external view returns (uint256 propertyIndex) {
        propertyIndex = s_propertyIndex;
    }

    /**
     * @notice Get the reviews counter.
     */
    function getReviewsCounter() external view returns (uint256 reviewCounter) {
        reviewCounter = s_reviewsCounter;
    }
}
