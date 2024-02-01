include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/gates.circom";

template Position(width, height) {

    // Declaration of signals.
    signal input oldPosHash;
    signal input oldPos[2]; // [0] is x coord. [1] is y coord
    signal input newPos[2]; // [0] is x coord. [1] is y coord
    signal output outPosHash;

    // check if current position is zero, necessary to initialize position
    component oldPosZero = IsZero();
    oldPosZero.in <== oldPosHash;

    component inverter = IsZero();
    inverter.in <== oldPosZero.out;

    // if oldPosHash is zero the this selector will also be zero
    signal initSelector;
    initSelector <== inverter.out;

    component clcPosHash = Poseidon(2);
    clcPosHash.inputs[0] <== oldPos[0];
    clcPosHash.inputs[1] <== oldPos[1];


    // if old position hash is zero we will make sure the calculated hash matches
    signal prvPosHash;
    prvPosHash <== initSelector * clcPosHash.out;

    // this is okay because the smart contract checks that the old position hash
    // matches the output of the last proof
    // 0 * hash == 0 || 1 * hash == hash
    prvPosHash === oldPosHash;


    // check that new pos coordinates are valid moves from the old pos coordinates
    component gteq0X = GreaterEqThan(8);
    gteq0X.in[0] <== newPos[0];
    gteq0X.in[1] <== 0;
    gteq0X.out   === 1;

    component lteqWidthX = LessEqThan(8);
    lteqWidthX.in[0] <== newPos[0];
    lteqWidthX.in[1] <== width;
    lteqWidthX.out   === 1;

    component gteq0Y = GreaterEqThan(8);
    gteq0Y.in[0] <== newPos[1];
    gteq0Y.in[1] <== 0;
    gteq0Y.out   === 1;

    component lteqHeighY = LessEqThan(8);
    lteqHeighY.in[0] <== newPos[1];
    lteqHeighY.in[1] <== height;
    lteqHeighY.out   === 1;

    // loc == oldPos moc == newPos
    //  (mov[1] == loc[1] && ((mov[0] <= loc[0]+1) && (mov[0] >= loc[0]-1))) ||
    //  (mov[0] == loc[0] && ((mov[1] <= loc[1]+1) && (mov[1] >= loc[1]-1)))

    component eqY = IsEqual();
    eqY.in[0] <== newPos[1];
    eqY.in[1] <== oldPos[1];

    component lteqXR = LessEqThan(8);
    lteqXR.in[0] <== newPos[0];
    lteqXR.in[1] <== oldPos[0] + 1;

    component gteqXL = GreaterEqThan(8);
    gteqXL.in[0] <== newPos[0];
    gteqXL.in[1] <== oldPos[0] - 1;

    component andRangeX = AND();
    andRangeX.a <== lteqXR.out;
    andRangeX.b <== gteqXL.out;

    component andEqYRangeX = AND();
    andEqYRangeX.a <== eqY.out;
    andEqYRangeX.b <== andRangeX.out;


    component eqX = IsEqual();
    eqX.in[0] <== oldPos[0];
    eqX.in[1] <== newPos[0];

    component lteqYU = LessEqThan(8);
    lteqYU.in[0] <== newPos[1];
    lteqYU.in[1] <== oldPos[1] + 1;

    component gteqYD = GreaterEqThan(8);
    gteqYD.in[0] <== newPos[1];
    gteqYD.in[1] <== oldPos[1] - 1;

    component andRangeY = AND();
    andRangeY.a <== lteqYU.out;
    andRangeY.b <== gteqYD.out;

    component andEqXRangeY = AND();
    andEqXRangeY.a <== eqX.out;
    andEqXRangeY.b <== andRangeY.out;


    component orXY = OR();
    orXY.a   <== andEqYRangeX.out * initSelector; // if input hash is zero this blokc becomes unconstrained
    orXY.b   <== andEqXRangeY.out * initSelector; // allowing initial placement anywhere on the grid
    orXY.out === 1 * initSelector;


    // caclulate new position hash
    component hash = Poseidon(2);
    hash.inputs[0] <== newPos[0];
    hash.inputs[1] <== newPos[1];

    // assign new position hash
    outPosHash <== hash.out;
}

component main {public [oldPosHash]} = Position(4, 4);