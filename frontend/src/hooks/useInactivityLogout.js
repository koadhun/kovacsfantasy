import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 perc

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export default function useInactivityLogout(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    function logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, timeoutMs);
    }

    resetTimer();

    ACTIVITY_EVENTS.forEach((eventName) =>
      window.addEventListener(eventName, resetTimer, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((eventName) =>
        window.removeEventListener(eventName, resetTimer)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutMs]);
}