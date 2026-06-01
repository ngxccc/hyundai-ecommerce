import { env } from "@/env";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      paramsToSign: Record<string, string>;
    };
    const { paramsToSign } = body;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET,
    );

    return Response.json({ signature });
  } catch {
    return Response.json({ error: "Failed to sign" }, { status: 500 });
  }
}
