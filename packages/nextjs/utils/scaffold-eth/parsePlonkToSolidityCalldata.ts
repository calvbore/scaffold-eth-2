// @ts-ignore because they don't ship types
const snarkjs = require("snarkjs");
// @ts-ignore because they don't ship types
const ffjavascript = require("ffjavascript");
const unstringifyBigInts = ffjavascript.utils.unstringifyBigInts;

export const parsePlonkToSolidityCalldata = async (proof: any, pubSignals: any) => {
  let calldata = await snarkjs.plonk.exportSolidityCallData(unstringifyBigInts(proof), unstringifyBigInts(pubSignals));
  // console.log(typeof(calldata));

  const calldataSplit = calldata.split(",");
  const proofFormatted = calldataSplit[0];
  // console.log(proof);

  // const calldata = [
  //   [
  //     ["0x" + BigInt(proof.A[0]).toString(16), "0x" + BigInt(proof.A[1]).toString(16)],
  //     ["0x" + BigInt(proof.B[0]).toString(16), "0x" + BigInt(proof.B[1]).toString(16)],
  //     ["0x" + BigInt(proof.C[0]).toString(16), "0x" + BigInt(proof.C[1]).toString(16)],
  //     ["0x" + BigInt(proof.Z[0]).toString(16), "0x" + BigInt(proof.Z[1]).toString(16)],
  //     ["0x" + BigInt(proof.T1[0]).toString(16), "0x" + BigInt(proof.T1[1]).toString(16)],
  //     ["0x" + BigInt(proof.T2[0]).toString(16), "0x" + BigInt(proof.T2[1]).toString(16)],
  //     ["0x" + BigInt(proof.T3[0]).toString(16), "0x" + BigInt(proof.T3[1]).toString(16)],
  //     ["0x" + BigInt(proof.Wxi[0]).toString(16), "0x" + BigInt(proof.Wxi[1]).toString(16)],
  //     ["0x" + BigInt(proof.Wxiw[0]).toString(16), "0x" + BigInt(proof.Wxiw[1]).toString(16)],
  //     "0x" + BigInt(proof.eval_a).toString(16),
  //     "0x" + BigInt(proof.eval_b).toString(16),
  //     "0x" + BigInt(proof.eval_c).toString(16),
  //     "0x" + BigInt(proof.eval_s1).toString(16),
  //     "0x" + BigInt(proof.eval_s2).toString(16),
  //     "0x" + BigInt(proof.eval_zw).toString(16),
  //   ],
  //   [...pubSignals],
  // ];

  // const calldata = [
  //   [
  //     [proof.A[0], proof.A[1]],
  //     [proof.B[0], proof.B[1]],
  //     [proof.C[0], proof.C[1]],
  //     [proof.Z[0], proof.Z[1]],
  //     [proof.T1[0], proof.T1[1]],
  //     [proof.T2[0], proof.T2[1]],
  //     [proof.T3[0], proof.T3[1]],
  //     [proof.Wxi[0], proof.Wxi[1]],
  //     [proof.Wxiw[0], proof.Wxiw[1]],
  //     proof.eval_a,
  //     proof.eval_b,
  //     proof.eval_c,
  //     proof.eval_s1,
  //     proof.eval_s2,
  //     proof.eval_zw,
  //   ],
  //   [...pubSignals],
  // ];

  // const calldata = [
  //   [
  //     proof.A[0], proof.A[1],
  //     proof.B[0], proof.B[1],
  //     proof.C[0], proof.C[1],
  //     proof.Z[0], proof.Z[1],
  //     proof.T1[0], proof.T1[1],
  //     proof.T2[0], proof.T2[1],
  //     proof.T3[0], proof.T3[1],
  //     proof.Wxi[0], proof.Wxi[1],
  //     proof.Wxiw[0], proof.Wxiw[1],
  //     proof.eval_a,
  //     proof.eval_b,
  //     proof.eval_c,
  //     proof.eval_s1,
  //     proof.eval_s2,
  //     proof.eval_zw
  //   ],
  //   [...pubSignals]
  // ];

  // calldata[0] = calldata[0].reduce((accumulator, currentValue) => {
  //   let str = BigInt(currentValue).toString(16);
  //   while (str.length < 64) str = "0" + str;
  //   console.log(str);
  //   return accumulator + str;
  // }, "0x");
  // calldata[1] = calldata[1].map((num) => {
  //   let str = BigInt(num).toString(16);
  //   while (str.length < 64) str = "0" + str;
  //   return "0x" + str;
  // });

  calldata = [proofFormatted, pubSignals];

  console.log(calldata);
  return calldata;
};
