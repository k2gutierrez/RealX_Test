# Kevintrolix RealX - Test and changes only on web3 folder by Carlos Gutiérrez

## Requirements
-  Review the existing property ownership and purchase implementation
* There is a centralization risk considering the use of only owner functions. I would recommend if ignoring this to implement the openzeppelin Ownable contract. If we want to remove this risk we might consider the AccessControl.sol from openzeppelin.
* Redundancy in asking for the address owner or address user in state change functions, check can be removed considering we must use msg.sender. I did not change the code because the requirements asked to keep the architecture, also considering it might break the frontend.
* Redundancy in `buyProperty` function, two event emits, I think only one event is enough like PropertyPurchased(...).
* On `buyProperty`function when a buyer perform the action the property can still be on sale, I recomend implement a bool to activate or deactive the purchase option buy the property owner and deactivate when the buyer actually buy the property.
- Modify the purchase logic so that the current property owner cannot purchase their own property.
* A require was implemented correctly, I changed it for a Custom Error and changed the hardhat test to check ir and if the revert is activated the test would mark as pass.
- Preserve the existing valid behavior.
* No more code changed were implemented, I would like to discuss changes to the code to make it more efficient.
- Update the existing Hardhat test suite to cover:
- - A property owner attempting to purchase their own property.
- - A different wallet successfully purchasing the property.
- - The existing pruchase behavior continuing to work correctly.
* test were already implemented, just modified the revert on trying to purchase self property.
- Keep the change consistent with the existing contract architecture.
* No more code was touch, what I did is to creat a folder with a foundry project called: [foundry-realx](web3/foundry-realx/). Here I created a first proposal version, I did not change the variable order or deleted any variable except the immutable owner.
There is work to do if we make a correct order in variables to male slots more efficient and there might be some mappings or struct modifications to delete redundancies, how ever I did not change that for further discussion. I did change some logic in the constructor and functions, also changed the require statements for custom error for gas efficiencies.
* Test were made on the proposal called: [RealEstateV2Proposal](web3/foundry-realx/src/RealEstateV2Proposal.sol) in the src directory which is inside the [foundry-realx](web3/foundry-realx/) folder. Follow the [Foundry README](web3/foundry-realx/README.md) file in foundry project to check.
- Run the relevant contract tests and make sure they pass.
* `npm test` runs and all  12 tests pass.

### Expected result
- The contract should correctly reject an invalid self-purchase while continuing to allow valid property purchases, with automated tests demonstrating both cases.
* The objective is fullfilled but I think is more important to check the foundry repo in the folder: `foundry-realx`

## Frontend
- I did not reviewed the frontend but at first sight I would recommend the use of [Wagmi](https://wagmi.sh/) library and a connect button like [Rainbowkit](https://rainbowkit.com/es-419)
