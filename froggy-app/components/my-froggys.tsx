"use client";

import { useUserSession } from "@/app/providers";
import { ImageCard } from "./ui/image-card";
import { useFetchFroggys } from "@/lib/api/use-fetch-froggys";

const DEV_ADDRESS = "SP2X3WZ9WX28BB37ZAHM18T7PV76ZN4NGYWVH99PE";

export const MyFroggys = () => {
  const { userData } = useUserSession();
  const { userAddress } = userData;
  const { data, isPending, error, isFetching } = useFetchFroggys(userAddress);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data?.map((froggy: { fileUrl: string; id: string }, index: number) => (
        <ImageCard className="max-w-[250px] w-full mx-auto cursor-pointer " imageUrl={froggy.fileUrl} key={index}>
          {froggy.id}
        </ImageCard>
      ))}
    </div>
  );
};
