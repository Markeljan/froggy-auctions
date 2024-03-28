import { NextRequest, NextResponse } from "next/server";
import { getLastTxByTokenId } from "@/app/actions";

export async function GET(request: NextRequest): Promise<Response> {
  const tokenId = request.nextUrl.searchParams.get("tokenId");
  if (!tokenId) {
    return NextResponse.json({ error: "Invalid tokenId searchParam" }, { status: 400 });
  }

  const froggyHop = await getLastTxByTokenId(parseInt(tokenId));
  return NextResponse.json(froggyHop, { status: 200 });
}
