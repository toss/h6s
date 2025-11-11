import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  // Security: only allow reading from examples directory
  if (!filePath.startsWith("app/docs/examples/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  try {
    const fullPath = join(process.cwd(), filePath);
    const content = readFileSync(fullPath, "utf-8");

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
