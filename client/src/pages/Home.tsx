/*
 * Quiet Editorial Campus — page-level implementation.
 * Use the dashboard as a calm study surface: ink navy for authority, warm ivory
 * for breathing room, saffron only for the current moment, and forest green for readiness.
 */

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  AlarmClock,
  ArrowDownRight,
  ExternalLink,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Clock,
  FileText,
  Link2,
  MapPin,
  Notebook,
  Trash2,
  Sparkles,
  Sun,
  Moon,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ExamEntry = {
  id: string;
  kind: "exam" | "no-exam";
  day: string;
  shortDate: string;
  course?: string;
  name?: string;
  room?: string;
  start?: Date;
  end?: Date;
};

const EXAM_TIME = "9:30 a.m. – 12:30 p.m.";
const DHAKA_TIME_ZONE = "Asia/Dhaka";
const DAY = 24 * 60 * 60 * 1000;

const EXAMS: ExamEntry[] = [
  {
    id: "ipe-4607",
    kind: "exam",
    day: "Friday",
    shortDate: "28 Aug",
    course: "IPE 4607",
    name: "Control Engineering and Industrial Automation",
    room: "3rd AcB 104, 105, 108 · 2nd AcB 201, 202, 304",
    start: new Date("2026-08-28T03:30:00.000Z"),
    end: new Date("2026-08-28T06:30:00.000Z"),
  },
  {
    id: "ipe-4603",
    kind: "exam",
    day: "Monday",
    shortDate: "31 Aug",
    course: "IPE 4603",
    name: "Manufacturing Planning and Control",
    room: "3rd AcB 104, 105, 108 · 2nd AcB 201, 202, 304",
    start: new Date("2026-08-31T03:30:00.000Z"),
    end: new Date("2026-08-31T06:30:00.000Z"),
  },
  {
    id: "ipe-4605",
    kind: "exam",
    day: "Wednesday",
    shortDate: "02 Sep",
    course: "IPE 4605",
    name: "Quality Control and Management",
    room: "3rd AcB 104, 105, 108 · 2nd AcB 201, 202, 304",
    start: new Date("2026-09-02T03:30:00.000Z"),
    end: new Date("2026-09-02T06:30:00.000Z"),
  },
  {
    id: "no-exam-04-sep",
    kind: "no-exam",
    day: "Friday",
    shortDate: "04 Sep",
  },
  {
    id: "ipe-4609",
    kind: "exam",
    day: "Monday",
    shortDate: "07 Sep",
    course: "IPE 4609",
    name: "Product Design I",
    room: "3rd AcB 104, 105, 108 · 2nd AcB 201, 202, 304",
    start: new Date("2026-09-07T03:30:00.000Z"),
    end: new Date("2026-09-07T06:30:00.000Z"),
  },
  {
    id: "ipe-4611",
    kind: "exam",
    day: "Thursday",
    shortDate: "10 Sep",
    course: "IPE 4611",
    name: "Operations Research",
    room: "3rd AcB 104, 105, 108 · 2nd AcB 201, 202, 304",
    start: new Date("2026-09-10T03:30:00.000Z"),
    end: new Date("2026-09-10T06:30:00.000Z"),
  },
];

const LIVE_EXAMS = EXAMS.filter((entry): entry is ExamEntry & { kind: "exam"; start: Date; end: Date } => entry.kind === "exam");

function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DHAKA_TIME_ZONE,
    ...options,
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: DHAKA_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(" ", "");
}

function getNextExam(now: number) {
  return LIVE_EXAMS.find((exam) => exam.end.getTime() > now) ?? null;
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read file."));
        return;
      }
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-unit">
      <span className="countdown-number" aria-label={`${value} ${label}`}>
        {String(value).padStart(2, "0")}
      </span>
      <span className="countdown-label">{label}</span>
    </div>
  );
}

function DateTab({ date }: { date: Date }) {
  return (
    <div className="date-tab" aria-label={formatDate(date, { dateStyle: "long" })}>
      <span>{formatDate(date, { day: "2-digit" })}</span>
      <small>{formatDate(date, { month: "short" }).toUpperCase()}</small>
    </div>
  );
}

