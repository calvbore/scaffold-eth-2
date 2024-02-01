import { useWalletClient } from "wagmi";
import { InputBase, ProofValidityIcon } from "~~/components/scaffold-eth";
import {
  useCircuitInputObj,
  useCircuitProof,
  usePoseidonHash,
  usePublishedCircuitInfo,
  useScaffoldContract,
} from "~~/hooks/scaffold-eth";

export const HashInput = () => {
  const [poseidonHash, updatePoseidonHash] = usePoseidonHash();

  const { data: walletClient } = useWalletClient();
  const { data: yourContract } = useScaffoldContract({
    contractName: "YourContract",
    walletClient,
  });

  const yourCircuitData = usePublishedCircuitInfo("YourCircuit");
  const [circuitInputsObj, updateCircuitInputsObjByKey] = useCircuitInputObj(yourCircuitData.inputs);
  const [, /*circuitProof*/ provedInputs, , /*circuitPubSignals*/ proofCalldata, isValidProof, generateCircuitProof] =
    useCircuitProof("YourCircuit", circuitInputsObj, yourCircuitData.vkey);

  const saveProofOnchain = async () => {
    await yourContract?.write.saveProvedHash(
      // @ts-ignore
      proofCalldata,
    );
  };

  function processInput(value: any) {
    updatePoseidonHash(value);
    updateCircuitInputsObjByKey("in", value);
  }

  return (
    <div className="z-10">
      <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-10 relative">
        <div className="h-[5rem] w-[5.5rem] bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg shadow-base-300">
          <div className="flex items-center justify-center space-x-2">
            <p className="my-0 text-sm">Hash Input</p>
          </div>
        </div>
        <div className="p-5 divide-y divide-base-300">
          {/* Put components in here */}
          <div>
            <InputBase value={null} onChange={processInput} />
          </div>
          <div className="flex items-center justify-center">
            <p className="text-sm">{poseidonHash ? poseidonHash : "empty"}</p>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              className="btn btn-secondary btn-sm"
              // @ts-ignore
              onClick={generateCircuitProof}
            >
              Generate Proof
            </button>
            <ProofValidityIcon
              inputsObj={JSON.stringify(circuitInputsObj)}
              provedInputs={JSON.stringify(provedInputs)}
              isVerified={isValidProof}
            />
            <button
              className={`btn btn-secondary btn-sm`}
              disabled={!isValidProof || JSON.stringify(circuitInputsObj) != JSON.stringify(provedInputs)}
              onClick={saveProofOnchain}
            >
              Commit on chain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
