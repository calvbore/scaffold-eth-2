import type { NextPage } from "next";
import { useLocalStorage } from "usehooks-ts";
import { MetaHeader } from "~~/components/MetaHeader";
import { CircuitUI } from "~~/components/scaffold-eth";
import { getCircuitNames } from "~~/utils/scaffold-eth/circuitNames";

const selectedCircuitStorageKey = "scaffoldEth2.selectedCircuit";

const DebugCircuits: NextPage = () => {
  const circuitNames = getCircuitNames();
  const [selectedCircuit, setSelectedCircuit] = useLocalStorage<string>(selectedCircuitStorageKey, circuitNames[0]);

  return (
    <>
      <MetaHeader
        title="Debug Circuits | Scaffold-ETH 2"
        description="Debug your published 🏗 Scaffold-ETH 2 circuits in an easy way"
      />
      <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
        {circuitNames.length === 0 ? (
          <p className="text-3xl mt-14">No circuits found!</p>
        ) : (
          <>
            {circuitNames.length > 1 && (
              <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
                {circuitNames.map(circuitName => (
                  <button
                    className={`btn btn-secondary btn-sm normal-case font-thin ${
                      circuitName === selectedCircuit ? "bg-base-300" : "bg-base-100"
                    }`}
                    key={circuitName}
                    onClick={() => setSelectedCircuit(circuitName)}
                  >
                    {circuitName}
                  </button>
                ))}
              </div>
            )}
            {circuitNames.map(circuitName => (
              <CircuitUI
                key={circuitName}
                circuitName={circuitName}
                className={circuitName === selectedCircuit ? "" : "hidden"}
              />
            ))}
          </>
        )}
      </div>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Debug Circuits</h1>
        <p className="text-neutral">
          You can debug & interact with your published circuits here.
          <br /> Check{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages / nextjs / pages / debug-circuits.tsx
          </code>{" "}
        </p>
      </div>
    </>
  );
};

export default DebugCircuits;
