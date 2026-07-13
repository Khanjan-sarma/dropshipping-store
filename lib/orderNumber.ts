import { prisma } from "@/lib/prisma";

// Human-friendly sequential order numbers like "SS-1042".
const PREFIX = "SS-";
const START = 1000;

export async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  return `${PREFIX}${START + count + 1}`;
}
