"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "@/lib/motion";
import { Eye, Star, Clock, BookOpen, Mic, FileText, Share2, Bookmark, Flag } from "lucide-react";
import { Card, Badge, Avatar, Button, Modal } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatNumber, formatTimeAgo, estimateReadTime } from "@/lib/utils";
import { MOOD_BY_KEY } from "@/lib/moods";
import type { Post } from "@/types";

const typeConfig = {
  poem: { label: "Poem", icon: Mic, color: "primary" as const },
  story: { label: "Story", icon: BookOpen, color: "accent" as const },
  micro_tale: { label: "Micro Tale", icon: FileText, color: "success" as const },
};

function PostCardComponent({
  post,
  onBookmarkChange,
}: {
  post: Post;
  onBookmarkChange?: (bookmarked: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [bookmarkState, setBookmarkState] = useState({
    postId: post.id,
    value: Boolean(post.isBookmarked),
  });
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const config = typeConfig[post.type] || typeConfig.poem;
  // Use server-computed readTime if available, fall back to client-side estimate
  const readTime = post.readTime || estimateReadTime(post.content);
  // Use server-computed preview (content is already plain text from API)
  const preview = post.content;
  const bookmarked = bookmarkState.postId === post.id ? bookmarkState.value : Boolean(post.isBookmarked);

  async function sharePost(event: React.MouseEvent) {
    event.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Post link copied", "success");
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      toast("Failed to share post", "error");
    }
  }

  function openReport(event: React.MouseEvent) {
    event.stopPropagation();
    setReportReason("spam");
    setReportDetails("");
    setReportOpen(true);
  }

  async function submitReport() {
    setReportSubmitting(true);
    try {
      await api.post(`/posts/${post.id}/report`, {
        reason: reportReason,
        details: reportDetails.slice(0, 500) || undefined,
      });
      toast("Report submitted. Thank you.", "success");
      setReportOpen(false);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to submit report", "error");
    } finally {
      setReportSubmitting(false);
    }
  }

  async function toggleBookmark(event: React.MouseEvent) {
    event.stopPropagation();

    try {
      if (bookmarked) {
        await api.delete(`/posts/${post.id}/bookmark`);
        setBookmarkState({ postId: post.id, value: false });
        onBookmarkChange?.(false);
        toast("Removed from saved posts", "info");
      } else {
        await api.post(`/posts/${post.id}/bookmark`);
        setBookmarkState({ postId: post.id, value: true });
        onBookmarkChange?.(true);
        toast("Saved to your profile", "success");
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update bookmark", "error");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
    <Card
      className="group cursor-pointer h-full"
      glow
      onClick={() => router.push(`/post/${post.id}`)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/profile/${post.authorId}`}
          onClick={(event) => event.stopPropagation()}
          className="flex items-center gap-3 rounded-lg -m-1 p-1 hover:bg-primary-ghost transition-colors"
        >
          <Avatar name={post.authorName} src={post.authorPic} size="sm" />
          <div>
            <p className="text-sm font-medium text-text-primary hover:text-primary-light transition-colors">
              {post.authorName}
            </p>
            <p className="text-xs text-text-muted">{formatTimeAgo(new Date(post.publishedAt || post.createdAt))}</p>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <Badge variant={config.color}>
            <config.icon size={12} />
            {config.label}
          </Badge>
          {post.mood && MOOD_BY_KEY[post.mood] && (
            <Badge variant="default">
              <span>{MOOD_BY_KEY[post.mood].emoji}</span>
              {MOOD_BY_KEY[post.mood].label}
            </Badge>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary-light transition-colors line-clamp-2">
        {post.title}
      </h3>

      {/* Preview */}
      <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-3 font-serif">
        {preview}
      </p>

      {/* Footer Stats */}
      <div className="flex items-center justify-between gap-3 text-xs text-text-muted pt-3 border-t border-border">
        <div className="flex items-center gap-4 min-w-0 flex-wrap">
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {formatNumber(post.views)}
          </span>
          {post.avgRating && (
            <span className="flex items-center gap-1">
              <Star size={14} className="text-warning" />
              {post.avgRating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {readTime} min read
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={sharePost} title="Share">
            <Share2 size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleBookmark} title="Save post">
            <Bookmark size={14} className={bookmarked ? "fill-current text-primary-light" : ""} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openReport} title="Report post">
            <Flag size={14} />
          </Button>
        </div>
      </div>
    </Card>
    <Modal
      open={reportOpen}
      onClose={() => setReportOpen(false)}
      title="Report this post"
      description="Tell us what's wrong. A moderator will review it."
      size="sm"
    >
      <div onClick={(e) => e.stopPropagation()} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-2">Reason</label>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg-tertiary/50 px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="spam">Spam</option>
            <option value="harassment">Harassment or bullying</option>
            <option value="hate">Hate speech</option>
            <option value="sexual">Sexual or explicit content</option>
            <option value="violence">Violence or self-harm</option>
            <option value="copyright">Copyright infringement</option>
            <option value="misinformation">Misinformation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-2">Details (optional)</label>
          <textarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            maxLength={500}
            placeholder="Add any context that helps the moderator..."
            className="w-full min-h-[80px] rounded-xl border border-border bg-bg-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={submitReport} loading={reportSubmitting}>Submit report</Button>
        </div>
      </div>
    </Modal>
    </motion.div>
  );
}

export const PostCard = memo(PostCardComponent);
PostCard.displayName = "PostCard";
