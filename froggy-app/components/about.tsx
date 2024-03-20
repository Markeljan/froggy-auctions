export const About = () => {
  return (
    <div className="flex flex-col justify-center items-center space-y-2 sm:px-16">
      <img
        width="full"
        height="full"
        src="/frogs.png"
        alt="Froggies"
        className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      />
      <div className="px-4 py-2">
        <p className="text-lg">
          Froggy Auctions makes it possible to <span className="text-green-500 font-bold">HOP</span>{" "}
          Froggys between the sOrdinals metaprotocol and Stacks native SIP-009 NFTs
        </p>
      </div>
      <div className="flex flex-col items-center text-md">
        <p className=" mb-1 w-full">How it works</p>
        <ul className="flex flex-col list-none space-y-2 bg-gray-200 rounded-2xl px-4 py-2 mb-8 text-sm">
          <li>
            <span className="text-green-500 font-bold mr-[2px]">HOP</span> to vault your Froggy inscription to a
            trusted principal
          </li>
          <div className="w-full h-[1px] bg-gray-400" />
          <li>SIP-009 Froggy is minted or unvaulted and sent to you</li>
          <div className="w-full h-[1px] bg-gray-400" />
          <li>
            <span className="text-green-500 font-bold mr-[2px]">HOP BACK</span> to vault your SIP-009 Froggy and
            recover your inscription
          </li>
        </ul>
      </div>
    </div>
  );
};
