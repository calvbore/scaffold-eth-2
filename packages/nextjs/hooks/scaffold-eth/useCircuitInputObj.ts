import { useState } from "react";

// @ts-ignore because they don't ship types
// const ffjavascript = require('ffjavascript');
// const stringifyBigInts = ffjavascript.utils.stringifyBigInts;

function ndArray(value: any, dims: number[], idx: number): any {
  let arr = new Array(dims[idx]);
  if (dims.length != 0 && idx != dims.length) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = ndArray(value, dims, idx + 1);
    }
  } else {
    arr = value;
  }
  return arr;
}

function setNestedArrayValue(array: any, value: any, location: number[], index?: number): any {
  if (!index) index = 0;
  if (index == location.length - 1) {
    array[location[index]] = value;
  } else {
    setNestedArrayValue(array[location[index]], value, location, index + 1);
  }
}

export const useCircuitInputObj = (inputs: any) => {
  const [circuitInputsObj, setCircuitInputsObj] = useState(() => {
    const newCircuitInputsObj: any = {};
    inputs.map((data: any) => {
      newCircuitInputsObj[data.name] = ndArray("", data.dims, 0);
    });
    return newCircuitInputsObj;
  });

  const updateCircuitInputsObjByKey = (key: string | string[], value: any, location?: number[], override?: boolean) => {
    const newCircuitInputsObj: any = structuredClone(circuitInputsObj);

    if (!Array.isArray(key)) {
      if (!override && Array.isArray(value)) throw new Error("value cannot be array without setting override");

      if (isNaN(value) && !override) {
        value = Buffer.from(value);
        value = "0x" + value.toString("hex");
      }

      if (!location || !location.length) {
        newCircuitInputsObj[key] = value;
      } else {
        setNestedArrayValue(newCircuitInputsObj[key], value, location);
      }
    } else {
      // setting multiple keys assumes override behaviour for each key
      if (key.length != value.length) throw new Error("key and value array lengths must match");

      for (let i = 0; i < key.length; i++) {
        newCircuitInputsObj[key[i]] = value[i];
      }
    }

    setCircuitInputsObj(newCircuitInputsObj);
  };

  return [circuitInputsObj, updateCircuitInputsObjByKey];
};
