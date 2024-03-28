import { NextResponse } from "next/server";
import { getHoppingFrogs } from "@/app/actions";

export async function GET(): Promise<NextResponse> {
  const hoppingList = await getHoppingFrogs();
  return NextResponse.json(hoppingList, { status: 200 });
}
