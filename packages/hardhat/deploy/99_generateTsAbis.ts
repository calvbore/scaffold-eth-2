/**
 * DON'T MODIFY OR DELETE THIS SCRIPT (unless you know what you're doing)
 *
 * This script generates the file containing the contracts Abi definitions.
 * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
 * This script should run as the last deploy script.
 *  */

import * as fs from "fs";
import prettier from "prettier";
import { DeployFunction } from "hardhat-deploy/types";

function getDirectories(path: string) {
  return fs
    .readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

function getContractNames(path: string) {
  return fs
    .readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isFile() && dirent.name.endsWith(".json"))
    .map(dirent => dirent.name.split(".")[0]);
}

const DEPLOYMENTS_DIR = "./deployments";

function getContractDataFromDeployments() {
  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    throw Error("At least one other deployment script should exist to generate an actual contract.");
  }
  const output = {} as Record<string, any>;
  for (const chainName of getDirectories(DEPLOYMENTS_DIR)) {
    const chainId = fs.readFileSync(`${DEPLOYMENTS_DIR}/${chainName}/.chainId`).toString();
    const contracts = {} as Record<string, any>;
    for (const contractName of getContractNames(`${DEPLOYMENTS_DIR}/${chainName}`)) {
      const { abi, address } = JSON.parse(
        fs.readFileSync(`${DEPLOYMENTS_DIR}/${chainName}/${contractName}.json`).toString(),
      );
      contracts[contractName] = { address, abi };
    }
    output[chainId] = [
      {
        chainId,
        name: chainName,
        contracts,
      },
    ];
  }
  return output;
}

const CIRCUITS_DIR = "./client";
const PUBLISH_CIRCUITS_DIR = "../nextjs/public/circuits";

function publishCircuitData() {
  try {
    const circuitOutputs = fs.readdirSync(CIRCUITS_DIR);
    if (!fs.existsSync(PUBLISH_CIRCUITS_DIR)) {
      fs.mkdirSync(PUBLISH_CIRCUITS_DIR);
    }
    circuitOutputs.forEach(fileName => {
      fs.copyFileSync(`${CIRCUITS_DIR}/${fileName}`, `${PUBLISH_CIRCUITS_DIR}/${fileName}`);
    });
  } catch (error: any) {
    console.log(`error publishing circuits to ${PUBLISH_CIRCUITS_DIR}`);
    throw new Error(error);
  }
}

// Array dimension checker
// Returns:
//   false when array dimensions are different
//   an Array when is rectangular 0d (i.e. an object) or >=1d
function arrayDimension(a: any): number[] | false {
  // Make sure it is an array
  if (a instanceof Array) {
    // First element is an array
    const sublength = arrayDimension(a[0]);
    if (sublength === false) {
      // Dimension is different
      return false;
    } else {
      // Compare every element to make sure they are of the same dimensions
      for (let i = 1; i < a.length; i++) {
        const _sublength = arrayDimension(a[i]);
        // HACK: compare arrays...
        if (_sublength === false || sublength.join(",") != _sublength.join(",")) {
          // If the dimension is different (i.e. not rectangular)
          return false;
        }
      }
      // OK now it is "rectangular" (could you call 3d "rectangular"?)
      return [a.length].concat(sublength);
    }
  } else {
    // Not an array
    return [];
  }
}

function getCircuitData() {
  try {
    const circuitNames = fs
      .readdirSync("./circuits/", { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const circuits: any = {};

    circuitNames.forEach((name: string) => {
      const vkey = JSON.parse(fs.readFileSync(`${CIRCUITS_DIR}/${name}.vkey.json`, "utf8"));
      const inputs = JSON.parse(fs.readFileSync(`./circuits/${name}/${name}.input.json`, "utf8"));

      circuits[name] = {
        inputs: Object.keys(inputs).map(name => {
          const dims = arrayDimension(inputs[name]);
          const dataObj = {
            name: name,
            dims: dims,
          };
          return dataObj;
        }),
        vkey: vkey,
      };
    });

    return circuits;
  } catch (error: any) {
    throw new Error(error);
  }
}

/**
 * Generates the TypeScript contract definition file based on the json output of the contract deployment scripts
 * This script should be run last.
 */
const generateTsAbis: DeployFunction = async function () {
  const TARGET_DIR = "../nextjs/generated/";
  const allContractsData = getContractDataFromDeployments();

  const fileContent = Object.entries(allContractsData).reduce((content, [chainId, chainConfig]) => {
    return `${content}${parseInt(chainId).toFixed(0)}:${JSON.stringify(chainConfig, null, 2)},`;
  }, "");

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR);
  }
  fs.writeFileSync(
    `${TARGET_DIR}deployedContracts.ts`,
    prettier.format(`const contracts = {${fileContent}} as const; \n\n export default contracts`, {
      parser: "typescript",
    }),
  );

  console.log(`📝 Updated TypeScript contract definition file on ${TARGET_DIR}deployedContracts.ts`);

  publishCircuitData();
  console.log(`   Circuit data has been published into nextjs project`);

  const allCircuitData = getCircuitData();
  fs.writeFileSync(
    `${TARGET_DIR}publishedCircuits.ts`,
    prettier.format(`const circuits = ${JSON.stringify(allCircuitData)} as const; \n\n export default circuits`, {
      parser: "typescript",
    }),
  );
  console.log(`📝 Updated TypeScript circuit definition file on ${TARGET_DIR}publishedCircuits.ts`);
};

export default generateTsAbis;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags generateTsAbis
generateTsAbis.tags = ["generateTsAbis"];

generateTsAbis.runAtTheEnd = true;
