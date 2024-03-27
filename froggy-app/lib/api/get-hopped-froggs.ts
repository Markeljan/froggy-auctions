import { FroggyHop } from "@/lib/types";

export async function getAllHoppedFrogs() {
  const response = await fetch("/api/hop");
  const data = await response.json();
  return data as FroggyHop[];
}
