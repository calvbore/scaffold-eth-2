import circuitData from "../../generated/publishedCircuits";

type GenericCircuitDeclaration = {
  [key: string]: {
    readonly inputs: readonly {
      readonly name: string;
      readonly dims: readonly number[];
    }[];
    [key: string]: any;
  };
};

export const usePublishedCircuitInfo = (circuitName: string) => {
  const circuits = circuitData as GenericCircuitDeclaration | null;

  const publishedCircuit: any = circuits ? circuits[circuitName] : {};

  return publishedCircuit;
};
