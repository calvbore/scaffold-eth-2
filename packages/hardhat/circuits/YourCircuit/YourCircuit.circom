// pragma circom 2.1.4;

template YourCircuit() {

    // Declaration of signals.
    signal input in;
    signal output out;

    // Constraints.
    out <== in*in;
}

component main = YourCircuit();
