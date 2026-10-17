// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {RealEstateV2Proposal} from "../src/RealEstateV2Proposal.sol";
import {DeployRealStateScript} from "../script/DeployRealStateScript.s.sol";

contract RealEstateTest is Test {
    // Constants
    uint256 STARTING_BALANCE_VALUE_TO_DEAL = 100 ether;

    // Real Estate contract
    RealEstateV2Proposal public realEstate;

    // Owner and user fake addresses for testing
    address owner;
    address user1 = makeAddr("USER1");
    address user2 = makeAddr("USER2");

    function setUp() public {
        DeployRealStateScript deployer = new DeployRealStateScript();
        realEstate = deployer.run();
        owner = realEstate.owner();

        vm.deal(owner, STARTING_BALANCE_VALUE_TO_DEAL);
        vm.deal(user1, STARTING_BALANCE_VALUE_TO_DEAL);
        vm.deal(user2, STARTING_BALANCE_VALUE_TO_DEAL);
    }

    //// Constructor
    function test__ConstructorRevertNewOwnerZeroAddress() external {
        vm.expectRevert();
        new RealEstateV2Proposal(address(0));
    }

    //// Owner functions
    /// updateListingPrice
    function test__updateListingPriceRevertNotOwnerCaller() external {
        uint256 newListingPrice = 1 ether;

        vm.expectRevert();
        vm.prank(user2);
        realEstate.updateListingPrice(newListingPrice);
    }

    function test__updateListingPriceRevertListingPriceZero() external {
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        uint256 newListingPrice;

        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__InvalidListingPrice.selector);
        vm.prank(owner);
        realEstate.updateListingPrice(newListingPrice);
    }

    function test__updateListingPriceRevertListingPriceSameAsLastlistingPrice() external {
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__InvalidListingPrice.selector);
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);
    }

    function test__updateListingPrice() external {
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        uint256 listingPriceBefore = realEstate.getListingPrice();

        uint256 newListingPrice = 1e18;

        vm.startPrank(owner);
        vm.expectEmit(true, true, false, true);
        emit RealEstateV2Proposal.ListingPriceUpdated(listingPriceBefore, newListingPrice);
        realEstate.updateListingPrice(newListingPrice);
        vm.stopPrank();

        uint256 listingPriceAfter = realEstate.getListingPrice();
        console.log("Listing price before: ", listingPriceBefore);
        console.log("Listing price after: ", listingPriceAfter);

        vm.assertEq(listingPriceAfter, newListingPrice);
        vm.assertNotEq(listingPriceBefore, listingPriceAfter);
    }

    /// withdrawListingFees
    function test_withdrawListingFeesRevertNotOwnerCaller() external {
        uint256 propertyPrice = 2 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice,
            user2,
            propertyPrice + 1 ether,
            "Property 2",
            "Farmhouse",
            "http...",
            "address 2...",
            "Farm house"
        );

        vm.expectRevert();
        vm.prank(user1);
        realEstate.withdrawListingFees();
    }

    function test_withdrawListingFeesRevertNoBalanceInContract() external {
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__NoListingFeesToWithdraw.selector);
        vm.prank(owner);
        realEstate.withdrawListingFees();
    }

    function test_withdrawListingFees() external {
        uint256 propertyPrice = 2 ether;
        uint256 propertyPrice2 = 3 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice, user2, propertyPrice2, "Property 2", "Farmhouse", "http...", "address 2...", "Farm house"
        );

        uint256 currentContractBalance = address(realEstate).balance;
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        realEstate.withdrawListingFees();

        uint256 newContractBalance = address(realEstate).balance;
        uint256 ownerBalanceAfter = owner.balance;

        vm.assertNotEq(currentContractBalance, newContractBalance);
        vm.assertNotEq(ownerBalanceBefore, ownerBalanceAfter);
        vm.assertEq(ownerBalanceAfter, (ownerBalanceBefore + currentContractBalance));
    }

    //// Users functions
    /// Listing function Test
    function test_ListingRevertsOnZeroAddress() external {
        uint256 fee = realEstate.getListingPrice();
        uint256 propertyPrice = 1e18;
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__InvalidAddress.selector);
        _ListProperty(
            fee,
            address(0),
            propertyPrice,
            "CASA AUSTIN",
            "POOL HOUSE",
            "https://some-image.com",
            "Ranco cucamonga 663",
            "Great pool house with 2 floors, 4 complete bathrooms"
        );
    }

    function test_ListingRevertsOnLesserEthValueSent() external {
        uint256 feeValue = 1e18;
        vm.prank(owner);
        realEstate.updateListingPrice(feeValue);

        uint256 propertyPrice = 1e18;
        uint256 valueSent = realEstate.getListingPrice() / 2;
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__InvalidListingPriceAmount.selector);
        _ListProperty(
            valueSent,
            user1,
            propertyPrice,
            "CASA AUSTIN",
            "POOL HOUSE",
            "https://some-image.com",
            "Ranco cucamonga 663",
            "Great pool house with 2 floors, 4 complete bathrooms"
        );
    }

    function test_ListingRevertsOnZeroEthValueSent() external {
        uint256 feeValue = 1e18;
        vm.prank(owner);
        realEstate.updateListingPrice(feeValue);

        uint256 propertyPrice = 0;
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PriceMustBeGreaterThanZero.selector);
        _ListProperty(
            feeValue,
            user1,
            propertyPrice,
            "CASA AUSTIN",
            "POOL HOUSE",
            "https://some-image.com",
            "Ranco cucamonga 663",
            "Great pool house with 2 floors, 4 complete bathrooms"
        );
    }

    function test_ListingPropertyRevertNoTitle() external {
        uint256 newListingPrice = 1e9;
        string memory title_;
        string memory category_ = "Residence";
        string memory images_ = "https://some-image.com";
        string memory propertyAddress = "rancho kukamonga 613";
        string memory desc = "A good property test";

        vm.prank(owner);
        realEstate.updateListingPrice(newListingPrice);

        uint256 propertyPrice = 2e18;

        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__TitleRequired.selector);
        _ListProperty(newListingPrice, user1, propertyPrice, title_, category_, images_, propertyAddress, desc);
    }

    function test_ListingPropertyRevertNoCategory() external {
        uint256 newListingPrice = 1e9;
        string memory title_ = "Property Title 1";
        string memory category_ = "";
        string memory images_ = "https://some-image.com";
        string memory propertyAddress = "rancho kukamonga 613";
        string memory desc = "A good property test";

        vm.prank(owner);
        realEstate.updateListingPrice(newListingPrice);

        uint256 propertyPrice = 2e18;

        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__CategoryRequired.selector);
        _ListProperty(newListingPrice, user1, propertyPrice, title_, category_, images_, propertyAddress, desc);
    }

    function test_ListingPropertyRevertNoImages() external {
        uint256 newListingPrice = 1e9;
        string memory title_ = "Property Title 1";
        string memory category_ = "Residence";
        string memory images_ = "";
        string memory propertyAddress = "rancho kukamonga 613";
        string memory desc = "A good property test";

        vm.prank(owner);
        realEstate.updateListingPrice(newListingPrice);

        uint256 propertyPrice = 2e18;

        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__ImageRequired.selector);
        _ListProperty(newListingPrice, user1, propertyPrice, title_, category_, images_, propertyAddress, desc);
    }

    function test_ListingPropertyRevertNoPropertyAddress() external {
        uint256 newListingPrice = 1e9;
        string memory title_ = "Property Title 1";
        string memory category_ = "Residence";
        string memory images_ = "https://some-image.com";
        string memory propertyAddress = "";
        string memory desc = "A good property test";

        vm.prank(owner);
        realEstate.updateListingPrice(newListingPrice);

        uint256 propertyPrice = 2e18;

        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyAddressRequired.selector);
        _ListProperty(newListingPrice, user1, propertyPrice, title_, category_, images_, propertyAddress, desc);
    }

    function test_ListingPropertyRevertNoDescription() external {
        uint256 newListingPrice = 1e9;
        string memory title_ = "Property Title 1";
        string memory category_ = "Residence";
        string memory images_ = "https://some-image.com";
        string memory propertyAddress = "rancho kukamonga 613";
        string memory desc = "";

        vm.prank(owner);
        realEstate.updateListingPrice(newListingPrice);

        uint256 propertyPrice = 2e18;

        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__DescriptionRequired.selector);
        _ListProperty(newListingPrice, user1, propertyPrice, title_, category_, images_, propertyAddress, desc);
    }

    function test_ListingProperty() external {
        uint256 user1BalanceBeforeList = user1.balance;
        uint256 thisContractBalanceBefore = address(realEstate).balance;

        uint256 newListingPrice = 1e9;
        string memory title_ = "Property test 1";
        string memory category_ = "Residence";
        string memory images_ = "https://some-image.com";
        string memory propertyAddress = "rancho kukamonga 613";
        string memory desc = "A good property test";

        vm.prank(owner);
        realEstate.updateListingPrice(newListingPrice);

        uint256 propertyPrice = 2e18;

        vm.expectEmit(true, true, false, true);
        emit RealEstateV2Proposal.PropertyListed((realEstate.getPropertyIndex() + 1), user1, propertyPrice);
        uint256 id = _ListProperty(
            realEstate.getListingPrice(), user1, propertyPrice, title_, category_, images_, propertyAddress, desc
        );

        (,,, string memory title, string memory category, string memory images,, string memory description,,) = realEstate.getProperty(id);

        uint256 user1BalanceAfterList = user1.balance;
        uint256 thisContractBalanceAfter = address(realEstate).balance;

        assert(thisContractBalanceBefore == 0);

        vm.assertNotEq(user1BalanceBeforeList, user1BalanceAfterList, "Transfer failed on listing");
        vm.assertEq(user1BalanceAfterList, (user1BalanceBeforeList - newListingPrice), "Transfer failed on listing");
        vm.assertEq(thisContractBalanceAfter, newListingPrice);

        vm.assertEq(id, realEstate.getPropertyIndex());
        vm.assertEq(title, title_);
        vm.assertEq(category, category_);
        vm.assertEq(description, desc);
        vm.assertEq(images, images_);
    }

    /// updateProperty
    function test_updatePropertyRevertCallerIsNotOwnerRegisteredInProperty() external {
        uint256 propertyPrice = 2 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice,
            user2,
            propertyPrice + 1 ether,
            "Property 2",
            "Farmhouse",
            "http...",
            "address 2...",
            "Farm house"
        );

        RealEstateV2Proposal.Property[] memory user1Properties = realEstate.getUserProperties(user1);
        vm.prank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__OwnerMustBeCaller.selector);
        realEstate.updateProperty(
            user1Properties[0].productID, "Title", "house", "https://other...", "other address", "new description"
        );
    }

    function test_updatePropertyRevertIdIsZero() external {
        uint256 propertyPrice = 2 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice,
            user2,
            propertyPrice + 1 ether,
            "Property 2",
            "Farmhouse",
            "http...",
            "address 2...",
            "Farm house"
        );

        uint256 id = 0;

        // RealEstateV2Proposal.Property[] memory user1Properties = realEstate.getUserProperties(user1);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyDoesNotExist.selector);
        vm.prank(user1);
        realEstate.updateProperty(id, "Title", "house", "https://other...", "other address", "new description");
    }

    function test_updatePropertyRevertIdIsGtIndexId() external {
        uint256 propertyPrice = 2 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice,
            user2,
            propertyPrice + 1 ether,
            "Property 2",
            "Farmhouse",
            "http...",
            "address 2...",
            "Farm house"
        );

        uint256 id = realEstate.getPropertyIndex() + 1;

        // RealEstateV2Proposal.Property[] memory user1Properties = realEstate.getUserProperties(user1);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyDoesNotExist.selector);
        vm.prank(user1);
        realEstate.updateProperty(id, "Title", "house", "https://other...", "other address", "new description");
    }

    function test_updateProperty() external {
        uint256 propertyPrice = 2 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice,
            user2,
            propertyPrice + 1 ether,
            "Property 2",
            "Farmhouse",
            "http...",
            "address 2...",
            "Farm house"
        );

        RealEstateV2Proposal.Property[] memory user1Properties = realEstate.getUserProperties(user1);
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit RealEstateV2Proposal.PropertyUpdated(user1Properties[0].productID, user1);
        realEstate.updateProperty(
            user1Properties[0].productID, "Title", "house", "https://other...", "other address", "new description"
        );

        (uint256 id,,, string memory title, string memory category, string memory images, string memory propertyAddress, string memory description,,) = realEstate.getProperty(user1Properties[0].productID);

        RealEstateV2Proposal.Property[] memory user1PropertiesUpdated = realEstate.getUserProperties(user1);

        assertEq(user1PropertiesUpdated[0].productID, id);
        assertEq(user1PropertiesUpdated[0].propertyTitle, title);
        assertEq(user1PropertiesUpdated[0].category, category);
        assertEq(user1PropertiesUpdated[0].images, images);
        assertEq(user1PropertiesUpdated[0].propertyAddress, propertyAddress);
        assertEq(user1PropertiesUpdated[0].description, description);
    }

    /// updatePrice
    function test_updatePriceRevertCallerNotTheOwnerOfProperty() external {
        uint256 propertyPrice = 2 ether;
        uint256 propertyPrice2 = 3 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice, user2, propertyPrice2, "Property 2", "Farmhouse", "http...", "address 2...", "Farm house"
        );

        uint256 newPropertyPriceUser2 = 2 ether;

        RealEstateV2Proposal.Property[] memory user2Properties = realEstate.getUserProperties(user2);
        vm.prank(user1);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__OwnerMustBeCaller.selector);
        realEstate.updatePrice(user2Properties[0].productID, newPropertyPriceUser2);
    }

    function test_updatePriceRevertPrizeIsZero() external {
        uint256 propertyPrice = 2 ether;
        uint256 propertyPrice2 = 3 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice, user2, propertyPrice2, "Property 2", "Farmhouse", "http...", "address 2...", "Farm house"
        );

        uint256 newPropertyPriceUser2 = 0;

        RealEstateV2Proposal.Property[] memory user2Properties = realEstate.getUserProperties(user2);
        vm.prank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PriceMustBeGreaterThanZero.selector);
        realEstate.updatePrice(user2Properties[0].productID, newPropertyPriceUser2);
    }

    function test_updatePriceRevertIdIsZero() external {
        uint256 propertyPrice = 2 ether;
        uint256 propertyPrice2 = 3 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice, user2, propertyPrice2, "Property 2", "Farmhouse", "http...", "address 2...", "Farm house"
        );

        uint256 newPropertyPriceUser2 = 1 ether;

        // RealEstateV2Proposal.Property[] memory user2Properties = realEstate.getUserProperties(user2);
        uint256 id = 0;
        vm.prank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyDoesNotExist.selector);
        realEstate.updatePrice(id, newPropertyPriceUser2);
    }

    function test_updatePriceRevertIdIsGtPropertyIndex() external {
        uint256 propertyPrice = 2 ether;
        uint256 propertyPrice2 = 3 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice, user2, propertyPrice2, "Property 2", "Farmhouse", "http...", "address 2...", "Farm house"
        );

        uint256 newPropertyPriceUser2 = 1 ether;

        // RealEstateV2Proposal.Property[] memory user2Properties = realEstate.getUserProperties(user2);
        uint256 id = realEstate.getPropertyIndex() + 1;
        vm.prank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyDoesNotExist.selector);
        realEstate.updatePrice(id, newPropertyPriceUser2);
    }

    function test_updatePrice() external {
        uint256 propertyPrice = 2 ether;
        uint256 propertyPrice2 = 3 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice, user2, propertyPrice2, "Property 2", "Farmhouse", "http...", "address 2...", "Farm house"
        );

        uint256 newPropertyPriceUser2 = 2 ether;

        RealEstateV2Proposal.Property[] memory user2Properties = realEstate.getUserProperties(user2);
        vm.prank(user2);
        vm.expectEmit(true, true, true, true);
        emit RealEstateV2Proposal.PropertyPriceUpdated(
            user2Properties[0].productID, user2, propertyPrice2, newPropertyPriceUser2
        );
        realEstate.updatePrice(user2Properties[0].productID, newPropertyPriceUser2);

        RealEstateV2Proposal.Property[] memory user2PropertiesUpdated = realEstate.getUserProperties(user2);

        assertEq(user2PropertiesUpdated[0].price, newPropertyPriceUser2);
        assertNotEq(user2Properties[0].price, user2PropertiesUpdated[0].price);
    }

    /// buyProperty
    function test_buyPropertyRevertIdIsZero() external {
        uint256 propertyPrice = 2 ether;

        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = 0;

        vm.startPrank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyDoesNotExist.selector);
        realEstate.buyProperty{value: user1Property[0].price}(id);
        vm.stopPrank();
    }

    function test_buyPropertyRevertIdIsGtPropertyIndex() external {
        uint256 propertyPrice = 2 ether;

        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = realEstate.getPropertyIndex() + 1;

        vm.startPrank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyDoesNotExist.selector);
        realEstate.buyProperty{value: user1Property[0].price}(id);
        vm.stopPrank();
    }

    function test_buyPropertyRevertCannotPurchaseOwnProperty() external {
        uint256 propertyPrice = 2 ether;

        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;

        vm.startPrank(user1);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__CannotPurchaseOwnProperty.selector);
        realEstate.buyProperty{value: user1Property[0].price}(id);
        vm.stopPrank();
    }

    function test_buyPropertyRevertInvalidPurchaseAmount() external {
        uint256 propertyPrice = 2 ether;

        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;

        vm.startPrank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__InvalidPropertyPriceAmount.selector);
        realEstate.buyProperty{value: (user1Property[0].price - 1)}(id);
        vm.stopPrank();
    }

    function test_buyProperty() external {
        uint256 propertyPrice = 2 ether;

        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;

        uint256 user1BalanceBefore = user1.balance;
        uint256 user2BalanceBefore = user2.balance;

        vm.startPrank(user2);
        vm.expectEmit(true, true, true, true);
        emit RealEstateV2Proposal.PropertySold(id, user1Property[0].owner, user2, user1Property[0].price);

        vm.expectEmit(true, true, true, true);
        emit RealEstateV2Proposal.PropertyResold(id, user1Property[0].owner, user2, user1Property[0].price);

        realEstate.buyProperty{value: user1Property[0].price}(id);
        vm.stopPrank();

        uint256 user1BalanceAfter = user1.balance;
        uint256 user2BalanceAfter = user2.balance;

        assertNotEq(user1BalanceBefore, user1BalanceAfter);
        assertNotEq(user2BalanceBefore, user2BalanceAfter);
        assertEq(user1BalanceAfter, (user1BalanceBefore + user1Property[0].price));
        assertEq(user2BalanceAfter, (user2BalanceBefore - user1Property[0].price));
    }

    /// addReview
    function test_AddReviewRevertIdIsZero() external {
        uint256 propertyPrice = 2 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        // RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = 0;
        uint8 rating = 5;
        string memory comment = "What a great residence, love it!";

        vm.startPrank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyDoesNotExist.selector);
        realEstate.addReview(id, rating, comment);
        vm.stopPrank();
    }

    function test_AddReviewRevertIdIsGtpropertyIndex() external {
        uint256 propertyPrice = 2 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        // RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = realEstate.getPropertyIndex() + 1;
        uint8 rating = 5;
        string memory comment = "What a great residence, love it!";

        vm.startPrank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyDoesNotExist.selector);
        realEstate.addReview(id, rating, comment);
        vm.stopPrank();
    }

    function test_AddReviewRevertRatingIsZero() external {
        uint256 propertyPrice = 2 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;
        uint8 rating = 0;
        string memory comment = "What a great residence, love it!";

        vm.startPrank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__MustBeBetween1and5.selector);
        realEstate.addReview(id, rating, comment);
        vm.stopPrank();
    }

    function test_AddReviewRevertRatingIsGt5() external {
        uint256 propertyPrice = 2 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;
        uint8 rating = 6;
        string memory comment = "What a great residence, love it!";

        vm.startPrank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__MustBeBetween1and5.selector);
        realEstate.addReview(id, rating, comment);
        vm.stopPrank();
    }

    function test_AddReviewRevertNoComment() external {
        uint256 propertyPrice = 2 ether;
        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;
        uint8 rating = 5;
        string memory comment = "";

        vm.startPrank(user2);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__CommentRequired.selector);
        realEstate.addReview(id, rating, comment);
        vm.stopPrank();
    }

    function test_AddReview() external {
        uint256 propertyPrice = 2 ether;

        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;
        uint8 rating = 5;
        string memory comment = "What a great residence, love it!";

        vm.startPrank(user2);
        vm.expectEmit(true, true, true, true);
        emit RealEstateV2Proposal.ReviewAdded(id, user2, rating, comment);
        realEstate.addReview(id, rating, comment);
        vm.stopPrank();

        RealEstateV2Proposal.Property[] memory user1PropertyAfter = realEstate.getUserProperties(user1);

        assert(user1Property[0].reviews.length == 0);
        assert(user1Property[0].reviewers.length == 0);
        assert(user1PropertyAfter[0].reviews.length == 1);
        assert(user1PropertyAfter[0].reviewers[0] == user2);
        assert(keccak256(abi.encode(user1PropertyAfter[0].reviews[0])) == keccak256(abi.encode(comment)));
    }

    /// likeReview
    function test_likeReviewRevertReviewDoesNotExists() external {
        uint256 propertyPrice = 2 ether;

        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;
        uint8 rating = 5;
        string memory comment = "What a great residence, love it!";

        vm.prank(user2);
        realEstate.addReview(id, rating, comment);

        RealEstateV2Proposal.Review[] memory reviewsBefore = realEstate.getProductReviews(id);
        uint256 rIndex = reviewsBefore[0].reviewIndex;
        assertEq(reviewsBefore[0].likes, 0);

        vm.startPrank(user1);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__ReviewDoesNotExists.selector);
        realEstate.likeReview(id, rIndex + 1);
        vm.stopPrank();
    }

    function test_likeReviewRevertWrongProductId() external {
        uint256 propertyPrice = 2 ether;

        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice, user2, propertyPrice, "Property 2", "Farm house", "https...", "address 2...", "House"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;
        uint8 rating = 5;
        string memory comment = "What a great residence, love it!";

        vm.prank(user2);
        realEstate.addReview(id, rating, comment);

        RealEstateV2Proposal.Review[] memory reviewsBefore = realEstate.getProductReviews(id);
        uint256 rIndex = reviewsBefore[0].reviewIndex;
        assertEq(reviewsBefore[0].likes, 0);

        vm.startPrank(user1);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__ReviewDoesNotBelongsToProperty.selector);
        realEstate.likeReview(id + 1, rIndex);
        vm.stopPrank();
    }

    function test_likeReviewRevertCannotLikeSameReviewTheSameCaller() external {
        uint256 propertyPrice = 2 ether;

        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );
        _ListProperty(
            firstFeePrice, user2, propertyPrice, "Property 2", "Farm house", "https...", "address 2...", "House"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;
        uint8 rating = 5;
        string memory comment = "What a great residence, love it!";

        vm.prank(user2);
        realEstate.addReview(id, rating, comment);

        RealEstateV2Proposal.Review[] memory reviewsBefore = realEstate.getProductReviews(id);
        uint256 rIndex = reviewsBefore[0].reviewIndex;
        assertEq(reviewsBefore[0].likes, 0);

        vm.startPrank(user1);
        realEstate.likeReview(id, rIndex);
        vm.stopPrank();

        vm.startPrank(user1);
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__ReviewAlreadyLiked.selector);
        realEstate.likeReview(id, rIndex);
        vm.stopPrank();
    }

    function test_likeReview() external {
        uint256 propertyPrice = 2 ether;

        uint256 firstFeePrice = 1e9; // .5 ether
        vm.prank(owner);
        realEstate.updateListingPrice(firstFeePrice);

        // User1 - id 1 and User2 listed a property each - id 2
        _ListProperty(
            firstFeePrice, user1, propertyPrice, "Property 1", "Residence", "http...", "address 1...", "residence 1"
        );

        RealEstateV2Proposal.Property[] memory user1Property = realEstate.getUserProperties(user1);
        uint256 id = user1Property[0].productID;
        uint8 rating = 5;
        string memory comment = "What a great residence, love it!";

        vm.prank(user2);
        realEstate.addReview(id, rating, comment);

        RealEstateV2Proposal.Review[] memory reviewsBefore = realEstate.getProductReviews(id);
        uint256 rIndex = reviewsBefore[0].reviewIndex;
        assertEq(reviewsBefore[0].likes, 0);

        vm.startPrank(user1);
        vm.expectEmit(true, true, true, true);
        emit RealEstateV2Proposal.ReviewLiked(id, rIndex, user1, 1);
        realEstate.likeReview(id, rIndex);
        vm.stopPrank();

        RealEstateV2Proposal.Review[] memory reviewsAfter = realEstate.getProductReviews(id);
        assertEq(reviewsAfter[0].likes, 1);

        RealEstateV2Proposal.Review[] memory user2Reviews = realEstate.getUserReviews(user2);
        assertEq(user2Reviews.length, 1);
        assertEq(user2Reviews[0].likes, 1);
    }

    //// Getter functions
    /// getListingPrice
    function test_getListingPrice() external {
        uint256 initialPrice = realEstate.getListingPrice();
        assertEq(initialPrice, 0);

        uint256 newPrice = 1 ether;
        vm.prank(owner);
        realEstate.updateListingPrice(newPrice);

        assertEq(realEstate.getListingPrice(), newPrice);
        assertNotEq(realEstate.getListingPrice(), initialPrice);
    }

    /// getPropertyIndex
    function test_getPropertyIndex() external {
        assertEq(realEstate.getPropertyIndex(), 0);

        uint256 fee = 1e9;
        vm.prank(owner);
        realEstate.updateListingPrice(fee);

        _ListProperty(fee, user1, 1 ether, "P1", "Residence", "img", "addr1", "desc1");
        _ListProperty(fee, user2, 2 ether, "P2", "Farmhouse", "img", "addr2", "desc2");

        assertEq(realEstate.getPropertyIndex(), 2);
    }

    /// getReviewsCounter
    function test_getReviewsCounter() external {
        assertEq(realEstate.getReviewsCounter(), 0);

        uint256 fee = 1e9;
        vm.prank(owner);
        realEstate.updateListingPrice(fee);

        _ListProperty(fee, user1, 1 ether, "P1", "Residence", "img", "addr1", "desc1");
        uint256 id = realEstate.getPropertyIndex();

        vm.prank(user2);
        realEstate.addReview(id, 5, "Great");
        assertEq(realEstate.getReviewsCounter(), 1);

        vm.prank(user1);
        realEstate.addReview(id, 4, "Nice");
        assertEq(realEstate.getReviewsCounter(), 2);
    }

    /// getAllProperties
    function test_getAllProperties() external {
        // Con cero propiedades, retorna un array vacío
        RealEstateV2Proposal.Property[] memory emptyProps = realEstate.getAllProperties();
        assertEq(emptyProps.length, 0);

        uint256 fee = 1e9;
        vm.prank(owner);
        realEstate.updateListingPrice(fee);

        _ListProperty(fee, user1, 1 ether, "P1", "Residence", "img1", "addr1", "desc1");
        _ListProperty(fee, user2, 2 ether, "P2", "Farmhouse", "img2", "addr2", "desc2");

        RealEstateV2Proposal.Property[] memory props = realEstate.getAllProperties();
        assertEq(props.length, 2);
        assertEq(props[0].productID, 1);
        assertEq(props[0].owner, user1);
        assertEq(props[1].productID, 2);
        assertEq(props[1].owner, user2);
    }

    /// getProperty
    function test_getProperty() external {
        uint256 fee = 1e9;
        vm.prank(owner);
        realEstate.updateListingPrice(fee);

        _ListProperty(fee, user1, 1 ether, "P1", "Residence", "img1", "addr1", "desc1");
        uint256 id = realEstate.getPropertyIndex();

        (
            uint256 productID,
            address propOwner,
            uint256 price,
            string memory title,
            string memory category,
            string memory images,
            string memory propAddress,
            string memory description,
            address[] memory reviewers,
            string[] memory reviews
        ) = realEstate.getProperty(id);

        assertEq(productID, id);
        assertEq(propOwner, user1);
        assertEq(price, 1 ether);
        assertEq(title, "P1");
        assertEq(category, "Residence");
        assertEq(images, "img1");
        assertEq(propAddress, "addr1");
        assertEq(description, "desc1");
        assertEq(reviewers.length, 0);
        assertEq(reviews.length, 0);
    }

    function test_getPropertyRevertNonExistent() external {
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyDoesNotExist.selector);
        realEstate.getProperty(1);
    }

    /// getUserProperties
    function test_getUserProperties() external {
        uint256 fee = 1e9;
        vm.prank(owner);
        realEstate.updateListingPrice(fee);

        _ListProperty(fee, user1, 1 ether, "P1", "Residence", "img1", "addr1", "desc1");
        _ListProperty(fee, user2, 2 ether, "P2", "Farmhouse", "img2", "addr2", "desc2");
        _ListProperty(fee, user1, 3 ether, "P3", "Residence", "img3", "addr3", "desc3");

        RealEstateV2Proposal.Property[] memory user1Props = realEstate.getUserProperties(user1);
        assertEq(user1Props.length, 2);
        assertEq(user1Props[0].productID, 1);
        assertEq(user1Props[1].productID, 3);

        RealEstateV2Proposal.Property[] memory user2Props = realEstate.getUserProperties(user2);
        assertEq(user2Props.length, 1);
        assertEq(user2Props[0].productID, 2);

        // Usuario sin propiedades
        address user3 = makeAddr("USER3");
        RealEstateV2Proposal.Property[] memory user3Props = realEstate.getUserProperties(user3);
        assertEq(user3Props.length, 0);
    }

    /// getProductReviews
    function test_getProductReviews() external {
        uint256 fee = 1e9;
        vm.prank(owner);
        realEstate.updateListingPrice(fee);

        _ListProperty(fee, user1, 1 ether, "P1", "Residence", "img", "addr", "desc");
        uint256 id = realEstate.getPropertyIndex();

        vm.prank(user2);
        realEstate.addReview(id, 5, "Excellent");
        vm.prank(user1);
        realEstate.addReview(id, 4, "Good");

        RealEstateV2Proposal.Review[] memory reviews = realEstate.getProductReviews(id);
        assertEq(reviews.length, 2);
        assertEq(reviews[0].reviewer, user2);
        assertEq(reviews[0].rating, 5);
        assertEq(reviews[1].reviewer, user1);
        assertEq(reviews[1].rating, 4);
    }

    function test_getProductReviewsRevertNonExistent() external {
        vm.expectRevert(RealEstateV2Proposal.RealEstateV2Proposal__PropertyDoesNotExist.selector);
        realEstate.getProductReviews(1);
    }

    /// getUserReviews
    function test_getUserReviews() external {
        uint256 fee = 1e9;
        vm.prank(owner);
        realEstate.updateListingPrice(fee);

        _ListProperty(fee, user1, 1 ether, "P1", "Residence", "img", "addr", "desc");
        _ListProperty(fee, user2, 2 ether, "P2", "Farmhouse", "img", "addr", "desc");

        // user2 escribe un review en la propiedad 1
        vm.prank(user2);
        realEstate.addReview(1, 5, "Nice");
        // user2 escribe otro review en la propiedad 2
        vm.prank(user2);
        realEstate.addReview(2, 4, "Good");

        RealEstateV2Proposal.Review[] memory user2Reviews = realEstate.getUserReviews(user2);
        assertEq(user2Reviews.length, 2);
        assertEq(user2Reviews[0].productId, 1);
        assertEq(user2Reviews[1].productId, 2);

        // Usuario sin reviews
        address user3 = makeAddr("USER3");
        RealEstateV2Proposal.Review[] memory user3Reviews = realEstate.getUserReviews(user3);
        assertEq(user3Reviews.length, 0);
    }

    /// getHighestRatedProduct
    function test_getHighestRatedProduct() external {
        uint256 fee = 1e9;
        vm.prank(owner);
        realEstate.updateListingPrice(fee);

        _ListProperty(fee, user1, 1 ether, "P1", "Residence", "img", "addr", "desc");
        _ListProperty(fee, user2, 2 ether, "P2", "Farmhouse", "img", "addr", "desc");

        // Propiedad 1: reviews 5 y 4 -> promedio 4.5 (con escala 1e18)
        vm.prank(user2);
        realEstate.addReview(1, 5, "Great");
        vm.prank(owner);
        realEstate.addReview(1, 4, "Good");

        // Propiedad 2: review 3 -> promedio 3
        vm.prank(user1);
        realEstate.addReview(2, 3, "Average");

        uint256 highest = realEstate.getHighestRatedProduct();
        assertEq(highest, 1); // P1 tiene el promedio más alto
    }

    function test_getHighestRatedProductRevertWhenNoReviews() external {
        // Sin propiedades ni reviews, retorna 0 (ninguna propiedad)
        assertEq(realEstate.getHighestRatedProduct(), 0);

        uint256 fee = 1e9;
        vm.prank(owner);
        realEstate.updateListingPrice(fee);

        _ListProperty(fee, user1, 1 ether, "P1", "Residence", "img", "addr", "desc");

        // Hay una propiedad pero sin reviews: retorna 0
        assertEq(realEstate.getHighestRatedProduct(), 0);
    }

    function test_getHighestRatedProductTieBreaksByReviewCount() external {
        uint256 fee = 1e9;
        vm.prank(owner);
        realEstate.updateListingPrice(fee);

        _ListProperty(fee, user1, 1 ether, "P1", "Residence", "img", "addr", "desc");
        _ListProperty(fee, user2, 2 ether, "P2", "Farmhouse", "img", "addr", "desc");

        // Ambas con promedio 5, pero P2 tiene más reviews -> gana P2
        vm.prank(user2);
        realEstate.addReview(1, 5, "Great");
        vm.prank(user1);
        realEstate.addReview(2, 5, "Great");
        vm.prank(owner);
        realEstate.addReview(2, 5, "Also great");

        assertEq(realEstate.getHighestRatedProduct(), 2);
    }

    //// Helper functions
    function _ListProperty(
        uint256 feeSent,
        address user,
        uint256 _price,
        string memory _propertyTitle,
        string memory _category,
        string memory _images,
        string memory _propertyAddress,
        string memory _description
    )
        private
        returns (
            uint256 propertyIndex
        )
    {
        vm.prank(user);
        propertyIndex = realEstate.listProperty{value: feeSent}(
            _price, _propertyTitle, _category, _images, _propertyAddress, _description
        );

    }
}
