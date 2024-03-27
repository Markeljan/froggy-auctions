export async function postHop({ txId }: { txId: string }) {
  const response = await fetch("/api/hop", {
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
