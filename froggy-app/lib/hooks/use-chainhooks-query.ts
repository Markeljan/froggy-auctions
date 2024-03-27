"use client";
import { useQuery } from "@tanstack/react-query";

async function fetchChainhookData() {
  const response = await fetch("/api/sord-event");
  const sordEvents = await response.json();
  return sordEvents;
}

export function useChainhooksQuery() {
  return useQuery({
    queryKey: ["chainhooks"],
    queryFn: () => fetchChainhookData(),
    refetchInterval: 10000,
  });
}
