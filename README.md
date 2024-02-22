# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

## Circom - How to Hash

What you'll learn:
- How to hash in circom and prove you know the inputs without revealing them
- How to place and move a marker on a grid while both obeying rules of movement and keeping the moves hidden.

Hopefully, after going through this guide you will understand the basics of hashing in circom and the possibilities available with zero knowledge proofs!

### Requirements

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Part 1 (of 2): Simple Hashing

### Starting Up

First, you'll need to clone this repo and install the dependencies:

```
git clone -b circom-hash-tutorial https://github.com/calvbore/scaffold-eth-2.git
cd scaffold-eth-2
yarn install
```

Then start up a local chain:

```
yarn chain
```

Next, in another terminal we generate our empty circuit and its verifier contract:

```
yarn circom
```

Then, deploy them to your local chain with:

```
yarn deploy
```

And finally, in a third terminal we'll start our NextJS app with:

```
yarn start
```

We can visit our app on: `http://localhost:3000`. You can interact with our smart contracts using the `Debug Contracts` page, and our circuits with the `Debug Circuits` page.

Now you should be ready to start learning the basics of hashing in Circom.

### Making a Simple Hashing Circuit

Navigate into and open `packages/hardhat/circuits/YourCircuit/YourCircuit.circom`. You'll find a simple circuit that doesn't do much of anything.

```
template YourCircuit() {

    // Declaration of signals.
    signal input in;
    signal output out;

    out <== in;
}

component main = YourCircuit();
```

This circuit takes an input signal and assigns it to the output signal. Not very interesting. Let's change it so that we hash the input and then assign the hash to the output signal.

First we'll need to import a hashing algorithm, We'll use poseidon today. We put all of our imports at the top of our circuit file, like this:

```diff
++include "../../node_modules/circomlib/circuits/poseidon.circom";

template YourCircuit() {
//...
```

Now we need to remove the old constraint And declare the poseidon component.

```diff
include "../../node_modules/circomlib/circuits/poseidon.circom";

template YourCircuit() {

    // Declaration of signals.
    signal input in;
    signal output out;

--  out <== in;
++  component hash = Poseidon(1);
} 

component main = YourCircuit();
```

We declared the `Poseidon(1)` component with a parameter of `1`, meaning we set up the hashing algorithm so that it only takes one input signal. And we're naming our `Poseidon()` component `hash`.

But, we haven't assigned anything to or from the signals of the component.

```diff
include "../../node_modules/circomlib/circuits/poseidon.circom";

template YourCircuit() {

    // Declaration of signals.
    signal input in;
    signal output out;

    component hash = Poseidon(1);
++  hash.inputs[0] <== in;
++  out <== hash.out;
} 

component main = YourCircuit();
```

The component has an input signal that is an array, in the case a length of `1` because that was the the parameter we passed when we instantiated the component. Arrays are zero indexed so we must assign a signal to `hash.inputs[0]`. We use the `<==` operator to both assign and constrain a signal to another (note that you may use the operator pointing in the opposite direction as well, `==>`).

Now we have finished our simple hashing circuit! But, we should check in on our input file. In the same directory you will find `YourCircuit.input.json`. It's a simple JSON:

```json
{
    "in": "42"
}
```

We don't need to change this at all, but remember that whenever we make a new circuit we will need to make an input as well so that the compiler will have some inputs to test the circuit with.

Run:

```
yarn circom
```

in your terminal to compile the modified circuit.

### Verifying With a Contract

Now let's set up `YourContract.sol` so it can verify the circuit we have just compiled. Navigate to `packages/hardhat/contracts/YourContract.sol`:

You'll see that it is the default scaffold-eth starter contract except for one thing, it imports and inherits the `PlonkVerifier` contract from `YourCircuitVerifier.sol`, which is a simple contract with a single public function `verifyProof(bytes memory proof, uint[] memory pubSignals)`.

We must write a function that calls `verifyProof()` and writes the hash output of our circuit to a `poseidonHash` state variable in our contract.

```js
uint256 public poseidonHash;

function saveProvedHash(bytes memory proof, uint[] memory pubSignals) public {
	 	require(this.verifyProof(proof, pubSignals) == true);
	 	poseidonHash = pubSignals[0];
}
```

