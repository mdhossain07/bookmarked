"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Loaded in the browser only, so three.js stays out of every page that does not render this.
const AmbientScene = dynamic(() => import("./AmbientScene"), { ssr: false });

/** @param minWidth - viewport width in px below which the scene is not downloaded at all */
export function SceneLayer({ minWidth = 0 }: { minWidth?: number }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [minWidth]);

  return enabled ? <AmbientScene /> : null;
}
