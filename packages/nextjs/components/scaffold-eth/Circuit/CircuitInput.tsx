import { InputBase } from "~~/components/scaffold-eth";

type CircuitInputProps = {
  name: string;
  dims: number[];
  inputChange: (key: string, value: any, location?: number[]) => void;
};

export const CircuitInput = ({ name, dims, inputChange }: CircuitInputProps) => {
  const updateNamedInput = (value: any) => {
    inputChange(name, value);
  };

  function updateNestedInput(location: number[]) {
    return (value: any) => {
      inputChange(name, value, location);
    };
  }

  let inputField: any;

  if (dims.length === 0) {
    inputField = (
      <div>
        <p className="font-medium my-0 break-words">{name}</p>
        <InputBase key={`${name}`} name={name} value={undefined} onChange={updateNamedInput} />
      </div>
    );
  }

  const nestedInputs = (dims: number[], index?: number, location?: number[]): any => {
    if (!index) index = 0;
    if (!location) location = new Array(dims.length).fill(0);

    const arr = new Array(dims[index]);

    if (index == dims.length - 1) {
      for (let i = 0; i < dims[index]; i++) {
        location = new Array(...location);
        location[index] = i;
        arr[i] = (
          <div className={`py-1 pl-2`}>
            <div className={`font-my-0`}>
              <InputBase
                key={`${name}${location}`}
                name={`${name}${location}`}
                value={undefined}
                onChange={updateNestedInput(location)}
                suffix={
                  <div
                    className={`text-xs border-0 h-[2.2rem] pr-3 font-mono`}
                    data-tip="nested array location by indices"
                  >
                    <p>{`${location}`.replaceAll(",", ":")}</p>
                  </div>
                }
              />
            </div>
          </div>
        );
      }
    } else {
      for (let i = 0; i < dims[index]; i++) {
        location = new Array(...location);
        location[index] = i;
        arr[i] = <div className={`py-1`}>{nestedInputs(dims, index + 1, location)}</div>;
      }
    }
    return arr;
  };

  if (dims.length > 0) {
    inputField = nestedInputs(dims);
  }

  return (
    <div>
      <p className="font-medium my-0 break-words">{dims.length > 0 ? name : undefined}</p>
      {inputField}
    </div>
  );
};
