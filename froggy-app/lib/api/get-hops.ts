export async function getHops() {
  const response = await fetch("/api/hop");
  const data = await response.json();
  return data;
}
