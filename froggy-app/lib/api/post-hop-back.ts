export async function postHopBack({ txId }: { txId: string }) {
  const response = await fetch("/api/hop-back", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txId,
    }),
  });

  const data = await response.json();
  return data;
}
