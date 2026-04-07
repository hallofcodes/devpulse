"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AOSWrapper() {
  useEffect(() => {
    AOS.init({
      once: true,
      throttleDelay: 100,
      duration: 600,
    });
  }, []);

  return null;
}
