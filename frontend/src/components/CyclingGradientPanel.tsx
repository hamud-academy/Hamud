"use client";

import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { accentAtIndex, gradientAtIndex, pickNextGradientIndex } from "@/lib/diploma-gradient-palettes";

/** Cycles gradient when the pointer re-enters the card after leaving it. */
export function useCyclingGradientOnReturn(initialIndex = 0) {
  const [index, setIndex] = useState(initialIndex);
  const [shimmerKey, setShimmerKey] = useState(0);
  const isInsideRef = useRef(false);
  const hasLeftRef = useRef(false);

  const onMouseEnter = useCallback(() => {
    if (isInsideRef.current) return;
    isInsideRef.current = true;

    if (hasLeftRef.current) {
      setIndex((current) => pickNextGradientIndex(current));
      setShimmerKey((current) => current + 1);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    isInsideRef.current = false;
    hasLeftRef.current = true;
  }, []);

  return {
    index,
    gradient: gradientAtIndex(index),
    accent: accentAtIndex(index),
    shimmerKey,
    onMouseEnter,
    onMouseLeave,
  };
}

function CyclingGradientPanel({
  children,
  className = "",
  gradient,
  shimmerKey,
  onMouseEnter,
  onMouseLeave,
  backgroundOnly = false,
}: {
  children?: ReactNode;
  className?: string;
  gradient: string;
  shimmerKey: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  backgroundOnly?: boolean;
}) {
  return (
    <div
      className={`diploma-cycling-gradient ${className}`}
      style={{ backgroundImage: gradient } as CSSProperties}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-hidden={backgroundOnly ? true : undefined}
    >
      <div key={shimmerKey} className="diploma-cycling-gradient-shimmer" aria-hidden="true" />
      {!backgroundOnly && children ? (
        <div className="diploma-cycling-gradient-content">{children}</div>
      ) : null}
    </div>
  );
}

export default CyclingGradientPanel;
