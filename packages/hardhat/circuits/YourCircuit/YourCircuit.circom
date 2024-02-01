// pragma circom 2.1.4;
include "../../node_modules/circomlib/circuits/poseidon.circom";

template YourCircuit() {

    // Declaration of signals.
    signal input in;
    signal output out;

    component hash = Poseidon(1);
    hash.inputs[0] <== in;

    // Constraints.
    out <== hash.out;
}

component main = YourCircuit();
