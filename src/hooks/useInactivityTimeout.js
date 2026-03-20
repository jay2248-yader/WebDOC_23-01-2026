import { useState, useEffect, useRef, useCallback } from "react";
import { performLogout } from "../utils/performLogout";

/** ไม่มีการเคลื่อนไหวนาน IDLE_MS → แสดง warning */
const IDLE_MS = 15 * 60 * 1000; // 15 นาที  // 10 วินาที
export const WARN_SECS = 20; // countdown 10 วินาที

export default function useInactivityTimeout() {
  const [isWarning, setIsWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARN_SECS);

  const idleTimerRef  = useRef(null);
  const countdownRef  = useRef(null);
  const resetFnRef    = useRef(null);   // ref ของ reset เพื่อให้ event handler เรียกได้โดยไม่ re-register
  const isWarningRef  = useRef(false);  // mirror ของ isWarning ที่ handler อ่านได้โดยไม่ stale
  const lastResetRef  = useRef(0);      // throttle: ไม่ reset ถี่เกิน 1 ครั้ง/500ms

  const stopAll = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const reset = useCallback(() => {
    stopAll();
    setIsWarning(false);
    isWarningRef.current = false;
    setCountdown(WARN_SECS);

    idleTimerRef.current = setTimeout(() => {
      setIsWarning(true);
      isWarningRef.current = true;
      setCountdown(WARN_SECS);
      countdownRef.current = setInterval(() => {
        setCountdown((n) => n - 1);
      }, 1000);
    }, IDLE_MS);
  }, [stopAll]);

  // Keep ref in sync
  useEffect(() => { resetFnRef.current = reset; }, [reset]);

  // Auto-logout เมื่อ countdown ถึง 0
  useEffect(() => {
    if (isWarning && countdown <= 0) {
      stopAll();
      performLogout(); // hard reload → releases all JS memory
    }
  }, [countdown, isWarning, stopAll]);

  // Register activity listeners ครั้งเดียว
  useEffect(() => {
    const handler = () => {
      if (isWarningRef.current) return; // warning กำลังแสดง → ไม่ reset จาก mouse/key
      const now = Date.now();
      if (now - lastResetRef.current < 500) return; // throttle
      lastResetRef.current = now;
      resetFnRef.current?.();
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetFnRef.current?.(); // เริ่ม timer

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimeout(idleTimerRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  const handleContinue = useCallback(() => reset(), [reset]);
  const handleLogout   = useCallback(() => { stopAll(); performLogout(); }, [stopAll]);

  return { isWarning, countdown, handleContinue, handleLogout };
}
