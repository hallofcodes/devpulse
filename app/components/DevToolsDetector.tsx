"use client";

import { useEffect } from "react";
import { addListener, launch } from "devtools-detector";

export default function DevToolsDetector() {
  useEffect(() => {
    addListener((isOpen) => {
      if (isOpen)
        window.location.href = "https://youtube.com/watch?v=dQw4w9WgXcQ";
    });

    launch();
  }, []);

  return null;
}
