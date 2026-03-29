"use client";

import { useEffect } from "react";

export default function BrowserCheck() {
  useEffect(() => {
    async function detectHeadless() {
      try {
        const isWebdriver = navigator.webdriver;
        const hardwareConcurrency = navigator.hardwareConcurrency || 0;

        if (isWebdriver || hardwareConcurrency < 2) {
          document.title = "Access Denied";
          document.body.innerHTML =
            "<h1 style='text-align:center;margin-top:20vh;font-family:sans-serif;'>Access Denied</h1>";
          window.stop();
        }
      } catch (err) {
        console.error("Browser check error:", err);
      }
    }

    detectHeadless();
  }, []);

  return null;
}