There are a couple things to note in our implementation of this function:
- We call `verifyProof` as `this.verifyProof()` so that the contract calls itself as an external contract. The implementation of `verifyProof` is very low level and does not function correctly when called internally by the same contract.
- We set `poseidonHash` to `pubSignals[0]`. Our circuit has only one public signal, the output of the hash function (we will dive deeper into setting public and private signals later in this guide).

Run:
```
yarn deploy
```

to deploy your contract and publish your circuit.

### Hashing in the Frontend

Let's hook up our circuit and verifying contract to the frontend of our app now.

Navigate to and open `packages/nextjs/components/pages/hash-tutorial.tsx`, there you will find a simple component with a few nested `<div>`s and some space to put imported components.

near the top of the file we'll add:

```js
//...
import { HashInput } from "~~/components/scaffold-eth/Tutorials";
//...
```
and place the `HashInput` component in between the most nested `<div>`s where the comments indicate.

Now let's open up the file defining this component. Navigate to `packages/nextjs/components/scaffold-eth/Tutorials/HashInput.tsx`. Inside you will see a text input and two buttons. We're going to set this up to hash whatever text we put in there and then generate a zero knowledge proof and verify it with our smart contract.

First, We'll need to import all the hooks we are going to be using.
```diff
//..
  import {
++  useCircuitInputObj,
++  useCircuitProof,
++  usePoseidonHash,
++  usePublishedCircuitInfo,
    useScaffoldContract,
  } from "~~/hooks/scaffold-eth";
//..
```
Most of these all have to do with interacting with our circuit, which we will get to shortly, but right now let's focus on the `usePoseidonHash` hook. 

We'll declare it at the top of out function like:
```js
export const HashInput = () => {
  const [poseidonHash, updatePoseidonHash] = usePoseidonHash();
//..
```
The hook gives us a getter and a setter. `updatePoseidonHash` takes in an argument and updates `poseidonHash` to be the hash of whatever is passed into it. we're going to put it inside a wrapper function, as we'll need to do something else simultaneously with it later.
```js
  function processInput(value: any) {
    updatePoseidonHash(value);
  }
```
And then put that wrapper function in our text input component.
```diff
  <div>
--  <InputBase value={undefined} onChange={() => {}} />
++  <InputBase value={undefined} onChange={processInput} />
  </div>
```
Next, we'll carve out a little spot to display the hash of out input.
```diff
  <div>
    <InputBase value={null} onChange={processInput} />
  </div>
++<div className="flex items-center justify-center">
++  <p className="text-sm">{poseidonHash ? poseidonHash : "empty"}</p>
++</div>
```
Now, anytime we update an input in the text field a hash will be generated and displayed for your eyes. Give it a try!

Let's get all of our circuit hooks wired up.

In our component we will declare the `usePublishedCircuitInfo` hook:
```js
  const yourCircuitData = usePublishedCircuitInfo("YourCircuit");
```
This gives us JSON object that contains all the info wee need to derive and work with the our circuit.

Then we take `yourCircuitData.inputs` and feed it into the `useCircuitInputObj` hook.
```js
  const [circuitInputsObj, updateCircuitInputsObjByKey] = useCircuitInputObj(yourCircuitData.inputs);
```
This gives us an object in the form of our circuit inputs file, `YourCircuit.inputs.json`, and an update function that lets us update the object's properties by key.

With `updateCircuitInputsObjByKey` we can update our `processInput` function.
```diff
  function processInput(value: any) {
    updatePoseidonHash(value);
++  updateCircuitInputsObjByKey("in", value);
  }
```
Now whenever we change the input of the text field `circuitInputsObj` will be updated in addition to `poseidonHash`.

We'll use `circuitInputsObj` and `circuitInputsObj.vkey` for the `useCircuitProof` hook. This hook gives us a few variables about proofs generated for our circuit, you'll see a few of them are commented out as we will not be using them in this component.

