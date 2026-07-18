"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../now.module.css";

export default function NowManager({ displayName }: { displayName: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  async function submit(formData: FormData) {
    setStatus("saving");
    setMessage("");
    const response = await fetch("/api/now/entries", { method: "POST", body: formData });
    const payload = await response.json().catch(() => ({})) as { error?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "保存失败，请稍后重试。");
      return;
    }

    setStatus("saved");
    setMessage("记录已发布。正在返回日志页……");
    window.setTimeout(() => { window.location.href = "/now"; }, 900);
  }

  return (
    <section className={styles.manager}>
      <div className={styles.managerIntro}>
        <p>JOURNAL EDITOR / OWNER</p>
        <h1>留下今天<br /><em>正在发生的事。</em></h1>
        <span>你好，{displayName}。文字会按日期归档，照片将作为这条记录的附件公开展示。</span>
      </div>

      <form className={styles.managerForm} action={submit}>
        <label>
          <span>日期 / DATE</span>
          <input type="date" name="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </label>

        <label>
          <span>分类 / CATEGORY</span>
          <select name="category" defaultValue="CURRENT PRACTICE">
            <option value="CURRENT PRACTICE">正在进行</option>
            <option value="COMMERCIAL PHOTOGRAPHY">商业摄影</option>
            <option value="BRAND FILM">品牌影像</option>
            <option value="AI VISUAL">AI 视觉</option>
            <option value="WEB / INTERACTION">网页 / 交互</option>
          </select>
        </label>

        <label className={styles.fullField}>
          <span>标题 / TITLE</span>
          <input type="text" name="title" maxLength={120} required placeholder="今天正在解决什么？" />
        </label>

        <label className={styles.fullField}>
          <span>记录 / NOTE</span>
          <textarea name="content" maxLength={5000} required rows={8} placeholder="写下判断、变化、没有完成的部分……" />
        </label>

        <label className={`${styles.fullField} ${styles.uploadField}`}>
          <span>照片附件 / 最多 6 张，单张不超过 8MB</span>
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple
            onChange={(event) => setFiles(Array.from(event.currentTarget.files ?? []).slice(0, 6))}
          />
          <b>{files.length ? `已选择 ${files.length} 张照片` : "选择照片 +"}</b>
        </label>

        {previews.length > 0 && (
          <div className={`${styles.fullField} ${styles.uploadPreviews}`} aria-label="待上传照片预览">
            {previews.map((url, index) => <img src={url} alt={`待上传照片 ${index + 1}`} key={url} />)}
          </div>
        )}

        <div className={`${styles.fullField} ${styles.submitRow}`}>
          <p className={status === "error" ? styles.errorMessage : ""} aria-live="polite">{message}</p>
          <button type="submit" disabled={status === "saving" || status === "saved"}>
            {status === "saving" ? "正在保存……" : status === "saved" ? "已发布 ✓" : "发布这条记录 →"}
          </button>
        </div>
      </form>
    </section>
  );
}
