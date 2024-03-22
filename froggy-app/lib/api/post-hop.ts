export async function postHop({ txid }: { txid: string }) {
  const response = await fetch("/api/hop", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txid,
    }),
  });

  const data = await response.json();
  return data;
}
