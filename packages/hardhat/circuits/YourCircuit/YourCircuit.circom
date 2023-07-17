// pragma circom 2.1.4;

template YourCircuit() {

    // Declaration of signals.
    signal input in;
    signal output out;

    // Constraints.
    signal i;
    i <== in*in;
}

component main = YourCircuit();
