import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { shareTokens } from "@/lib/schema";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, data } = body;

  if (!type || !data) {
    return NextResponse.json(
      { error: "type et data requis" },
      { status: 400 }
    );
  }

  const db = getDb();
  const token = generateToken();

  await db.insert(shareTokens).values({
    id: token,
    type,
    data: JSON.stringify(data),
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ token });
}
