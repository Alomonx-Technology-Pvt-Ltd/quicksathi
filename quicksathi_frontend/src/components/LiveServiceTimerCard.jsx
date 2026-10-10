import { useState, useEffect } from "react";
import { Clock, ShieldCheck, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";

/**
 * Live Countdown Timer and Doorstep OTP Card for Time-Based Bookings
 */
const LiveServiceTimerCard = ({
  booking,
  isProvider = false,
  onVerifyOtp,
  onCompleteWork,
  verifying = false,
  completing = false,
}) => {
  const [now, setNow] = useState(Date.now());
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  // Update timer every second
  useEffect(() => {
    if (booking?.status !== "in_progress") return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [booking?.status]);

  if (!booking) return null;

  const durationMins = booking.durationMinutes || 60;

  // ──────────────────────────────────────────────────────────────────────────
  // 1. IN PROGRESS STATE: Active Countdown Timer
  // ──────────────────────────────────────────────────────────────────────────
  if (booking.status === "in_progress") {
    const rawStarted = booking.startedAt ? new Date(booking.startedAt).getTime() : now;
    const startedMs = isNaN(rawStarted) ? now : rawStarted;
    const rawEnd = booking.expectedEndAt
      ? new Date(booking.expectedEndAt).getTime()
      : startedMs + durationMins * 60 * 1000;
    const endMs = isNaN(rawEnd) ? startedMs + durationMins * 60 * 1000 : rawEnd;

    const totalDurationMs = Math.max(1000, endMs - startedMs);
    const diffMs = endMs - now;
    const isOvertime = diffMs <= 0;
    const absSeconds = Math.floor(Math.abs(diffMs) / 1000);

    const minutes = Math.floor(absSeconds / 60);
    const seconds = absSeconds % 60;
    const formattedClock = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const elapsedMs = Math.max(0, now - startedMs);
    const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));

    const startTimeStr = booking.startedAt
      ? new Date(booking.startedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      : "—";
    const endTimeStr = booking.expectedEndAt
      ? new Date(booking.expectedEndAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      : "—";

    return (
      <div className="w-full rounded-2xl p-4 sm:p-5 border transition-all mt-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border-blue-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse">
              <Clock size={16} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                ● Service In Progress
              </span>
              <p className="text-xs text-slate-600 m-0 font-medium">
                {isProvider
                  ? "Timer running. Submit work when complete."
                  : "Technician is actively working at your location."}
              </p>
            </div>
          </div>

          {/* Clock Display */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div
              className={`px-3.5 py-1.5 rounded-xl font-mono text-lg sm:text-xl font-bold tracking-wider flex items-center gap-1.5 shadow-2xs ${
                isOvertime
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : minutes <= 5
                  ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                  : "bg-white text-blue-700 border border-blue-200"
              }`}
            >
              <span>{isOvertime ? `+${formattedClock}` : formattedClock}</span>
              <span className="text-[10px] font-sans font-semibold uppercase opacity-75">
                {isOvertime ? "Overtime" : "Remaining"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isOvertime
                  ? "bg-amber-500"
                  : minutes <= 5
                  ? "bg-rose-500"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
            <span>Started: {startTimeStr}</span>
            <span>Allotted: {durationMins} Mins</span>
            <span>Est. End: {endTimeStr}</span>
          </div>
        </div>

        {/* Provider Action: Submit Complete Work */}
        {isProvider && onCompleteWork && (
          <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onCompleteWork(booking._id)}
              disabled={completing}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} />
              <span>{completing ? "Submitting..." : "Submit Work as Done"}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. PENDING / CONFIRMED STATE: Doorstep Start OTP Display or Input
  // ──────────────────────────────────────────────────────────────────────────
  if (["pending", "confirmed"].includes(booking.status)) {
    // 2A. Provider Perspective: Enter OTP to start service
    if (isProvider) {
      return (
        <div className="w-full rounded-2xl p-4 border border-indigo-100 bg-indigo-50/50 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound size={16} className="text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 m-0 uppercase tracking-wider">
              Verify Customer OTP to Start Job
            </h4>
          </div>
          <p className="text-xs text-slate-600 m-0 mb-3 leading-relaxed">
            Ask customer for their 4-digit doorstep verification code to confirm arrival and start the {durationMins}-minute timer.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOtpError("");
              if (!enteredOtp || enteredOtp.trim().length !== 4) {
                setOtpError("Please enter the complete 4-digit code.");
                return;
              }
              if (onVerifyOtp) {
                onVerifyOtp(booking._id, enteredOtp.trim(), setOtpError);
              }
            }}
            className="flex items-center gap-2 flex-wrap"
          >
            <input
              type="text"
              maxLength={4}
              pattern="\d*"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 4821"
              className="w-28 px-3 py-1.5 text-center font-mono text-base font-bold tracking-widest bg-white border border-indigo-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={verifying || enteredOtp.length !== 4}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white border-0 cursor-pointer transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <Clock size={14} />
              <span>{verifying ? "Verifying..." : "Verify & Start Timer"}</span>
            </button>
          </form>

          {otpError && (
            <p className="text-xs font-semibold text-rose-600 mt-2 flex items-center gap-1 m-0">
              <AlertTriangle size={13} />
              <span>{otpError}</span>
            </p>
          )}
        </div>
      );
    }

    // 2B. Customer Perspective: Show Doorstep Start OTP
    return (
      <div className="w-full rounded-2xl p-4 sm:p-5 border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-white mt-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                Doorstep Security Code
              </span>
              <p className="text-xs text-slate-600 m-0 mt-0.5 leading-snug">
                Share this OTP with your professional when they arrive at your location to begin work.
              </p>
            </div>
          </div>

          {/* 4-Digit Monospace OTP Display */}
          {booking.startOtp ? (
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {String(booking.startOtp).split("").map((digit, idx) => (
                <div
                  key={idx}
                  className="w-8 h-10 sm:w-9 sm:h-11 rounded-xl bg-white border border-emerald-300 flex items-center justify-center text-lg sm:text-xl font-bold font-mono text-emerald-800 shadow-2xs select-all"
                >
                  {digit}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-100/80 text-emerald-800 text-xs font-semibold">
              Code will generate upon confirmation
            </div>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-emerald-600" />
            <span>Allotted Service Time: <strong>{durationMins} Minutes</strong></span>
          </span>
          <span className="text-emerald-700 font-semibold">
            Timer starts automatically after verification
          </span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. COMPLETED STATE: Work Completed Timestamp & Notes
  // ──────────────────────────────────────────────────────────────────────────
  if (booking.status === "completed") {
    const completedDateStr = booking.completedAt
      ? new Date(booking.completedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

    return (
      <div className="w-full rounded-2xl p-3 sm:p-4 border border-emerald-100 bg-emerald-50/40 mt-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">
            Work Completed Successfully
            {completedDateStr && <span className="text-slate-500 font-normal"> on {completedDateStr}</span>}
          </span>
        </div>
        {booking.completionNotes && (
          <span className="text-[11px] text-slate-500 italic">
            "{booking.completionNotes}"
          </span>
        )}
      </div>
    );
  }

  return null;
};

export default LiveServiceTimerCard;
