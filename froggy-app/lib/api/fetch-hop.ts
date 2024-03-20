export async function fetchHop({ tokenId, recipientAddress }: { tokenId: number; recipientAddress: string }) {
  const response = await fetch("/api/hop", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokenId: tokenId,
      recipient: recipientAddress,
    }),
  });

  const data = await response.json();
  return data;
}
