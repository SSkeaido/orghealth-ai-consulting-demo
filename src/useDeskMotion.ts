import { useEffect } from "react";

const revealSelector = [
  ".v2-hero > *",
  ".v2-profile",
  ".v2-event-pick",
  ".v2-startbar",
  ".v2-intake-head > *",
  ".v2-intake-form > label",
  ".v2-intake-foot",
  ".v2-notice",
  ".v2-event-hero",
  ".v2-kpis article",
  ".v2-panel",
  ".v2-page-title",
  ".v2-supplement-list > label",
  ".v2-route-list article",
  ".v2-empty",
  ".v2-execution-card",
  ".v2-relation-map",
  ".v3-intro > *",
  ".v3-controls > *",
  ".v3-picker > header",
  ".v3-event-list > button",
  ".v3-event-belt",
  ".v3-intake-title > *",
  ".v3-question-list > label",
  ".v3-intake-action",
  ".v3-summary > *",
  ".v3-direction-stack > *",
  ".v3-candidates > *",
  ".v3-page > *",
  ".v3-routes > article",
  ".v3-site-actions",
  ".v3-site-proof",
  ".v3-gateway-enter",
].join(",");

export function useDeskMotion(key: string) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(
      ".v2-landing, .v2-shell, .v2-intake, .v3-landing, .v3-shell, .v3-intake",
    );
    if (!root) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (reduced || event.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
        root.dataset.pointer = "active";
      });
    };
    const leave = () => {
      delete root.dataset.pointer;
    };
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", leave);

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(revealSelector),
    );
    if (reduced) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return () => {
        root.removeEventListener("pointermove", move);
        root.removeEventListener("pointerleave", leave);
      };
    }
    nodes.forEach((node, index) => {
      node.classList.add("desk-reveal");
      node.style.setProperty("--reveal-order", String(index % 6));
    });
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -3% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
    };
  }, [key]);
}
