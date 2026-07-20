"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowBigDown,
  ArrowBigUp,
  Copy,
  Flag,
  MessageSquare,
  Minus,
  MoreHorizontal,
  Plus,
  Share2,
} from "lucide-react";
import type { ForumAnswer } from "@/lib/forum";
import type { ReportReasonKey } from "@/lib/forumReportReasons";
import { createReportAction, setVoteAction } from "@/lib/actions/forum";
import ReportContentDialog from "./ReportContentDialog";
import FormattedContent from "./FormattedContent";
import ForumAuthorAvatar from "./ForumAuthorAvatar";
import AnswerComposer from "./AnswerComposer";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatRelativeTimeLabel } from "@/lib/i18n/locales";

function CommentNode({
  answer,
  questionId,
  userInitials,
  currentUserId,
  collapsed,
  onToggleCollapse,
}: {
  answer: ForumAnswer;
  questionId: string;
  userInitials: string;
  currentUserId: string;
  collapsed: Set<string>;
  onToggleCollapse: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [replyOpen, setReplyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState("");
  const router = useRouter();
  const { locale, dictionary } = useLocale();
  const f = dictionary.forum;
  const isCollapsed = collapsed.has(answer.answer_id);
  const hasChildren = answer.children.length > 0;
  const isOwnComment = answer.author.id === currentUserId;

  function vote(next: -1 | 1) {
    const value: -1 | 0 | 1 = answer.myVote === next ? 0 : next;
    startTransition(async () => {
      await setVoteAction(answer.answer_id, questionId, value);
      router.refresh();
    });
  }

  async function copyLink() {
    const url = `${window.location.origin}/dashboard/forum/${questionId}#comment-${answer.answer_id}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast(f.linkCopied);
      setMenuOpen(false);
      window.setTimeout(() => setToast(""), 2000);
    } catch {
      /* ignore */
    }
  }

  function submitReport(payload: { reasonKey: ReportReasonKey; details: string }) {
    startTransition(async () => {
      const result = await createReportAction({
        answerId: answer.answer_id,
        questionId,
        reasonKey: payload.reasonKey,
        details: payload.details,
      });
      setMenuOpen(false);
      if (result?.error) {
        setToast(result.error === "You already reported this content." ? f.reportAlready : f.reportFailed);
      } else {
        setReportOpen(false);
        setToast(f.reportThanks);
      }
      window.setTimeout(() => setToast(""), 2500);
    });
  }

  return (
    <div id={`comment-${answer.answer_id}`} className="relative scroll-mt-24">
      <div className="flex gap-2">
        <div className="flex w-8 shrink-0 flex-col items-center">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleCollapse(answer.answer_id)}
              className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
              aria-label={isCollapsed ? f.expandThread : f.collapseThread}
            >
              {isCollapsed ? <Plus size={12} /> : <Minus size={12} />}
            </button>
          ) : (
            <span className="mt-1 h-5 w-5" aria-hidden />
          )}
          {!isCollapsed && hasChildren ? (
            <button
              type="button"
              aria-hidden
              onClick={() => onToggleCollapse(answer.answer_id)}
              className="mt-1 w-0.5 flex-1 cursor-pointer rounded-full bg-slate-200 hover:bg-slate-400"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 pb-3">
          <div className="flex items-start gap-2.5">
            <ForumAuthorAvatar
              name={answer.author.fullname}
              avatarUrl={answer.author.avatar_url}
              className="h-7 w-7"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                <span
                  className="font-bold"
                  style={{ color: answer.isOp ? "var(--sb-teal-dark)" : "var(--sb-ink)" }}
                >
                  {answer.author.fullname}
                </span>
                {answer.isOp ? (
                  <span className="rounded bg-[color-mix(in_srgb,var(--sb-teal)_18%,white)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[color:var(--sb-teal-dark)]">
                    {f.opBadge}
                  </span>
                ) : null}
                {answer.isTopAnswer && answer.depth === 0 ? (
                  <span className="text-[11px] font-semibold italic" style={{ color: "var(--sb-tint-amber-ink)" }}>
                    {f.topComment}
                  </span>
                ) : null}
                <span style={{ color: "var(--sb-muted)" }}>
                  · {formatRelativeTimeLabel(answer.created_at, dictionary.common, locale)}
                </span>
              </div>

              {isCollapsed ? (
                <p className="mt-1 text-xs" style={{ color: "var(--sb-muted)" }}>
                  {f.expandThread}
                </p>
              ) : (
                <>
                  {answer.content ? (
                    <FormattedContent text={answer.content} className="mt-1 space-y-1 text-sm" />
                  ) : null}
                  {answer.image_url ? (
                    <div className="mt-2 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={answer.image_url} alt="" className="max-h-80 w-full object-contain" />
                    </div>
                  ) : null}

                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <div className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => vote(1)}
                        disabled={isPending}
                        className="rounded-full p-1 disabled:opacity-50"
                        style={{ color: answer.myVote === 1 ? "var(--sb-emerald)" : "var(--sb-muted)" }}
                        aria-label="Upvote"
                      >
                        <ArrowBigUp size={18} fill={answer.myVote === 1 ? "currentColor" : "none"} />
                      </button>
                      <span
                        className="min-w-[1.25rem] text-center text-xs font-bold"
                        style={{ color: "var(--sb-ink)" }}
                      >
                        {answer.score}
                      </span>
                      <button
                        type="button"
                        onClick={() => vote(-1)}
                        disabled={isPending}
                        className="rounded-full p-1 disabled:opacity-50"
                        style={{ color: answer.myVote === -1 ? "#dc2626" : "var(--sb-muted)" }}
                        aria-label="Downvote"
                      >
                        <ArrowBigDown size={18} fill={answer.myVote === -1 ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReplyOpen((v) => !v)}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition hover:bg-slate-100"
                      style={{ color: "var(--sb-muted)" }}
                    >
                      <MessageSquare size={14} />
                      {f.replyAction}
                    </button>

                    <button
                      type="button"
                      onClick={copyLink}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition hover:bg-slate-100"
                      style={{ color: "var(--sb-muted)" }}
                    >
                      <Share2 size={14} />
                      {f.shareAction}
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        className="rounded-full p-1.5 transition hover:bg-slate-100"
                        style={{ color: "var(--sb-muted)" }}
                        aria-label={f.moreActions}
                        aria-expanded={menuOpen}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {menuOpen ? (
                        <>
                          <button
                            type="button"
                            className="fixed inset-0 z-10 cursor-default"
                            aria-label="Close menu"
                            onClick={() => setMenuOpen(false)}
                          />
                          <div
                            className="absolute left-0 z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl bg-white py-1"
                            style={{ boxShadow: "var(--sb-shadow-lg)" }}
                          >
                            <button
                              type="button"
                              onClick={copyLink}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-slate-50"
                              style={{ color: "var(--sb-ink)" }}
                            >
                              <Copy size={14} />
                              {f.copyLink}
                            </button>
                            {!isOwnComment ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuOpen(false);
                                  setReportOpen(true);
                                }}
                                disabled={isPending}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                                style={{ color: "var(--sb-ink)" }}
                              >
                                <Flag size={14} />
                                {f.reportAction}
                              </button>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {toast ? (
                    <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--sb-teal-dark)" }}>
                      {toast}
                    </p>
                  ) : null}

                  {replyOpen ? (
                    <div className="mt-3">
                      <AnswerComposer
                        questionId={questionId}
                        userInitials={userInitials}
                        parentAnswerId={answer.answer_id}
                        compact
                        defaultExpanded
                        onCancel={() => setReplyOpen(false)}
                        onPosted={() => setReplyOpen(false)}
                      />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {!isCollapsed && hasChildren ? (
            <div className="mt-1 space-y-0">
              {answer.children.map((child) => (
                <CommentNode
                  key={child.answer_id}
                  answer={child}
                  questionId={questionId}
                  userInitials={userInitials}
                  currentUserId={currentUserId}
                  collapsed={collapsed}
                  onToggleCollapse={onToggleCollapse}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <ReportContentDialog
        open={reportOpen}
        busy={isPending}
        onClose={() => setReportOpen(false)}
        onSubmit={submitReport}
      />
    </div>
  );
}

export default function CommentThread({
  roots,
  questionId,
  userInitials,
  currentUserId,
}: {
  roots: ForumAnswer[];
  questionId: string;
  userInitials: string;
  currentUserId: string;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const { dictionary } = useLocale();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#comment-")) return;
    const el = document.getElementById(hash.slice(1));
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [roots]);

  function onToggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (roots.length === 0) {
    return (
      <p className="py-6 text-center text-sm" style={{ color: "var(--sb-muted)" }}>
        {dictionary.forum.noCommentsYet}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {roots.map((answer) => (
        <CommentNode
          key={answer.answer_id}
          answer={answer}
          questionId={questionId}
          userInitials={userInitials}
          currentUserId={currentUserId}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      ))}
    </div>
  );
}
