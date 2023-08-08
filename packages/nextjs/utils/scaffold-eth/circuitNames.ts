import circuits from "../../generated/publishedCircuits";

export function getCircuitNames() {
  return circuits ? Object.keys(circuits) : [];
}