And, we also are given the `generateCircuitProof` function. When we call this all of the other variables returned by the hook will be updated for the current state of `circuitInputsObj`.
```js
  const [
    /*circuitProof*/, 
    provedInputs,
    /*circuitPubSignals*/, 
    proofCalldata, 
    isValidProof, 
    generateCircuitProof
  ] = useCircuitProof("YourCircuit", circuitInputsObj, yourCircuitData.vkey);
```

Our button components have been sitting at the bottom of the file doing nothing for us so far. Let's give the first button a purpose.
```diff
          <div className="flex items-center justify-center gap-6">
            <button
              className="btn btn-secondary btn-sm"
++            // @ts-ignore
++            onClick={generateCircuitProof}
            >
--            Button 1
++            Generate Proof
            </button>
//...
```
We can now generate a new proof whenever this button is clicked in the front end.

Now we can add a helpful icon to show us if the proof we have just generated is valid or not. First we will need to import the icon:
```diff
--import { InputBase } from "~~/components/scaffold-eth";
++import { InputBase, ProofValidityIcon } from "~~/components/scaffold-eth";
//...
```
Below our first button we can add the component and wire it up to our proof variables:
```html
            <ProofValidityIcon
              inputsObj={JSON.stringify(circuitInputsObj)}
              provedInputs={JSON.stringify(provedInputs)}
              isVerified={isValidProof}
            />
```
*(We need to stringify both the proved and normal circuit input objects because comparing objects in js is unnecessarily difficult)*

But we also need to submit the proof onchain.

Head back to the top of our component and define a new function `saveProofOnchain`:
```js
  const saveProofOnchain = async () => {
    await yourContract?.write.saveProvedHash(
      // @ts-ignore
      proofCalldata,
    );
  };
```
This is a simple `async` function that feeds our proof the `saveProvedHash()` function in our smart contract. We'll wire it up to our second button:
```diff
//...
            <button
              className={`btn btn-secondary btn-sm`}
++            disabled={!isValidProof || JSON.stringify(circuitInputsObj) != JSON.stringify(provedInputs)}
++            onClick={saveProofOnchain}
            >
--            Button 2
++            Commit on chain
            </button>
//...
```
Now we should have a fully functional front end that generates a proof for our simple hashing circuit and submits and verifies that proof onchain within a smart contract. Give it a spin!

This was a good toy example to get us familiar with the circuit dev loop. Now that we have gone through the process for a simple circuit we can move on to something a little more complex.

## Bonus Challenge:

To put this circuit to a more interesting use. Can you get your contract to store a hash, and also allow anybody that knows the secret that hashes to that value modify your contract state?

## Part 2 (of 2): Hashing Positions & Hidden Movement

### Moving on a Grid
We're going to take a quick look around the front end first for this next part, it should help you get a good idea of what we're building towards.

Navigate back to `HashTutorial.tsx`, then import our next component: 
```diff
//...
--import { HashInput } from "~~/components/scaffold-eth/Tutorials";
++import { HashInput, HashGrid } from "~~/components/scaffold-eth/Tutorials";
//...
```
`HashGrid.tsx` is a simple grid, head to the file, explore it a bit, and then play with it in the front end to get a feel for how it works. 

The thing that I want you to pay the most attention to is this:
```tsx
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
```
This is the logic that we will have to replicate in our circom circuit. `mov` is the location that is being selected, we're checking that it is a valid place to move. `loc` is the location that is currently occupied. The only valid moves are picking an initial location anywhere on the grid, and then moving up or down one space, or left or right one space.

### Constraining Movement

Now that we know what the purpose of our circuit will be let's get started with constructing it.

First, navigate to `packages/hardhat/circuits` and create a directory named `Position`, within create two files `Position.circom` and `Position.input.json`. Open `Position.circom` and create an empty template:
```js
include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/gates.circom";

template Position(width, height) {

}
```
We import a few modules that we'll need at the top of the file. We need a hash function from `poseidon.circom`, comparison circuits from `comparators.circom`, and logical operators from `gates.circom`.

Next, define our input and output signals.
```diff
template Position(width, height) {
++  // Declaration of signals.
++  signal input oldPosHash;
++  signal input oldPos[2]; // [0] is x coord. [1] is y coord
++  signal input newPos[2]; // [0] is x coord. [1] is y coord
++  signal output outPosHash;
}
```
`oldPosHash` is the hash of the current position placed on the grid. This will be our only public signal (other than the output signal) and we will need to check it in our verifier contract.

