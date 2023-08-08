import { useState } from "react";
import { ProofValidityIcon } from "./ProofValidityIcon";
import { useWalletClient } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type VerifyOnchainProps = {
  contractName: string;
  functionName: string;
  mutable: boolean;
  proofCalldata: any;
};

export const VerifyOnchain = ({ contractName, functionName, mutable, proofCalldata }: VerifyOnchainProps) => {
  const [isVerifiedOnchain, setIsVerifiedOnchain] = useState<any>();

  const { data: walletClient } = useWalletClient();
  // const publicClient = usePublicClient();

  const { data: contract } = useScaffoldContract({
    contractName: contractName as ContractName,
    walletClient,
  });

  // const { data: readContract } = useScaffoldContract({
  //   contractName: contractName as ContractName,
  //   publicClient
  // });

  const contractVerify = async () => {
    let validity;
    if (mutable == true) {
      validity = await contract?.write[functionName](proofCalldata);
    } else {
      // validity = await contract?.read[functionName](proofCalldata);
    }
    console.log(mutable);
    console.log(validity);
    setIsVerifiedOnchain(validity);
  };

  return (
    <div className="flex justify-between">
      <div>
        <button className="btn btn-primary btn-sm" onClick={contractVerify}>
          Verify
        </button>
      </div>
      <div>
        <ProofValidityIcon isVerified={isVerifiedOnchain} inputsObj={""} provedInputs={""} />
      </div>
    </div>
  );
};
