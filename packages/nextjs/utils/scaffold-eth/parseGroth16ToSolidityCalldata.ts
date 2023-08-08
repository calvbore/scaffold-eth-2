export const parseGroth16ToSolidityCalldata = (proof: any, pubSignals: any) => {
  console.log("proof", proof);

  const calldata = [
    [proof.pi_a[0], proof.pi_a[1]],
    [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ],
    [proof.pi_c[0], proof.pi_c[1]],
    [...pubSignals],
  ];

  return calldata;
};
