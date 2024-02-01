import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { HashGrid, HashInput } from "~~/components/scaffold-eth/Tutorials";

const HashTutorial: NextPage = () => {
  return (
    <>
      <MetaHeader
        title="ZK Hash Tutorial | Scaffold-ETH 2"
        description="Example UI created with 🏗 Scaffold-ETH 2, showcasing some of its features."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
        <div className={`grid grid-cols-1 lg:grid-cols-6 px-6 lg:px-10 lg:gap-12 w-full max-w-7xl my-0`}>
          <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
              <HashInput />

              <HashGrid />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HashTutorial;