function ScheduleRow({
  entry,
  isNext,
  isSelected,
  isPast,
  onSelect,
}: {
  entry: ExamEntry;
  isNext: boolean;
  isSelected: boolean;
  isPast: boolean;
  onSelect: () => void;
}) {
  if (entry.kind === "no-exam") {
    return (
      <div className="schedule-row no-exam-row">
        <div className="timeline-stem" aria-hidden="true" />
        <div className="timeline-dot empty-dot" aria-hidden="true" />
        <div className="schedule-date muted-date">
          <span>{entry.day}</span>
          <strong>{entry.shortDate}</strong>
        </div>
        <div className="schedule-main">
          <div className="schedule-course-line">
            <span className="course-code no-exam-code">— No exam</span>
            <span className="no-exam-note">Rest / revise</span>
          </div>
          <p>A clear day in the routine. Keep it open for recovery or revision.</p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn("schedule-row exam-row", isSelected && "selected-row", isPast && "past-row")}
      onClick={onSelect}
      aria-pressed={isSelected}
    >
      <div className="timeline-stem" aria-hidden="true" />
      <div className={cn("timeline-dot", isNext && "next-dot")} aria-hidden="true">
        {isPast ? <Check size={13} strokeWidth={3} /> : null}
      </div>
      <div className="schedule-date">
        <span>{entry.day}</span>
        <strong>{entry.shortDate}</strong>
      </div>
      <div className="schedule-main">
        <div className="schedule-course-line">
          <span className="course-code">{entry.course}</span>
          {isNext ? <span className="next-badge">Next</span> : null}
          {isSelected && !isNext ? <span className="selected-badge">Viewing</span> : null}
        </div>
        <p className="course-name">{entry.name}</p>
        <p className="schedule-time">
          <Clock size={14} aria-hidden="true" />
          {EXAM_TIME}
        </p>
        <p className="schedule-room">
          <MapPin size={14} aria-hidden="true" />
          {entry.room}
        </p>
      </div>
      <ChevronRight className="schedule-arrow" size={18} aria-hidden="true" />
    </button>
  );
}

