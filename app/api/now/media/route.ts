import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { nowAttachments } from "../../../../db/schema";

function runtimeEnv() {
  return env as typeof env & { BUCKET: R2Bucket };
}

export async function GET(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return new Response("Not found", { status: 404 });

  try {
    const db = getDb();
    const [attachment] = await db.select().from(nowAttachments).where(eq(nowAttachments.id, id)).limit(1);
    if (!attachment) return new Response("Not found", { status: 404 });

    const object = await runtimeEnv().BUCKET.get(attachment.objectKey);
    if (!object) return new Response("Not found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=31536000, immutable");
    headers.set("content-disposition", `inline; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`);
    return new Response(object.body, { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
