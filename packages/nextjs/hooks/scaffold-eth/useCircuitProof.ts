import { useState } from "react";
import { parseGroth16ToSolidityCalldata, parsePlonkToSolidityCalldata } from "../../utils/scaffold-eth";

// @ts-ignore because they don't ship types
const snarkjs = require("snarkjs");

export const useCircuitProof = (name: string, inputsObj: any, vkey: any) => {
  const wasm = `/circuits/${name}.wasm`;
  const zkey = `/circuits/${name}.zkey`;

  const protocol: string = vkey.protocol;

  const [circuitProof, setCircuitProof] = useState(undefined);
  const [provedInputs, setProvedInputs] = useState(undefined);
  const [circuitPubSignals, setCircuitPubSignals] = useState(undefined);
  const [proofCalldata, setProofCalldata] = useState(undefined);
  const [isValidProof, setIsValidProof] = useState<boolean | undefined>(undefined);

  const generateCircuitProof = async (): Promise<void> => {
    const { proof, publicSignals } = await snarkjs[protocol].fullProve(inputsObj, wasm, zkey);

    const newInputsObj = structuredClone(inputsObj);
    setProvedInputs(newInputsObj);

    const verified = await snarkjs[protocol].verify(vkey, publicSignals, proof);

    let calldata: any;
    if (protocol === "groth16") calldata = parseGroth16ToSolidityCalldata(proof, publicSignals);
    if (protocol === "plonk") calldata = await parsePlonkToSolidityCalldata(proof, publicSignals);

    setCircuitProof(proof);
    setCircuitPubSignals(publicSignals);
    setProofCalldata(calldata);
    setIsValidProof(verified);
  };

  return [circuitProof, provedInputs, circuitPubSignals, proofCalldata, isValidProof, generateCircuitProof];
};
