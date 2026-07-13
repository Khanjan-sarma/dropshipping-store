import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/requireAdmin";
import { uploadImage, isCloudinaryConfigured } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// Accepts a multipart form upload (field "file") and pushes it to Cloudinary,
// returning the secure URL to store in Product.images.
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Set your Cloudinary env vars." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed" },
      { status: 400 },
    );
  }
  // 8MB limit.
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Image must be under 8MB" },
      { status: 400 },
    );
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;
    const url = await uploadImage(dataUri);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("upload error", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