`oldPos[2]` is the coordinates of the current position placed on the grid.

`newPos[2]` is the coordinates of the position you would like to move to on the grid.

`outPosHash` is the hash of the new position. Output signals are always public.

Now that we have our signals we need a way to determine if you have already selected a position on the grid. We will check `oldPosHash` and assume that if it is zero then the position has not been initialized. The only reason this assumption is practical is because we will be checking this value against a storage variable in our smart contract.
```circom
//...
    // check if current position is zero, necessary to initialize position
    component oldPosZero = IsZero();
    oldPosZero.in <== oldPosHash;

    component inverter = IsZero();
    inverter.in <== oldPosZero.out;

     // if oldPosHash is zero the this selector will also be zero
    signal initSelector;
    initSelector <== inverter.out;
//...
```
We will use the `initSelector` signal to select if the movement rules are applied to the `newPos` coordinates. This signal is a boolean value. In this case zero means that they will not be applied and one means that they will. We will use multiplication to apply these rules later in the circuit

Then we will verify that the prover knows the position that hashes to `oldPosHash`.
```circom
//...
    component clcPosHash = Poseidon(2);
    clcPosHash.inputs[0] <== oldPos[0];
    clcPosHash.inputs[1] <== oldPos[1];


    // if old position hash is zero we will make sure the calculated hash matches
    signal prvPosHash;
    prvPosHash <== initSelector * clcPosHash.out;

    // this is okay because the smart contract checks that the old position hash
    // matches the output of the last proof
    // 0 * hash == 0 || 1 * hash == hash
    prvPosHash === oldPosHash;
//...
```
Here we calculate hash from the `oldPos[2]` coordinates as `prvHash`, but notice this: `initSelector * clcPosHash.out`. If the `oldPosHash` signal supplied is zero then we multiply the calculated position hash by zero (zeroing out the result), otherwise it will be multiplied by one leaving the result unchanged. This is a pattern that is repeated often.

Next, we have to slog through replicating all of the comparisons and boolean operations in the `validMove()` function in `HashGrid.tsx`.
```
//...
    // loc == oldPos moc == newPos
    //  (mov[1] == loc[1] && ((mov[0] <= loc[0]+1) && (mov[0] >= loc[0]-1))) ||
    //  (mov[0] == loc[0] && ((mov[1] <= loc[1]+1) && (mov[1] >= loc[1]-1)))

    component eqY = IsEqual();
    eqY.in[0] <== newPos[1];
    eqY.in[1] <== oldPos[1];

    component lteqXR = LessEqThan(8);
    lteqXR.in[0] <== newPos[0];
    lteqXR.in[1] <== oldPos[0] + 1;

    component gteqXL = GreaterEqThan(8);
    gteqXL.in[0] <== newPos[0];
    gteqXL.in[1] <== oldPos[0] - 1;
//...
```
We are sequentially replicating each comparison (we will take car of the boolean operations shortly) in the first line of the function from left to right. First feeding the `y` coordinate of the new and old position in an equality checking component, then checking that new `x` is less than or equal to the old `x+1`, and finally checking that new `x` is greater than or equal to the old `x-1`.

Now we perform the boolean operations to the outputs of these three components:
```
//...
    component andRangeX = AND();
    andRangeX.a <== lteqXR.out;
    andRangeX.b <== gteqXL.out;

    component andEqYRangeX = AND();
    andEqYRangeX.a <== eqY.out;
    andEqYRangeX.b <== andRangeX.out;
//...
```
First we `AND` together the outputs of the `x` coordinate comparisons. Second we take the output of the previous `AND`, and `AND` it with the equality comparison of the `y` coordinates. 

