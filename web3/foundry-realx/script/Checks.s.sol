// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";

/**
 * @title Checks for contract deployment
 * @author Carlos Gutiérrez
 * @notice Simple checklist to verify before running the script for deployment
 */
contract Checks is Script {
    /// Please review each bool in your contracts and set the to true when finishing!
    /// This is a manual checklist included to make a final check before deplyment.
    /// Code Quality
    bool private Natspec = true; // All external/public functions have NatSpec (@notice, @param, @return)
    bool private CustomErrors = true; // Custom errors used instead of require strings
    bool private EventsForStateChange = true; //Events emitted for every state change
    bool private No_TODO_FIXME_HACK = true; //No TODO, FIXME, or HACK comments remain
    bool private NoHardcodedAddresses = true; // No hardcoded addresses — use constructor params or immutables

    /// Access Control
    bool private PrivilegeAccess = true; // Every privileged function has access control, although centralization risk with Ownable instead of AccessControl.
    bool private AdminRoles = true; // Admin roles use multisig, not EOA - centralization risk with onlyOwner, set to true knowing this.
    bool private UpgradeFunctions = true; // Upgrade functions protected and tested
    bool private Timelocks = true; // Timelock on sensitive operations (fee changes, large withdrawals) - N/A
    bool private RenounceOwnership = true; // renounceOwnership disabled or confirmed intentional - Not applied at the moment.

    /// Arithmetic and Logic
    bool private DecimalHandling = false; // Token decimal handling verified for every token interaction
    bool private PrecisionLoss = false; // Division before multiplication identified and fixed (precision loss)
    bool private UncheckedReviews = false; // unchecked blocks reviewed for overflow possibility
    bool private Downcasts = false; // Downcasts (uint256 to uint128) have bounds checks

    /// External Interactions
    bool private CEI_pattern = true; // CEI pattern followed on every external call
    bool private ReentrancyGuard = true; // ReentrancyGuard applied to all state-changing functions
    bool private SafeERC20 = true; // SafeERC20 used for all token operations - N/A
    bool private Low_level_call = true; // Return values of low-level call checked
    bool private OracleStalenessAndNegativePriceChecks = true; // Oracle staleness and negative price checks in place. N/A
    bool private FlashLoanAttackVector = true; // Flash loan attack vectors analyzed. N/A

    /// Proxy Safety (if upgradeable)
    /// If it is not an upgradeable smart contracts just set noProxy to true
    bool private noProxy = true; // Just set to false if it is upgreadeable
    /// Set to true only if you set to false on "noProxy"
    bool private DisableInitializer = false; // _disableInitializers() in implementation constructor
    bool private AuthorizeUpgrade = false; // _authorizeUpgrade has access control
    bool private StorageLayoutValidateV = false; // Storage layout validated between versions with OpenZeppelin tooling
    bool private NoSelfdestructOrDelegatecall = false; // No selfdestruct or delegatecall in implementation

    /// Testing
    bool private Coverage = false; // Line coverage above 90%
    bool private FuzzTests = false; // Fuzz tests on all math-heavy functions
    bool private InvariantTests = false; // Invariant tests on core protocol properties
    bool private ForkTests = false; // Fork tests against mainnet state

    /// External tools - This won't go as a check, just to set on deplyment if they were used or not
    bool private Aderyn = true;
    bool private Slither = true;
    bool private Mythril = false;

    function _checkCodeQuality() private view returns (bool checkPass) {
        if (
            Natspec == true && CustomErrors == true && EventsForStateChange == true && No_TODO_FIXME_HACK == true
                && NoHardcodedAddresses == true
        ) {
            checkPass = true;
        } else {
            checkPass = false;
        }
    }

    function _checkAccessControl() private view returns (bool checkAccess) {
        if (
            PrivilegeAccess == true && AdminRoles == true && UpgradeFunctions == true && Timelocks == true
                && RenounceOwnership == true
        ) {
            checkAccess = true;
        } else {
            checkAccess = false;
        }
    }

    function _checkArithmeticAndLogic() private view returns (bool checkArithmetic) {
        if (DecimalHandling == true && PrecisionLoss == true && UncheckedReviews == true && Downcasts == true) {
            checkArithmetic = true;
        } else {
            checkArithmetic = false;
        }
    }

    function _checkExternalInteractions() private view returns (bool checkExternalInteractions) {
        if (
            CEI_pattern == true && ReentrancyGuard == true && SafeERC20 == true && Low_level_call == true
                && OracleStalenessAndNegativePriceChecks == true && FlashLoanAttackVector == true
        ) {
            checkExternalInteractions = true;
        } else {
            checkExternalInteractions = false;
        }
    }

    function _checkProySafety() private view returns (bool checkProxy) {
        if (noProxy == false) {
            checkProxy = true;
        } else {
            if (
                DisableInitializer == true && AuthorizeUpgrade == true && StorageLayoutValidateV == true
                    && NoSelfdestructOrDelegatecall == true
            ) {
                checkProxy = true;
            } else {
                checkProxy = false;
            }
        }
    }

    function _checkTesting() private view returns(bool checkTests) {
        if (
            Coverage == true &&
            FuzzTests == true &&
            InvariantTests == true &&
            ForkTests == true
        ) {
            checkTests = true;
        } else {
            checkTests = false;
        }
    }

    // function setUp() public {}

    function run() public view returns(bool, bool, bool, bool) {
        bool globalCheck;
        bool aderyn = Aderyn;
        bool mythril = Mythril;
        bool slither = Slither;

        if (
            _checkCodeQuality() == true &&
            _checkAccessControl() == true &&
            _checkArithmeticAndLogic() == true &&
            _checkExternalInteractions() == true &&
            _checkProySafety() == true &&
            _checkTesting() == true
        ) { globalCheck == true; } else { globalCheck == false; }

        return (globalCheck, aderyn, slither, mythril);
    }
}

/// other checks
// See exactly how your state variables are packed into 32-byte storage slot:
// - forge inspect <contractName> storage-layout
// - - slot: storage slot index, starting 0. offset: byte offset inside that specific 32 byte-slot
// - - type: underlying variable type

// measuring variable efficiency (Gas benchmark):
// - - forge snapshot

/// Variables bytes
// bool	1
// uint8, int8, bytes1, enum	1
// uint16, int16, bytes2	2
// uint32, int32, bytes4	4
// uint64, int64, bytes8	8
// uint128, int128, bytes16	16
// uint256, int256, bytes32	32
// address, address payable	20
// Fixed-size array (T[n])	size(T) × n
// Dynamic array (T[])	32 (pointer)
// string	32 (pointer)
// bytes (dynamic)	32 (pointer)
// mapping(K => V)	32 (pointer)
// struct	sum of packed members

/// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions
