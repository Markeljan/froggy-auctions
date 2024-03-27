import { FROGGYS_PARENT_HASH } from "@/app/config";

export async function getOwnedFroggysByPrinciple(principle: string) {
  const sordinalsResponse = await fetch(`https://api.sordinals.com/api/v1/inscriptions/owner/${principle}?limit=10000`);
  const sordinalsData = await sordinalsResponse.json();
  const ownedFroggys = sordinalsData?.data?.filter(
    (sord: { parentHash: string }) => sord.parentHash === FROGGYS_PARENT_HASH
  );
  return ownedFroggys;
}
