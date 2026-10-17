// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {Checks} from "./Checks.s.sol";
import {RealEstateV2Proposal} from "../src/RealEstateV2Proposal.sol";

contract DeployRealStateScript is Script {
    // Custom Errors
    error DeployRealStateScript__InvalidChecks();

    RealEstateV2Proposal public realState;


    address owner = makeAddr("OWNER"); // Fake owner for testing, change for an Address you want the Owner to be.

    function setUp() public {
        Checks check = new Checks();
        (bool globalCheck, bool aderyn, bool slither, bool mythril) = check.run();
        if (!globalCheck) revert DeployRealStateScript__InvalidChecks();
        console2.log("Checklist passed");
        console2.log("Aderyn tool Check: ", aderyn);
        console2.log("Slither tool check: ", slither);
        console2.log("Mythril tool check: ", mythril);
    }

    function run() public returns(RealEstateV2Proposal realEstate) {
        vm.startBroadcast();

        realEstate = new RealEstateV2Proposal(owner);

        vm.stopBroadcast();
    }
}
