//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./PositionVerifier.sol";
import "hardhat/console.sol";


contract PositionGrid is PlonkVerifier {

    // mapping(address => uint256) public position;
    uint256 public position;

    function updatePosition(bytes memory proof, uint[] memory pubSignals) public returns(bool) {
        // console.log("stored hash", position[msg.sender]);
        console.log("stored hash", position);

        console.log("prev hash", pubSignals[1]);
        console.log("next hash", pubSignals[0]);

        // require(pubSignals[1] == position[msg.sender], "hash does not match");
        require(pubSignals[1] == position, "hash does not match");

        bool validity = this.verifyProof(proof, pubSignals);
        require(validity == true, "proof rejected");

        // position[msg.sender] = pubSignals[0];
        position = pubSignals[0];

        // console.log("stored hash", position[msg.sender]);
        console.log("stored hash", position);

        return validity;
    }

}