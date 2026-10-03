import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dayjs from "dayjs";
import {
  members,
  moments,
  INVITE_CODES,
  buildMemories,
  type Moment,
  type Member,
} from "./data.js";

const app = express();
const port = process.env.PORT || 9091;

// ---------- 上传目录 ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = (file.originalname.match(/\.([a-zA-Z0-9]+)$/) || [])[1] || "bin";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 80 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(UPLOAD_DIR));

// ---------- 工具 ----------
const findMember = (id: number) => members.find((m) => m.id === Number(id));
const pubMoment = (m: Moment) => m;
const toPublicMember = (m: Member) => m;

// 支持的查询过滤
const filterMoments = (req: express.Request): Moment[] => {
  const { authorId, keyword, startDate, endDate } = req.query as Record<string, string>;
  let list = moments;
  if (authorId) list = list.filter((m) => m.authorId === Number(authorId));
  if (startDate) list = list.filter((m) => dayjs(m.capturedAt).isAfter(dayjs(startDate)));
  if (endDate) list = list.filter((m) => dayjs(m.capturedAt).isBefore(dayjs(endDate).add(1, 'day')));
  if (keyword) {
    const k = keyword.trim().toLowerCase();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(k) ||
        m.description.toLowerCase().includes(k) ||
        (findMember(m.authorId)?.name || '').toLowerCase().includes(k)
    );
  }
  return list.sort((a, b) => b.sortedAt.localeCompare(a.sortedAt));
};

// ---------- 健康检查 ----------
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// ---------- 成员 ----------
app.get("/api/v1/members", (_req, res) => {
  res.json({ members: members.map(toPublicMember) });
});

app.post("/api/v1/members", (req, res) => {
  const { name, inviteCode } = (req.body || {}) as { name?: string; inviteCode?: string };
  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: "请填写昵称" });
  }
  if (!INVITE_CODES.includes(String(inviteCode || '').trim().toUpperCase())) {
    return res.status(400).json({ message: "邀请码不正确" });
  }
  const member: Member = {
    id: members.length + 1,
    name: String(name).trim(),
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
    role: '成员',
  };
  members.push(member);
  res.status(201).json({ member: toPublicMember(member) });
});

// ---------- 时间线（分组） ----------
app.get("/api/v1/timeline", (_req, res) => {
  const sorted = [...moments].sort((a, b) => b.sortedAt.localeCompare(a.sortedAt));
  const groups: { key: string; label: string; momentLabel: string; items: Moment[] }[] = [];
  for (const m of sorted) {
    const d = dayjs(m.capturedAt);
    const key = d.format("YYYY-MM");
    const label = `${d.format("YYYY年M月")}`;
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, label, momentLabel: label, items: [] };
      groups.push(g);
    }
    g.items.push(m);
  }
  res.json({ groups });
});

// ---------- 时刻 / 瀑布流 ----------
app.get("/api/v1/moments", (req, res) => {
  const list = filterMoments(req);
  res.json({ moments: list.map(pubMoment) });
});

app.get("/api/v1/moments/memories", (_req, res) => {
  res.json({ memories: buildMemories() });
});

app.get("/api/v1/moments/:id", (req, res) => {
  const m = moments.find((x) => x.id === Number(req.params.id));
  if (!m) return res.status(404).json({ message: "内容不存在" });
  res.json({ moment: m });
});

// ---------- 上传 ----------
app.post("/api/v1/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "未接收到文件" });
  const url = `/uploads/${req.file.filename}`;
  const type = (req.file.mimetype || "").startsWith("video") ? "video" : "photo";
  res.status(201).json({ url, type });
});

// ---------- 创建时刻 ----------
app.post("/api/v1/moments", (req, res) => {
  const { authorId, title, description, type, mediaUrl, coverUrl, capturedAt } = (req.body ||
    {}) as Record<string, string>;
  if (!authorId || !mediaUrl) return res.status(400).json({ message: "缺少必要参数" });
  const m: Moment = {
    id: moments.length + 1,
    type: (type === "video" ? "video" : "photo") as Moment["type"],
    mediaUrl,
    coverUrl: coverUrl || mediaUrl,
    authorId: Number(authorId),
    title: title || "新的分享",
    description: description || "",
    capturedAt: capturedAt || new Date().toISOString(),
    sortedAt: capturedAt || new Date().toISOString(),
    likes: [],
    favorites: [],
    comments: [],
  };
  moments.unshift(m);
  res.status(201).json({ moment: m });
});

// ---------- 点赞 / 收藏 ----------
app.post("/api/v1/moments/:id/like", (req, res) => {
  const m = moments.find((x) => x.id === Number(req.params.id));
  if (!m) return res.status(404).json({ message: "内容不存在" });
  const memberId = Number((req.body || {}).memberId);
  const liked = Boolean((req.body || {}).liked);
  if (liked) {
    if (!m.likes.includes(memberId)) m.likes.push(memberId);
  } else {
    m.likes = m.likes.filter((x) => x !== memberId);
  }
  res.json({ moment: m });
});

app.post("/api/v1/moments/:id/favorite", (req, res) => {
  const m = moments.find((x) => x.id === Number(req.params.id));
  if (!m) return res.status(404).json({ message: "内容不存在" });
  const memberId = Number((req.body || {}).memberId);
  const fav = Boolean((req.body || {}).favorite);
  if (fav) {
    if (!m.favorites.includes(memberId)) m.favorites.push(memberId);
  } else {
    m.favorites = m.favorites.filter((x) => x !== memberId);
  }
  res.json({ moment: m });
});

// ---------- 评论 ----------
app.post("/api/v1/moments/:id/comments", (req, res) => {
  const m = moments.find((x) => x.id === Number(req.params.id));
  if (!m) return res.status(404).json({ message: "内容不存在" });
  const { memberName, avatarUrl } = (req.body || {}) as Record<string, string>;
  const text = String((req.body || {}).text || "").trim();
  if (!text) return res.status(400).json({ message: "评论内容不能为空" });
  const c = {
    id: Date.now(),
    memberName: memberName || "家人",
    avatarUrl: avatarUrl || "",
    text,
    createdAt: new Date().toISOString(),
  };
  m.comments.push(c);
  res.status(201).json({ comment: c });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});