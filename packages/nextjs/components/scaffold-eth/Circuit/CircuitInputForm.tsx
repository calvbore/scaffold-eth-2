import { CircuitInput } from "./CircuitInput";
import { ProofReceipt, ProofValidityIcon, displayTxResult } from "~~/components/scaffold-eth";

type InputsData = {
  name: string;
  dims: number[];
};

type CircuitInputFormProps = {
  inputs: InputsData[];
  inputsObj: any;
  updateInputsObj: (key: string, value: any, location?: number[]) => void;
  proof?: any;
  provedInputs?: any;
  pubSignals?: any;
  proofCalldata?: any;
  isVerified?: any;
  generateProof?: any;
};

export const CircuitInputForm = ({
  inputs,
  inputsObj,
  updateInputsObj,
  provedInputs,
  pubSignals,
  proofCalldata,
  isVerified,
  generateProof,
}: CircuitInputFormProps) => {
  const inputFields = inputs.map(inputData => {
    return (
      <CircuitInput
        key={`C:I:${inputData.name}`}
        name={inputData.name}
        dims={inputData.dims}
        inputChange={updateInputsObj}
      />
    );
  });

  return (
    <div>
      <div className="py-5 space-y-3 first:pt-0 last:pb-1">{inputFields}</div>
      <div className="flex justify-between gap-2">
        <div className="flex-grow">
          {pubSignals !== null && pubSignals !== undefined && (
            <span className="block bg-secondary rounded-3xl text-sm px-4 py-1.5">
              <strong>Result</strong>: {displayTxResult(pubSignals)}
            </span>
          )}
        </div>
        <div className={`flex`} data-tip={`${"Wallet not connected or in the wrong network"}`}>
          <button
            className={`btn btn-primary btn-sm ${false ? "loading" : ""}`}
            disabled={false}
            onClick={generateProof}
          >
            Prove
          </button>
        </div>
        <div key={JSON.stringify(inputsObj)}>
          <ProofValidityIcon
            inputsObj={JSON.stringify(inputsObj)}
            provedInputs={JSON.stringify(provedInputs)}
            isVerified={isVerified}
          />
        </div>
      </div>
      <div className="flex justify-between gap-2">
        <div className="flex-grow basis-0 py-2">
          <ProofReceipt txResult={proofCalldata} />
        </div>
      </div>
    </div>
  );
};
