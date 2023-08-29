import { useEffect, useState } from "react";
import { ProofValidityIcon } from "./ProofValidityIcon";
import { useWalletClient } from "wagmi";
import {
  useScaffoldContract,
  /* , useScaffoldContractWrite, useTransactor */
} from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type VerifyOnchainProps = {
  contractName: string;
  functionName: string;
  mutable: boolean;
  proofCalldata: any;
  inputsObjString: string;
};

export const VerifyOnchain = ({
  contractName,
  functionName,
  mutable,
  proofCalldata,
  inputsObjString,
}: VerifyOnchainProps) => {
  const [isVerifiedOnchain, setIsVerifiedOnchain] = useState<any>();
  const [provedInputsString, setProvedInputsString] = useState<string>("");

  useEffect(() => {
    setIsVerifiedOnchain(undefined);
  }, [functionName]);

  const { data: walletClient } = useWalletClient();
  // const publicClient = usePublicClient();

  const { data: contract } = useScaffoldContract({
    contractName: contractName as ContractName,
    walletClient,
  });

  // const { writeAsync, isLoading, isMining } = useScaffoldContractWrite({
  //   contractName: contractName as ContractName,
  //   functionName: functionName as ExtractAbiFunctionNames<ContractAbi>,
  //   args: proofCalldata
  // });

  // const writeTxn = useTransactor(walletClient);

  const contractVerify = async () => {
    let validity;
    if (mutable == true) {
      // @ts-expect-error
      validity = await contract.simulate[functionName](proofCalldata);
      // @ts-expect-error
      if (validity.result == true && contract) await contract.write[functionName](proofCalldata);
      // if (validity.result == true) {
      //   if (writeAsync) await writeTxn(writeAsync);
      // }
      validity = validity.result;
    } else {
      // @ts-expect-error
      validity = await contract.read[functionName](proofCalldata);
    }
    setProvedInputsString(inputsObjString);
    setIsVerifiedOnchain(validity);
  };

  return (
    <div className="flex justify-between">
      <div>
        <button className="btn btn-primary btn-sm" onClick={contractVerify}>
          Verify
        </button>
      </div>
      <div className={`pl-2`}>
        <ProofValidityIcon
          isVerified={isVerifiedOnchain}
          inputsObj={inputsObjString}
          provedInputs={provedInputsString}
        />
      </div>
    </div>
  );
};
