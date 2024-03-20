import { kv } from "@vercel/kv";
import { froggyData } from "@/lib/froggyData";

export async function saveSordEvent(data: string) {
  try {
    await kv.lpush("sord-events", data);
  } catch (error) {
    console.error("Failed to save sord event", error);
  }
}

export async function getSordEvents() {
  try {
    const events = await kv.lrange("sord-events", 0, -1);
    return events;
  } catch (error) {
    console.error("Failed to get sord events", error);
  }
}

const colors = ["#7dd3fc", "#f9a8d4", "#86efac", "#fde047", "#fca5a5", "#c4b5fd", "#93c5fd", "#a5b4fc", "#c4b5fd"];

const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRandomFroggy = () => {
  return froggyData[Math.floor(Math.random() * froggyData.length)];
};

export const generateBoxGridData = () => {
  const rows = new Array(24).fill(1);
  const cols = new Array(24).fill(1);
  return rows.map(() =>
    cols.map(() => {
      const froggy = getRandomFroggy();
      return { ...froggy, color: getRandomColor() };
    })
  );
};

