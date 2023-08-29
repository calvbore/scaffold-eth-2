import { useState } from "react";
import { VerifyOnchain } from "./VerifyOnchain";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

type VerifyByContractProps = {
  proofCalldata: any;
  inputsObjString: string;
};

export const VerifyByContract = ({ proofCalldata, inputsObjString }: VerifyByContractProps) => {
  const contractNames = getContractNames();

  const [selectedContract, setSelectedContract] = useState<string>("");
  const [selectedFunction, setSelectedFunction] = useState<string>("");

  let functionMutability: Record<string, boolean> = {};

  const { data: deployedContractData } = useDeployedContractInfo(selectedContract as ContractName);

  const getFunctionNames = (contractInfo: any): string[] => {
    const funcs: string[] = [];
    const isWriteFunc: Record<string, boolean> = {};
    contractInfo.abi.map((func: any) => {
      if (func.type === "function") {
        if (func.stateMutability === "pure" || func.stateMutability === "view") {
          isWriteFunc[func.name] = false;
        } else {
          isWriteFunc[func.name] = true;
        }
        funcs.push(func.name);
      }
    });
    functionMutability = structuredClone(isWriteFunc);
    return funcs;
  };

  return (
    <div className="">
      <div className={"flex justify-between gap-2 pl-10"}>
        <div className="dropdown dropdown-hover">
          <label tabIndex={0} className="btn btn-secondary btn-sm w-52">
            {selectedContract ? selectedContract : "Select Verifier Contract"}
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 overflow-y-scroll"
          >
            {contractNames.map((name: string | number) => {
              const setSelectedToName = () => {
                setSelectedContract(name as string);
              };
              return (
                <li key={`scaf:con:${name}`}>
                  <a className="text-sm" onClick={setSelectedToName}>
                    {name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="dropdown dropdown-hover">
          <label tabIndex={0} className="btn btn-secondary btn-sm w-52">
            {selectedFunction ? selectedFunction : "Select Verifier Function"}
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 overflow-auto"
          >
            {!deployedContractData ? (
              <li>
                <a className="text-sm">Loading...</a>
              </li>
            ) : (
              getFunctionNames(deployedContractData).map((func: string) => {
                const setSelectedToFunc = () => {
                  setSelectedFunction(func);
                };
                return (
                  <li key={`con:func:${func}`}>
                    <a className="text-sm" onClick={setSelectedToFunc}>
                      {func}
                    </a>
                  </li>
                );
              })
            )}
          </ul>
        </div>
        <div className="pl-6">
          <VerifyOnchain
            contractName={selectedContract}
            functionName={selectedFunction}
            mutable={functionMutability[selectedFunction]}
            proofCalldata={proofCalldata}
            inputsObjString={inputsObjString}
          />
        </div>
      </div>
      <div></div>
    </div>
  );
};
