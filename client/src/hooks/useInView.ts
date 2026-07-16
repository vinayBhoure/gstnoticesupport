'use client';

import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

type IntersectCallback = (isIntersecting: boolean) => void;

type SharedEntry = {
  observer: IntersectionObserver;
  callbacks: Map<Element, IntersectCallback>;
};

// One IntersectionObserver per distinct (threshold, rootMargin) pair, shared
// across every useInView() instance that requests it — pages with dozens of
// AnimateIn/CountUp elements (e.g. the homepage) previously created one
// browser observer per element. Public API and per-hook behavior (initial
// `visible`, `once` semantics, defaults) are unchanged.
const sharedObservers = new Map<string, SharedEntry>();

function getSharedEntry(threshold: number, rootMargin: string): SharedEntry {
  const key = `${threshold}|${rootMargin}`;
  const existing = sharedObservers.get(key);
  if (existing) return existing;

  const callbacks = new Map<Element, IntersectCallback>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        callbacks.get(entry.target)?.(entry.isIntersecting);
      }
    },
    { threshold, rootMargin },
  );
  const created: SharedEntry = { observer, callbacks };
  sharedObservers.set(key, created);
  return created;
}

// Identity-checked before deleting from the module map: if a newer entry
// was already created for the same key by the time this runs (e.g. a
// stale cleanup firing after `once` already released it), this must not
// clobber that live entry.
function releaseSharedEntry(threshold: number, rootMargin: string, el: Element, entry: SharedEntry): void {
  entry.observer.unobserve(el);
  entry.callbacks.delete(el);
  if (entry.callbacks.size === 0) {
    entry.observer.disconnect();
    const key = `${threshold}|${rootMargin}`;
    if (sharedObservers.get(key) === entry) {
      sharedObservers.delete(key);
    }
  }
}

export function useInView<T extends Element = Element>(
  options: UseInViewOptions = {},
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0.12, rootMargin = '0px 0px -40px 0px', once = true } = options;
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const entry = getSharedEntry(threshold, rootMargin);

    const handleIntersect: IntersectCallback = (isIntersecting) => {
      if (isIntersecting) {
        setVisible(true);
        if (once) releaseSharedEntry(threshold, rootMargin, el, entry);
      } else if (!once) {
        setVisible(false);
      }
    };

    entry.callbacks.set(el, handleIntersect);
    entry.observer.observe(el);

    return () => releaseSharedEntry(threshold, rootMargin, el, entry);
  }, [threshold, rootMargin, once]);

  return [ref, visible];
}
