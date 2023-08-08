import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/outline";

type ProofValidityIconProps = {
  inputsObj: string;
  provedInputs: string;
  isVerified: boolean | (() => Promise<void>) | undefined;
};

export const ProofValidityIcon = ({ inputsObj, provedInputs, isVerified }: ProofValidityIconProps) => {
  let icon;

  if (provedInputs !== inputsObj) {
    icon = <ExclamationTriangleIcon className="stroke-warning" />;
  } else {
    icon = isVerified ? <CheckCircleIcon className="stroke-success" /> : <XCircleIcon className="stroke-warning" />;
  }

  return <div className="h-8 w-8 fill-secondary">{icon}</div>;
};
