// @ts-ignore because they don't ship types
// const snarkjs = require("snarkjs");
// @ts-ignore because they don't ship types
// const ffjavascript = require('ffjavascript');
// const unstringifyBigInts = ffjavascript.utils.unstringifyBigInts;

export const parsePlonkToSolidityCalldata = async (proof: any, pubSignals: any) => {
  // let calldata = await snarkjs.plonk.exportSolidityCallData(unstringifyBigInts(proof), unstringifyBigInts(pubSignals));
  // console.log(typeof(calldata));

  // const calldataSplit = calldata.split(',')
  // const proofFormatted = calldataSplit[0];

  const calldata = [
    [
      [proof.A[0], proof.A[1]],
      [proof.B[0], proof.B[1]],
      [proof.C[0], proof.C[1]],
      [proof.Z[0], proof.Z[1]],
      [proof.T1[0], proof.T1[1]],
      [proof.T2[0], proof.T2[1]],
      [proof.T3[0], proof.T3[1]],
      [proof.Wxi[0], proof.Wxi[1]],
      [proof.Wxiw[0], proof.Wxiw[1]],
      proof.eval_a,
      proof.eval_b,
      proof.eval_c,
      proof.eval_s1,
      proof.eval_s2,
      proof.eval_zw,
    ],
    [...pubSignals],
  ];
  return calldata;
};
