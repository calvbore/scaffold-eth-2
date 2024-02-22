import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useWalletClient } from "wagmi";
import { ProofValidityIcon } from "~~/components/scaffold-eth";
import {
  useCircuitInputObj,
  useCircuitProof,
  usePoseidonHash,
  usePublishedCircuitInfo,
  useScaffoldContract,
  useScaffoldContractRead,
} from "~~/hooks/scaffold-eth";

/* eslint-enable @typescript-eslint/no-unused-vars */

export const HashGrid = () => {
  const [location, setLocation] = useState<[number, number] | undefined>();
  const [poseidonHash, updatePoseidonHash] = usePoseidonHash();

  const [storedLocation, setStoredLocation] = useLocalStorage<[number, number] | undefined>(
    `storedLocation`,
    undefined,
  );
  const [storedHash, setStoredHash] = useLocalStorage<number | undefined>(`storedHash`, undefined);

  // const positionCircuitData = usePublishedCircuitInfo("Position");
  // const [circuitInputsObj, updateCircuitInputsObjByKey] = useCircuitInputObj(positionCircuitData.inputs);
  // const [, /*circuitProof*/ provedInputs, , /*circuitPubSignals*/ proofCalldata, isValidProof, generateCircuitProof] =
  //   useCircuitProof("Position", circuitInputsObj, positionCircuitData.vkey);

  // const { data: walletClient } = useWalletClient();
  // const { data: positionGrid } = useScaffoldContract({
  //   contractName: "PositionGrid",
  //   walletClient,
  // });

  // const updatePosition = async () => {
  //   await positionGrid?.write.updatePosition(
  //     // @ts-ignore
  //     proofCalldata,
  //   );
  // };

  // const { data: readPosition } = useScaffoldContractRead({
  //   contractName: "PositionGrid",
  //   functionName: "position",
  // });

  function validMove(loc?: number[], mov?: number[]): boolean {
    if (loc == undefined) return false;
    if (mov == undefined) return false;
    // const x = loc[0];
    // const y = loc[1];
    const valid =
      (mov[1] == loc[1] && mov[0] <= loc[0] + 1 && mov[0] >= loc[0] - 1) ||
      (mov[0] == loc[0] && mov[1] <= loc[1] + 1 && mov[1] >= loc[1] - 1);

    return valid;
  }

  function populateGrid(dims: number[], index?: number, loc?: number) {
    if (index == undefined) {
      index = dims.length - 1;
    }
    if (loc == undefined) {
      loc = 0;
    }
    const arr = [];

    if (index == 0) {
      for (let i = 0; i < dims[index]; i++) {
        arr.push(
          <div className={`indicator`} key={`section-${loc}-${i}`}>
            {/*JSON.stringify([loc, i]) == JSON.stringify(location) ? <span className="indicator-item badge badge-secondary indicator-center"></span> : null*/}
            <div
              className={`grid w-32 h-32 bg-base-300 place-items-center border-solid border-4 
                  ${
                    JSON.stringify([loc, i]) == JSON.stringify(location)
                      ? "border-blue-600 "
                      : validMove(location, [loc, i])
                      ? "border-green-300"
                      : "border-gray-600 "
                  }`}
            >
              <button
                className={`btn btn-secondary btn-sm ${false ? "loading" : ""}`}
                disabled={storedLocation != undefined ? !validMove(storedLocation, [loc, i]) : false}
                onClick={() => {
                  // @ts-ignore
                  setLocation([loc, i]);
                  updatePoseidonHash([loc, i]);
                  // updateCircuitInputsObjByKey(
                  //   ["newPos", "oldPos", "oldPosHash"],
                  //   [[loc, i], !storedLocation ? [0, 0] : storedLocation, storedHash ? storedHash : 0],
                  //   [],
                  //   true,
                  // );
                }}
              >
                {`${loc}, ${i}`}
              </button>
            </div>
          </div>,
        );
      }
    } else {
      for (let i = 0; i < dims[index]; i++) {
        arr.push(<div className="py-2">{populateGrid(dims, index - 1, i)}</div>);
      }
    }
    return arr;
  }

  return (
    <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
      <div className="z-10">
        <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-10 relative">
          <div className="h-[5rem] w-[5.5rem] bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg shadow-base-300">
            <div className="flex items-center justify-center space-x-2">
              <p className="my-0 text-sm">Hash Grid</p>
            </div>
          </div>
          <div className="p-5 divide-y divide-base-300">{populateGrid([4, 4])}</div>
          <div className="flex items-center justify-center">
            <p className="text-sm">Selected position hash: {poseidonHash ? poseidonHash : "empty"}</p>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-sm">Stored position hash: {storedHash ? storedHash : "0"}</p>
          </div>
          {/* <div className="flex items-center justify-center">
            <p className="text-sm">{`${readPosition}`}</p>
          </div> */}
          <div className="flex items-center justify-center gap-6">
            <button
              className={`btn btn-secondary btn-sm ${false ? "loading" : ""}`}
              // @ts-ignore
              // onClick={generateCircuitProof}
            >
              Generate Proof
            </button>
            {/* <ProofValidityIcon
              inputsObj={JSON.stringify(circuitInputsObj)}
              provedInputs={JSON.stringify(provedInputs)}
              isVerified={isValidProof}
            /> */}
            <button
              className={`btn btn-secondary btn-sm ${false ? "loading" : ""}`}
              // disabled={!isValidProof || JSON.stringify(circuitInputsObj) != JSON.stringify(provedInputs)}
              onClick={() => {
                setStoredLocation(location);
                setStoredHash(poseidonHash);
                // updatePosition();
              }}
            >
              commit onchain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