export default function Home() {
  const [now, setNow] = useState(() => Date.now());
  const [trackingMode, setTrackingMode] = useState<"next" | string>("next");
  const [privateLinkTitle, setPrivateLinkTitle] = useState("");
  const [privateLinkUrl, setPrivateLinkUrl] = useState("");
  const [officialLinkTitle, setOfficialLinkTitle] = useState("");
  const [officialLinkUrl, setOfficialLinkUrl] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const materialsQuery = trpc.materials.list.useQuery(undefined, { enabled: isAuthenticated });
  const sharedMaterialsQuery = trpc.materials.shared.useQuery();
  const trpcUtils = trpc.useUtils();
  const uploadMaterial = trpc.materials.upload.useMutation({
    onSuccess: async () => {
      await Promise.all([
        trpcUtils.materials.list.invalidate(),
        trpcUtils.materials.shared.invalidate(),
      ]);
      toast.success("Study material saved.");
    },
    onError: (error) => toast.error(error.message || "Upload failed."),
  });
  const removeMaterial = trpc.materials.remove.useMutation({
    onSuccess: async () => {
      await trpcUtils.materials.list.invalidate();
      toast.success("Study material removed.");
    },
    onError: (error) => toast.error(error.message || "Could not remove this file."),
  });
  const addLink = trpc.materials.addLink.useMutation({
    onSuccess: async () => {
      await Promise.all([
        trpcUtils.materials.list.invalidate(),
        trpcUtils.materials.shared.invalidate(),
      ]);
      toast.success("Resource link saved.");
    },
    onError: (error) => toast.error(error.message || "Could not save this link."),
  });
  const removeSharedMaterial = trpc.materials.removeShared.useMutation({
    onSuccess: async () => {
      await trpcUtils.materials.shared.invalidate();
      toast.success("Official material removed.");
    },
    onError: (error) => toast.error(error.message || "Could not remove this official material."),
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const nextExam = useMemo(() => getNextExam(now), [now]);
  const selectedExam = trackingMode === "next" ? nextExam : LIVE_EXAMS.find((exam) => exam.id === trackingMode) ?? nextExam;
  const displayExam = selectedExam ?? LIVE_EXAMS[LIVE_EXAMS.length - 1];
  const isNext = Boolean(nextExam && displayExam.id === nextExam.id);
  const isActive = now >= displayExam.start.getTime() && now < displayExam.end.getTime();
  const isPast = now >= displayExam.end.getTime();
  const rawDifference = Math.max(0, displayExam.start.getTime() - now);
  const days = Math.floor(rawDifference / DAY);
  const hours = Math.floor((rawDifference % DAY) / (60 * 60 * 1000));
  const minutes = Math.floor((rawDifference % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((rawDifference % (60 * 1000)) / 1000);
  const currentDate = formatDate(new Date(now), { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const currentTime = formatTime(new Date(now));

  const getStatusLabel = () => {
    if (isActive) return "The paper is in progress";
    if (isPast) return "This paper has finished";
    return isNext ? "Next paper" : "Selected paper";
  };

  const handleAddLink = async (event: React.FormEvent<HTMLFormElement>, visibility: "private" | "shared") => {
    event.preventDefault();
    const title = visibility === "private" ? privateLinkTitle : officialLinkTitle;
    const url = visibility === "private" ? privateLinkUrl : officialLinkUrl;
    if (!title.trim() || !url.trim()) return;
    await addLink.mutateAsync({ title, url, visibility }).then(() => {
      if (visibility === "private") {
        setPrivateLinkTitle("");
        setPrivateLinkUrl("");
      } else {
        setOfficialLinkTitle("");
        setOfficialLinkUrl("");
      }
    }).catch(() => undefined);
  };

  const handleMaterialUpload = async (event: React.ChangeEvent<HTMLInputElement>, visibility: "private" | "shared" = "private") => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    let dataBase64: string;
    try {
      dataBase64 = await readFileAsBase64(file);
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : "Could not read this file.");
      return;
    }

    try {
      await uploadMaterial.mutateAsync({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        dataBase64,
        visibility,
      });
    } catch {
      // The mutation's onError callback already shows the server error toast.
    }
  };

  return (
    <div className="app-shell">
      <header className="site-header container">
        <a className="brand-lockup" href="#top" aria-label="IUT Exam Countdown home">
          <img src="/manus-storage/iut-countdown-mark_c927a9d1.png" alt="" className="brand-mark" />
          <span className="brand-copy">
            <span className="brand-overline">IUT / 06</span>
            <span className="brand-name">Exam Countdown</span>
          </span>
        </a>
        <div className="header-actions">
          <div className="header-context">
            <span className="header-status-dot" aria-hidden="true" />
            <span>Summer semester · 6th semester</span>
            <span className="header-divider" aria-hidden="true" />
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => toggleTheme?.()}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            <span>{theme === "dark" ? "Light" : "Night"}</span>
          </button>
        </div>
      </header>

      <main id="top" className="container page-content">
        <section className="intro-strip" aria-label="Current date and exam group">
          <div>
            <span className="eyebrow"><Sun size={14} aria-hidden="true" /> Your study horizon</span>
            <p className="current-date">{currentDate}<span>·</span>{currentTime}</p>
          </div>
          <p className="group-note"><span>Group A</span> / Morning session / {EXAM_TIME}</p>
        </section>

        <section className="dashboard-grid" aria-label="Exam countdown dashboard">
          <article className="countdown-card">
            <img src="/manus-storage/iut-countdown-hero_89830984.jpg" alt="A quiet study desk with papers and a watch" className="countdown-art" />
            <div className="countdown-overlay" aria-hidden="true" />
            <div className="countdown-content">
              <div className="countdown-kicker">
                <span className="pulse-dot" aria-hidden="true" />
                <span>{getStatusLabel()}</span>
                <span className="countdown-kicker-rule" aria-hidden="true" />
                <span className="countdown-kicker-index">01 / 05</span>
              </div>
              <div className="countdown-heading-row">
                <div>
                  <p className="countdown-pretitle">{isActive ? "In the room now" : isPast ? "Routine marker" : "Make the gap count"}</p>
                  <h1>{isPast ? "The routine is complete." : <>Next up: <em>{displayExam.course}</em></>}</h1>
                  {!isPast && <p className="selected-course-name">{displayExam.name}</p>}
                </div>
                <ArrowDownRight className="heading-arrow" size={34} strokeWidth={1.4} aria-hidden="true" />
              </div>
              <div className="countdown-display" aria-live="polite">
                {isActive || isPast ? (
                  <div className="countdown-message">
                    <CircleCheck size={24} aria-hidden="true" />
                    <span>{isActive ? "Stay steady. You have this." : "You made it through this paper."}</span>
                  </div>
                ) : (
                  <>
                    <CountdownUnit value={days} label="days" />
                    <span className="countdown-separator">:</span>
                    <CountdownUnit value={hours} label="hours" />
                    <span className="countdown-separator">:</span>
                    <CountdownUnit value={minutes} label="minutes" />
                    <span className="countdown-separator">:</span>
                    <CountdownUnit value={seconds} label="seconds" />
                  </>
                )}
              </div>
              <div className="countdown-footer">
                <div className="countdown-date-detail">
                  <DateTab date={displayExam.start} />
                  <div>
                    <strong>{formatDate(displayExam.start, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</strong>
                    <span>{formatTime(displayExam.start)} – {formatTime(displayExam.end)} · Group A</span>
                  </div>
                </div>
                <div className="room-detail">
                  <span>Room allocation</span>
                  <strong>AcB buildings</strong>
                </div>
              </div>
            </div>
            <div className="countdown-corner-note">IUT · FINAL EXAMINATION ROUTINE · 2024–25</div>
          </article>

          <aside className="routine-card" id="routine">
            <div className="routine-header">
              <div>
                <span className="eyebrow dark-eyebrow"><CalendarDays size={14} aria-hidden="true" /> Full routine</span>
                <h2>Keep the whole run in view.</h2>
              </div>
              <span className="routine-count">05 papers</span>
            </div>
            <div className="schedule-list">
              {EXAMS.map((entry) => {
                const entryIsPast = entry.kind === "exam" && now >= entry.end!.getTime();
                const entryIsNext = entry.kind === "exam" && nextExam?.id === entry.id;
                const entryIsSelected = entry.kind === "exam" && displayExam.id === entry.id;
                return (
                  <ScheduleRow
                    key={entry.id}
                    entry={entry}
                    isPast={entryIsPast}
                    isNext={entryIsNext}
                    isSelected={entryIsSelected}
                    onSelect={() => entry.kind === "exam" && setTrackingMode(entry.id)}
                  />
                );
              })}
            </div>
            {trackingMode !== "next" ? (
              <Button className="back-to-next" variant="outline" onClick={() => setTrackingMode("next")}>
                <ArrowUpRight size={16} aria-hidden="true" />
                Back to next exam
              </Button>
            ) : null}
          </aside>
        </section>

        <section className="prep-section" aria-labelledby="prep-title">
          <div className="prep-copy">
            <span className="eyebrow"><Sparkles size={14} aria-hidden="true" /> A small nudge</span>
            <h2 id="prep-title">Make the gap count.</h2>
            <p>One clear next step is usually more useful than a long list. Use the time before {nextExam?.course ?? "your next paper"} to build a little momentum.</p>
            <div className="prep-actions">
              <Button className="primary-action" onClick={() => document.getElementById("routine")?.scrollIntoView({ behavior: "smooth" })}>
                <BookOpen size={17} aria-hidden="true" />
                Review the routine
              </Button>
              <span className="action-note"><Check size={14} aria-hidden="true" /> Built from your revised schedule</span>
            </div>
          </div>
          <div className="prep-visual">
            <img src="/manus-storage/iut-countdown-study_b93a403e.jpg" alt="Notebook, clock, index cards, and a warm cup on a study desk" />
            <div className="prep-stamp"><Notebook size={17} aria-hidden="true" /><span>Focus<br />one paper</span></div>
          </div>
          <div className="prep-list">
            <div><span>01</span><p>Review your {nextExam?.course ?? "next course"} notes.</p></div>
            <div><span>02</span><p>Plan one focused three-hour block.</p></div>
            <div><span>03</span><p>Keep your admit card ready.</p></div>
          </div>
        </section>

        <section className="materials-section" id="materials" aria-labelledby="materials-title">
          <div className="materials-header">
            <div>
              <span className="eyebrow"><FileText size={14} aria-hidden="true" /> File Storage</span>
              <h2 id="materials-title">Keep your study materials close.</h2>
              <p>Save personal notes privately, or find admin-published routine PDFs and reference sheets in one shelf beside your exam timeline.</p>
            </div>
            <span className="materials-count">{isAuthenticated ? `${materialsQuery.data?.length ?? 0} private · ${sharedMaterialsQuery.data?.length ?? 0} official` : `${sharedMaterialsQuery.data?.length ?? 0} official`}</span>
          </div>

          {authLoading ? (
            <div className="materials-loading">Loading the public materials shelf…</div>
          ) : (
            <div className="materials-body">
              {!isAuthenticated && (
                <div className="materials-signin materials-public-note">
                  <div className="materials-signin-copy">
                    <CircleCheck size={20} aria-hidden="true" />
                    <div>
                      <strong>Official materials are public.</strong>
                      <span>Sign in only when you want to save personal files or publish as an admin.</span>
                    </div>
                  </div>
                  <Button className="materials-signin-button" onClick={() => startLogin()}>
                    Sign in to upload
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Button>
                </div>
              )}
              {isAuthenticated && (
                <div className="materials-group">
                <div className="materials-group-header">
                  <div>
                    <span className="materials-kicker">Private shelf</span>
                    <h3>Your study materials</h3>
                  </div>
                  <span className="materials-group-count">{materialsQuery.data?.length ?? 0} saved</span>
                </div>
                <label className={cn("upload-dropzone", uploadMaterial.isPending && "uploading")} htmlFor="material-upload">
                  <input
                    id="material-upload"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp,text/plain"
                    onChange={(event) => handleMaterialUpload(event, "private")}
                    disabled={uploadMaterial.isPending}
                  />
                  <span className="upload-icon"><UploadCloud size={21} aria-hidden="true" /></span>
                  <span>
                    <strong>{uploadMaterial.isPending ? "Saving your material…" : "Upload a study material"}</strong>
                    <small>Private to your account · PDF, image, or text · up to 10 MB</small>
                  </span>
                  <span className="upload-arrow"><ArrowDownRight size={18} aria-hidden="true" /></span>
                </label>
                <form className="link-resource-form" onSubmit={(event) => handleAddLink(event, "private")}>
                  <div className="link-form-heading"><Link2 size={15} aria-hidden="true" /><span>Save a Drive, Docs, or web link</span></div>
                  <input aria-label="Private resource title" value={privateLinkTitle} onChange={(event) => setPrivateLinkTitle(event.target.value)} placeholder="Title, e.g. IPE 4603 notes" maxLength={255} />
                  <div className="link-form-row">
                    <input aria-label="Private resource URL" type="url" value={privateLinkUrl} onChange={(event) => setPrivateLinkUrl(event.target.value)} placeholder="https://drive.google.com/..." maxLength={1024} />
                    <Button type="submit" size="sm" disabled={addLink.isPending || !privateLinkTitle.trim() || !privateLinkUrl.trim()}>{addLink.isPending ? "Saving…" : "Save link"}</Button>
                  </div>
                </form>

                {materialsQuery.isLoading ? (
                  <div className="materials-loading">Loading your saved materials…</div>
                ) : materialsQuery.isError ? (
                  <div className="materials-error">
                    <div>
                      <strong>We couldn’t load your materials.</strong>
                      <span>Please try again; your saved files are still safe.</span>
                    </div>
                    <Button className="materials-retry" variant="outline" onClick={() => materialsQuery.refetch()}>Try again</Button>
                  </div>
                ) : materialsQuery.data?.length ? (
                  <ul className="materials-list">
                    {materialsQuery.data.map((material) => (
                      <li key={material.id} className="material-item">
                          <div className={cn("material-file-icon", material.resourceType === "link" && "link-file-icon")}>
                            {material.resourceType === "link" ? <Link2 size={18} aria-hidden="true" /> : <FileText size={18} aria-hidden="true" />}
                          </div>
                          <div className="material-file-copy">
                            <a href={material.fileUrl} target="_blank" rel="noreferrer">{material.fileName}<ExternalLink size={13} aria-hidden="true" /></a>
                            <span>{material.resourceType === "link" ? "Web link" : formatFileSize(material.fileSize)} · {formatDate(new Date(material.createdAt), { day: "2-digit", month: "short", year: "numeric" })}</span>
                          </div>
                        <Button className="material-remove" variant="ghost" size="icon" aria-label={`Remove ${material.fileName}`} disabled={removeMaterial.isPending} onClick={() => removeMaterial.mutate({ id: material.id })}>
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="materials-empty">
                    <Notebook size={19} aria-hidden="true" />
                    <span>No saved materials yet. Your first upload will appear here.</span>
                  </div>
                )}
              </div>
              )}

              <div className="materials-group official-materials">
                <div className="materials-group-header">
                  <div>
                    <span className="materials-kicker">Official Materials</span>
                    <h3>Shared by IUT admins</h3>
                  </div>
                  <span className="materials-group-count">{sharedMaterialsQuery.data?.length ?? 0} shared</span>
                </div>
                <p className="official-materials-note">Admin-published resources are visible to everyone. Personal uploads stay private.</p>
                {isAdmin && (
                  <>
                  <label className={cn("upload-dropzone official-upload", uploadMaterial.isPending && "uploading")} htmlFor="official-material-upload">
                    <input
                      id="official-material-upload"
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp,text/plain"
                      onChange={(event) => handleMaterialUpload(event, "shared")}
                      disabled={uploadMaterial.isPending}
                    />
                    <span className="upload-icon"><UploadCloud size={21} aria-hidden="true" /></span>
                    <span>
                      <strong>{uploadMaterial.isPending ? "Publishing official material…" : "Publish an official material"}</strong>
                      <small>Visible to everyone · up to 10 MB</small>
                    </span>
                    <span className="upload-arrow"><ArrowDownRight size={18} aria-hidden="true" /></span>
                  </label>
                  <form className="link-resource-form official-link-form" onSubmit={(event) => handleAddLink(event, "shared")}>
                    <div className="link-form-heading"><Link2 size={15} aria-hidden="true" /><span>Publish a Drive, Docs, or web link</span></div>
                    <input aria-label="Official resource title" value={officialLinkTitle} onChange={(event) => setOfficialLinkTitle(event.target.value)} placeholder="Title, e.g. Final routine PDF" maxLength={255} />
                    <div className="link-form-row">
                      <input aria-label="Official resource URL" type="url" value={officialLinkUrl} onChange={(event) => setOfficialLinkUrl(event.target.value)} placeholder="https://docs.google.com/..." maxLength={1024} />
                      <Button type="submit" size="sm" disabled={addLink.isPending || !officialLinkTitle.trim() || !officialLinkUrl.trim()}>{addLink.isPending ? "Publishing…" : "Publish link"}</Button>
                    </div>
                  </form>
                  </>
                )}
                {sharedMaterialsQuery.isLoading ? (
                  <div className="materials-loading">Loading official materials…</div>
                ) : sharedMaterialsQuery.isError ? (
                  <div className="materials-error">
                    <div>
                      <strong>We couldn’t load official materials.</strong>
                      <span>Please try again in a moment.</span>
                    </div>
                    <Button className="materials-retry" variant="outline" onClick={() => sharedMaterialsQuery.refetch()}>Try again</Button>
                  </div>
                ) : sharedMaterialsQuery.data?.length ? (
                  <ul className="materials-list">
                    {sharedMaterialsQuery.data.map((material) => (
                      <li key={material.id} className="material-item official-material-item">
                        <div className="material-file-icon official-file-icon"><FileText size={18} aria-hidden="true" /></div>
                        <div className="material-file-copy">
                          <a href={material.fileUrl} target="_blank" rel="noreferrer">{material.fileName}<ExternalLink size={13} aria-hidden="true" /></a>
                          <span>{formatFileSize(material.fileSize)} · {formatDate(new Date(material.createdAt), { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                        {isAdmin && (
                          <Button className="material-remove" variant="ghost" size="icon" aria-label={`Remove ${material.fileName}`} disabled={removeSharedMaterial.isPending} onClick={() => removeSharedMaterial.mutate({ id: material.id })}>
                            <Trash2 size={16} aria-hidden="true" />
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="materials-empty official-empty">
                    <Notebook size={19} aria-hidden="true" />
                    <span>{isAdmin ? "No official materials yet. Publish the first shared resource above." : "No official materials have been published yet."}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <footer className="site-footer">
          <p className="footer-note"><AlarmClock size={15} aria-hidden="true" /> Admit card mandatory for every examination.</p>
        </footer>
      </main>
    </div>
  );
}
