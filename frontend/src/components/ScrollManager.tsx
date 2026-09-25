import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Scroll position per history entry, keyed by React Router's location.key.
const scrollPositions = new Map<string, number>();

const ScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType(); // "PUSH" | "REPLACE" | "POP"
  const currentKeyRef = useRef(location.key);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Continuously record scroll position against whichever page is
  // currently active — this way it's already correct by the time the
  // user navigates away, instead of trying to capture it afterward
  // (which races with the scroll-reset below and reads 0).
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.set(currentKeyRef.current, window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    currentKeyRef.current = location.key;

    if (navigationType === "POP" && scrollPositions.has(location.key)) {
      const saved = scrollPositions.get(location.key)!;
      const restore = () => window.scrollTo(0, saved);
      restore();
      // Retry while async content (like Home's product grid) finishes
      // loading and the page grows to its full height.
      const timers = [50, 150, 300, 600, 1000].map((ms) =>
        setTimeout(restore, ms),
      );
      return () => timers.forEach(clearTimeout);
    }

    // Any regular navigation (clicking a link, etc.) starts at the top.
    window.scrollTo(0, 0);
  }, [location, navigationType]);

  return null;
};

export default ScrollManager;
