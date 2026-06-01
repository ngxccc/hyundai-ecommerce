import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"]!,
  api_key: process.env["NEXT_PUBLIC_CLOUDINARY_API_KEY"]!,
  api_secret: process.env["CLOUDINARY_API_SECRET"]!,
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    // Handle local file upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "products" }, (error, result) => {
            if (error) reject(new Error(error.message));
            else resolve(result);
          })
          .end(buffer);
      });

      return NextResponse.json(result);
    }

    // Handle external URL upload
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { url?: string };
      const { url } = body;

      if (!url) {
        return NextResponse.json(
          { error: "No URL provided" },
          { status: 400 },
        );
      }

      const result = await cloudinary.uploader.upload(url, {
        folder: "products",
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Unsupported content type" },
      { status: 400 },
    );
  } catch (error: unknown) {
    console.error("[Cloudinary Upload Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
