/*
 * Quiet Editorial Campus — page-level implementation.
 * Use the dashboard as a calm study surface: ink navy for authority, warm ivory
 * for breathing room, saffron only for the current moment, and forest green for readiness.
 */

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlarmClock,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Clock,
  MapPin,
  Notebook,
  Sparkles,
  Sun,
} from "lucide-react";
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
        <div className="header-context">
          <span className="header-status-dot" aria-hidden="true" />
          <span>Summer semester · 6th semester</span>
          <span className="header-divider" aria-hidden="true" />
          <span>Dhaka time</span>
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

        <footer className="site-footer">
          <p><strong>Source:</strong> Revised Summer Semester Final Examination Schedule, notice dated 18 August 2026, IUT.</p>
          <p className="footer-note"><AlarmClock size={15} aria-hidden="true" /> Admit card mandatory for every examination.</p>
        </footer>
      </main>
    </div>
  );
}