Now we'll repeat the above but switch the places of the `x` and `y` coordinates with each other:
```
//...
    component eqX = IsEqual();
    eqX.in[0] <== oldPos[0];
    eqX.in[1] <== newPos[0];

    component lteqYU = LessEqThan(8);
    lteqYU.in[0] <== newPos[1];
    lteqYU.in[1] <== oldPos[1] + 1;

    component gteqYD = GreaterEqThan(8);
    gteqYD.in[0] <== newPos[1];
    gteqYD.in[1] <== oldPos[1] - 1;

    component andRangeY = AND();
    andRangeY.a <== lteqYU.out;
    andRangeY.b <== gteqYD.out;

    component andEqXRangeY = AND();
    andEqXRangeY.a <== eqX.out;
    andEqXRangeY.b <== andRangeY.out;
//...
```

And with that we come to our las boolean operation in this circuit. We must `OR` together the final `AND` component outputs from the two sections above:
```
//...
    component orXY = OR();
    orXY.a   <== andEqYRangeX.out * initSelector; // if input hash is zero this block becomes unconstrained
    orXY.b   <== andEqXRangeY.out * initSelector; // allowing initial placement anywhere on the grid
    orXY.out === 1 * initSelector;
//...
```
Our old friend the `initSelector` signal shows up here again. We will multiply both inputs by the selector signal, becoming zero if `oldPosHash` has not been previously set. We are also constraining the output of this `OR` component to be true unless `oldPosHash` has not been previously set. The selector's use here will let us pick a position anywhere on the grid for our first movement.

And finally we need to calculate the output hash signal for the circuit:
```
//...
    // calculate new position hash
    component hash = Poseidon(2);
    hash.inputs[0] <== newPos[0];
    hash.inputs[1] <== newPos[1];

    // assign new position hash
    outPosHash <== hash.out;
//...
```

Don't forget to define the `main` component at the bottom!
```
//...
component main {public [oldPosHash]} = Position(4, 4);
```

### Storing the Hidden Position

Our circuit is completed! But, we need to get our smart contract set up to store the right information.

Run:
```
yarn circom
```
To generate the verifier contract for our circuit.

Then navigate to `packages/hardhat/contracts` and create a new solidity file named `PositionGrid.sol`:

```solidity
//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./PositionVerifier.sol";


contract PositionGrid is PlonkVerifier {

}
```

And add a a verifying function similar to what we did with the hash verifier earlier: 
```diff
//...
contract PositionGrid is PlonkVerifier {

++  function updatePosition(bytes memory proof, uint[] memory pubSignals) public returns(bool) {
++      bool validity = this.verifyProof(proof, pubSignals);
++      require(validity == true, "proof rejected");
++
++      return validity;
++  }

}
```

Then add a couple lines to do our checks on the hash outside of the circuit and store the updated position hash:
```diff
//...
contract PositionGrid is PlonkVerifier {

++  uint256 public position;

    function updatePosition(bytes memory proof, uint[] memory pubSignals) public returns(bool) {
++      require(pubSignals[1] == position, "hash does not match");

        bool validity = this.verifyProof(proof, pubSignals);
        require(validity == true, "proof rejected");

++      position = pubSignals[0];

        return validity;
    }

}
```

That's all we need from our smart contract.

Now we need to write a deploy script. Navigate to `packages/hardhat/deploy` and create a file named `01_deploy_position_grid.ts`.

```ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("PositionGrid", {
    from: deployer,
    log: true,
    autoMine: true,
  });

};

export default deployYourContract;

deployYourContract.tags = ["PositionGrid"];
```
*(if you're unsure of what's happening in the above code take a look at the comments inside `00_deploy_your_contract.ts`)*

Let's deploy it and wire it all up!

Run:
```
yarn deploy
```

### Wiring into the Frontend
*(before using the modification we make to the front end in this section it is a good idea to clear the local storage in the browser, otherwise you may run into some problems)*

Most of the functionality for this component to work is already in place, all we have to do is connect to the smart contract verifier and wire up our circuit. Everything we will need should be imported at the top of the file already.

First we will ned access to our verifier smart contract:
```tsx
//...
  const { data: walletClient } = useWalletClient();
  const { data: positionGrid } = useScaffoldContract({
    contractName: "PositionGrid",
    walletClient,
  });
//...
```
We are connecting to our wallet provider and using it to connect to our smart contract.

