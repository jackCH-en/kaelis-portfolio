"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatJournalDate, starterJournalEntries, type JournalEntry } from "./journal-data";
import styles from "./now.module.css";

type JournalResponse = {
  entries?: JournalEntry[];
};

export default function NowJournal() {
  const [remoteEntries, setRemoteEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/now/entries", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() as Promise<JournalResponse> : null))
      .then((payload) => {
        if (payload?.entries) setRemoteEntries(payload.entries);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const entries = useMemo(
    () => [...remoteEntries, ...starterJournalEntries].sort((a, b) => b.date.localeCompare(a.date)),
    [remoteEntries],
  );

  const dates = useMemo(() => Array.from(new Set(entries.map((entry) => entry.date))), [entries]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">KAELIS</Link>
        <div className={styles.headerMeta}>
          <span>WORKING JOURNAL</span>
          <a href="/now/manage">更新记录</a>
          <Link href="/">返回主页 ↙</Link>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="now-title">
        <p><span>NOW</span> / CURRENT PRACTICE</p>
        <h1 id="now-title"><span>正在做的</span><em>事。</em></h1>
        <div className={styles.heroCopy}>
          <p>不是进度汇报。</p>
          <p>这里留下尚未定型的判断、试验和途中看见的东西。</p>
        </div>
        <span className={styles.heroNumber} aria-hidden="true">01—{String(entries.length).padStart(2, "0")}</span>
      </section>

      <div className={styles.journalLayout}>
        <aside className={styles.dateIndex} aria-label="日期归档">
          <p>DATE INDEX</p>
          <nav>
            {dates.map((date, index) => (
              <a href={`#date-${date}`} key={date}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {formatJournalDate(date)}
              </a>
            ))}
          </nav>
        </aside>

        <div className={styles.entries}>
          {dates.map((date) => (
            <section className={styles.dateGroup} id={`date-${date}`} aria-labelledby={`date-title-${date}`} key={date}>
              <div className={styles.dateHeading}>
                <span>{date.slice(0, 4)}</span>
                <h2 id={`date-title-${date}`}>{formatJournalDate(date).slice(5)}</h2>
              </div>

              {entries.filter((entry) => entry.date === date).map((entry) => (
                <article className={styles.entry} id={`entry-${entry.id}`} key={entry.id}>
                  <div className={styles.entryMeta}>
                    <span>{entry.category}</span>
                    <small>{formatJournalDate(entry.date)}</small>
                  </div>
                  <h3>{entry.title}</h3>
                  <p>{entry.content}</p>

                  {entry.attachments.length > 0 && (
                    <div className={`${styles.attachments} ${entry.attachments.length === 1 ? styles.singleAttachment : ""}`} aria-label={`${entry.title}的照片附件`}>
                      {entry.attachments.map((attachment, index) => (
                        <figure key={attachment.id}>
                          <img src={attachment.url} alt={attachment.alt || `${entry.title}附件 ${index + 1}`} loading="lazy" />
                          <figcaption>ATTACHMENT / {String(index + 1).padStart(2, "0")}</figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </section>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <div><strong>© 2026 KAELIS</strong><span>ALL RIGHTS RESERVED.</span></div>
        <a href="mailto:chenguobin2228@163.com"><small>EMAIL</small>chenguobin2228@163.com</a>
        <span><small>WECHAT</small>KaelisChen</span>
        <a href="#now-title">TOP ↑</a>
      </footer>
    </main>
  );
}
