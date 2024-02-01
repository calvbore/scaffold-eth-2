//@ts-ignore
import { useState } from "react";
import { buildPoseidon } from "circomlibjs";

const poseidon = await buildPoseidon();

export const usePoseidonHash = () => {
  const [hash, updateHash] = useState<any>();

  const updatePoseidonHash = (value: any) => {
    if (isNaN(value) && !Array.isArray(value)) {
      value = Buffer.from(value);
      value = "0x" + value.toString("hex");
    }
    console.log(value);

    let poseidonHash;
    if (Array.isArray(value)) {
      poseidonHash = poseidon(value);
    } else {
      poseidonHash = poseidon([value]);
    }

    console.log(poseidon.F.toString(poseidonHash));

    updateHash(poseidon.F.toString(poseidonHash));
  };

  return [hash, updatePoseidonHash];
};
