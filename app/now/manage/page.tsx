import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../../chatgpt-auth";
import { isOwnerEmail } from "../../owner-auth";
import Link from "next/link";
import styles from "../now.module.css";
import NowManager from "./now-manager";

export const dynamic = "force-dynamic";

export default async function ManageNowPage() {
  const user = await getChatGPTUser();
  const isOwner = user ? await isOwnerEmail(user.email) : false;

  return (
    <main className={styles.managePage}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">KAELIS</Link>
        <div className={styles.headerMeta}>
          <span>JOURNAL EDITOR</span>
          <a href="/now">查看工作日志 ↙</a>
        </div>
      </header>

      {!user && (
        <section className={styles.accessPanel}>
          <p>OWNER ACCESS</p>
          <h1>更新工作日志</h1>
          <span>登录后可新增文字记录，并上传照片附件。</span>
          <a href={chatGPTSignInPath("/now/manage")}>使用 ChatGPT 登录 →</a>
        </section>
      )}

      {user && !isOwner && (
        <section className={styles.accessPanel}>
          <p>PRIVATE EDITOR</p>
          <h1>仅站点本人可更新</h1>
          <span>当前账户没有这本日志的编辑权限。</span>
          <a href={chatGPTSignOutPath("/now")}>退出并返回 →</a>
        </section>
      )}

      {user && isOwner && <NowManager displayName={user.displayName} />}
    </main>
  );
}
