import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "s3explore.knownPaths";

export function useKnownPaths() {
  const [knownPaths, setKnownPaths] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever knownPaths changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(knownPaths));
    } catch (e) {
      console.error("Failed to save known paths to localStorage:", e);
    }
  }, [knownPaths]);

  const addKnownPath = useCallback((path: string) => {
    setKnownPaths((prev) => {
      if (prev.includes(path)) return prev;
      return [...prev, path];
    });
  }, []);

  const removeKnownPath = useCallback((path: string) => {
    setKnownPaths((prev) => prev.filter((p) => p !== path));
  }, []);

  const hasPath = useCallback(
    (path: string) => knownPaths.includes(path),
    [knownPaths]
  );

  return {
    knownPaths,
    addKnownPath,
    removeKnownPath,
    hasPath,
  };
}
