import { desc, eq, inArray } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { isOwnerEmail } from "../../../owner-auth";
import { getDb } from "../../../../db";
import { nowAttachments, nowEntries } from "../../../../db/schema";

const MAX_FILES = 6;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

function runtimeEnv() {
  return env as typeof env & { BUCKET: R2Bucket; OWNER_EMAIL?: string };
}

function isMissingSchema(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("no such table") || message.includes("now_entries");
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(nowEntries).orderBy(desc(nowEntries.date), desc(nowEntries.id)).limit(60);
    if (rows.length === 0) return Response.json({ entries: [] });

    const attachments = await db
      .select()
      .from(nowAttachments)
      .where(inArray(nowAttachments.entryId, rows.map((entry) => entry.id)))
      .orderBy(nowAttachments.entryId, nowAttachments.id);

    return Response.json({
      entries: rows.map((entry) => ({
        id: `remote-${entry.id}`,
        date: entry.date,
        category: entry.category,
        title: entry.title,
        content: entry.content,
        attachments: attachments
          .filter((attachment) => attachment.entryId === entry.id)
          .map((attachment) => ({
            id: `attachment-${attachment.id}`,
            url: `/api/now/media?id=${attachment.id}`,
            alt: attachment.fileName,
          })),
      })),
    });
  } catch (error) {
    if (isMissingSchema(error)) return Response.json({ entries: [] });
    return Response.json({ error: "日志暂时无法读取。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录。" }, { status: 401 });

  if (!(await isOwnerEmail(user.email))) {
    return Response.json({ error: "没有更新权限。" }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const date = String(form.get("date") ?? "").trim();
    const category = String(form.get("category") ?? "CURRENT PRACTICE").trim().slice(0, 50);
    const title = String(form.get("title") ?? "").trim().slice(0, 120);
    const content = String(form.get("content") ?? "").trim().slice(0, 5000);
    const files = form.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "请选择有效日期。" }, { status: 400 });
    if (!title) return Response.json({ error: "请填写标题。" }, { status: 400 });
    if (!content) return Response.json({ error: "请填写记录内容。" }, { status: 400 });
    if (files.length > MAX_FILES) return Response.json({ error: `最多上传 ${MAX_FILES} 张照片。` }, { status: 400 });

    for (const file of files) {
      if (!file.type.startsWith("image/")) return Response.json({ error: "附件只能是图片。" }, { status: 400 });
      if (file.size > MAX_FILE_BYTES) return Response.json({ error: "单张照片不能超过 8MB。" }, { status: 400 });
    }

    const db = getDb();
    const [created] = await db.insert(nowEntries).values({ date, category, title, content }).returning({ id: nowEntries.id });
    const uploadedKeys: string[] = [];

    try {
      for (const file of files) {
        const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
        const objectKey = `now/${created.id}/${crypto.randomUUID()}.${extension || "jpg"}`;
        await runtimeEnv().BUCKET.put(objectKey, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type },
          customMetadata: { fileName: file.name, entryId: String(created.id) },
        });
        uploadedKeys.push(objectKey);
        await db.insert(nowAttachments).values({
          entryId: created.id,
          objectKey,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        });
      }
    } catch (error) {
      await Promise.all(uploadedKeys.map((key) => runtimeEnv().BUCKET.delete(key)));
      await db.delete(nowAttachments).where(eq(nowAttachments.entryId, created.id));
      await db.delete(nowEntries).where(eq(nowEntries.id, created.id));
      throw error;
    }

    return Response.json({ entryId: created.id }, { status: 201 });
  } catch (error) {
    if (isMissingSchema(error)) return Response.json({ error: "日志数据库尚未初始化。" }, { status: 503 });
    return Response.json({ error: "保存失败，请稍后重试。" }, { status: 500 });
  }
}
