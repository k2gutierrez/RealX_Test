# About RealEstate Contract -> MODIFIED proposal as "RealEstateV2Proposal.sol"

## Make sure ton install foundry:
```shell
$ curl -L https://getfoundry.sh/install | bash && foundryup
```

## Library installation
```shell
$ forge install OpenZeppelin/openzeppelin-contracts
```

## Changes done to the base contract:
- Storage variables have now a prefix of "s_" to identify them.
- Immutable variables have now a prefix "i_" to identify them.
- Added the openzeppelin libraries to implement them for security, the libraries used are:
- * Ownable to use of `onlyOwner` modifier. Used for the functions protected for the owner to use.
- * Using owner functions only is considered a centralization risk, the use of admin function is recommended (AccessControl.sol).
- * Deleted the `onlyContractOwner` mofifier to replace with the `onlyOwner` modifier of openzeppelin.
- * Deleted the contractOwner to use the function from `Ownable` to get owner address: `owner()`
-
- - ReentrancyGuard for the `nonReentrant` modfiier to prevent reentrancy attacks.
- * Deleted the `nonReentrant` modifier of the contract to take the one on openzeppelin.
- * Deleted the bool variable `entered` to replace for the nonReentrant modifier of openzeppelin.
- Commented all the `require` statements to replace them for custom error which are more gas efficient.
- Fixed what could have been a critical vulnerability on the function `updateListingPrice`. The modifier was correct but it was redundant to check an address of owner with msg.sender when we have a modifier.
- * Also added a custom error in case the owner wants to set the price is already set. I recommend that the owner should be able to set to zero.
- Set to private the following variables: `s_listingPrice`, `s_propertyIndex` and `s_reviewsCounter`
- Function `listProperty` has been modified, we remove adding the address of owner, instead we check msg.sender is not address(0). We now return eth if they sent more than the Listing Price. Also added nonReentrant.
- In function `updateProperty` the input of address owner has been removed, there is no need to check if owner is msg.sender because of the check in the Property struct.
- Changed the `_updatedPropertyResult` storage variable in the Struct for memory.
- `updatePrice` Modified. Removed the address 'owner' variable, it only needs the check in Struct with msg.sender.
- `buyProperty` function modified. Remove the address buyer as it must be msg.sender.
- * The events emitted seems duplicated, it would make sense if if only one of them actually pass through, maybe with an internal counter in property struct, also if someone purchase a property, a bool value would be good to stop other people to purchase the same property again unless the new owner allows it.
- `getProperty`function modified. Change from storage to memory when reading the struct to return values, it can be changed to return the whole struct.
- `addReview` function modified. Removed address user as it must be msg.sender.
- `getUserReviews` function modified. Change the variable 'ids' from storage to memory.
- `likeReview` function modified. Removed the address user as it must be msg.sender.
- `getHighestRatedProduct` function mofidied. ratin variable changed from storage to memory.

## To check Coverage on contract run - 56 tests passed:
```shell
$ forge coverage --ir-minimum --no-match-coverage "test/|script/" --report summary
```

## Aderyn report
- Check the Aderyn_Report.md -> Centralization Risk

## Slither if installed:
```shell
$ slither .
```

## Foundry Basics

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