Now we'll use the `useScaffoldContractRead` hook to read the position has stored by our contract.
```tsx
//...
  const { data: readPosition } = useScaffoldContractRead({
    contractName: "PositionGrid",
    functionName: "position",
  });
//...
``` 
And, add a simple component:
```diff
//...
          <div className="flex items-center justify-center">
            <p className="text-sm">Stored position hash: {storedHash ? storedHash : "0"}</p>
          </div>
++        <div className="flex items-center justify-center">
++          <p className="text-sm">{`${readPosition}`}</p>
++        </div>
          <div className="flex items-center justify-center gap-6">
//...
```

Next we'll take care of bringing in all of our circuit info with the circuit hooks we used earlier:
```tsx
//...
  const positionCircuitData = usePublishedCircuitInfo("Position");
  const [circuitInputsObj, updateCircuitInputsObjByKey] = useCircuitInputObj(positionCircuitData.inputs);
  const [
    /*circuitProof*/,
    provedInputs,
    /*circuitPubSignals*/,
    proofCalldata,
    isValidProof,
    generateCircuitProof
  ] = useCircuitProof("Position", circuitInputsObj, positionCircuitData.vkey);
//...
```

Then we have to update `circuitInputsObj` whenever we select a new position in the UI:
```diff
//...
              <button
                className={`btn btn-secondary btn-sm ${false ? "loading" : ""}`}
                disabled={storedLocation != undefined ? !validMove(storedLocation, [loc, i]) : false}
                onClick={() => {
                  // @ts-ignore
                  setLocation([loc, i]);
                  updatePoseidonHash([loc, i]);
++                updateCircuitInputsObjByKey(
++                  ["newPos", "oldPos", "oldPosHash"],
++                  [[loc, i], !storedLocation ? [0, 0] : storedLocation, storedHash ? storedHash : 0],
++                  [],
++                  true,
++                );
                }}
              >
                {`${loc}, ${i}`}
              </button>
//...
```
With `updateCircuitInputsObjByKey()` we can update multiple keys by passing their names as an array and the associated values we want to be set as an array of the same length.

Then modify our "Generate Proof" button to actually generate us a proof:
```diff
//...
            <button
              className={`btn btn-secondary btn-sm ${false ? "loading" : ""}`}
++            // @ts-ignore
++            onClick={generateCircuitProof}
            >
              Generate Proof
            </button>
//...
```

And, underneath that button we'll add the `ProofValidityIcon` so we know if our proof will verify:
```diff
//...
              Generate Proof
            </button>
++          <ProofValidityIcon
++            inputsObj={JSON.stringify(circuitInputsObj)}
++            provedInputs={JSON.stringify(provedInputs)}
++            isVerified={isValidProof}
++          />
            <button
              className
//...
```

Create a function that feeds our proof to the verifier contract:
```tsx
//...
  const updatePosition = async () => {
    await positionGrid?.write.updatePosition(
      // @ts-ignore
      proofCalldata,
    );
  };
//...
```

We'll plug `updatePosition` into our last button, and make it clickable only if we have a valid proof ready with our currently selected inputs:
```diff
//...
            <button
              className={`btn btn-secondary btn-sm ${false ? "loading" : ""}`}
++            disabled={!isValidProof || JSON.stringify(circuitInputsObj) != JSON.stringify(provedInputs)}
              onClick={() => {
                setStoredLocation(location);
                setStoredHash(poseidonHash);
++              updatePosition();
              }}
            >
              commit onchain
            </button>
//...
```

Now our grid UI should be finished! You can play with it and if you're feeling adventurous try removing the check for valid movements and generating an invalid proof. If that's not enough for you give the bonus challenge below a shot.

I hope you've gained a decent understanding of how hashes inside circom work, and have learned enough to start creating your own zk applications harnessing the power of hashes!

### Bonus Challenge:

Some of you may have noticed a problem with hiding movements in the grid we've set up. Anyone can compute the hash of each coordinate and store them in a lookup table. [Dark forest](https://zkga.me/) uses this as an interesting game mechanic and "fog of war", but this effect may not be desirable. Can you think of a way to modify our circuit and keep every position hidden?


## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
