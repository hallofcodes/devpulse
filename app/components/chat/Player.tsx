"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faCompress,
  faExpand,
  faGear,
  faPause,
  faPlay,
  faRectangleList,
  faVolumeHigh,
  faVolumeXmark,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

type PlayerProps = {
  src: string;
  className?: string;
  autoPlay?: boolean;
  immersive?: boolean;
  onClose?: () => void;
  onDownload?: () => void;
};

const fmt = (sec: number) => {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

export default function Player({
  src,
  className = "",
  autoPlay = true,
  immersive = false,
  onClose,
  onDownload,
}: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ambientVideoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const settingsBtnRef = useRef<HTMLButtonElement | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);
  const volumeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showUi, setShowUi] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [videoRatio, setVideoRatio] = useState(16 / 9);
  const [showSettings, setShowSettings] = useState(false);
  const [ambientBackground, setAmbientBackground] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [detectedQuality, setDetectedQuality] = useState<string | null>(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobileVolume, setShowMobileVolume] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [hintPos, setHintPos] = useState<{
    x: number;
    y: number;
    below: boolean;
  } | null>(null);
  const [settingsMenuX, setSettingsMenuX] = useState<number | null>(null);
  const [settingsArrowX, setSettingsArrowX] = useState<number | null>(null);
  const hintTimeoutRef = useRef<number | null>(null);

  const hideHint = () => {
    if (hintTimeoutRef.current !== null) {
      window.clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    setActiveHint(null);
    setHintPos(null);
  };

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current !== null) {
        window.clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(video.currentTime || 0);
    const onLoaded = () => {
      setDuration(video.duration || 0);
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setVideoRatio(video.videoWidth / video.videoHeight);
        const detected =
          [2160, 1440, 1080, 720, 480, 360].find(
            (q) => video.videoHeight >= q,
          ) ?? Math.max(144, Math.round(video.videoHeight / 10) * 10);
        setDetectedQuality(`${detected}p`);
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onLoaded);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  useEffect(() => {
    const syncFullscreen = () => {
      const wrap = wrapRef.current;
      setIsFullscreen(!!wrap && document.fullscreenElement === wrap);
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    syncFullscreen();
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const video = videoRef.current;
    const ambient = ambientVideoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
    if (ambient) ambient.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (!showUi) return;
    if (!playing) return;
    if (isSeeking) return;
    const id = setTimeout(() => setShowUi(false), 1800);
    return () => clearTimeout(id);
  }, [playing, showUi, isSeeking]);

  useEffect(() => {
    if (!isSeeking) return;

    const stopSeeking = () => setIsSeeking(false);
    window.addEventListener("mouseup", stopSeeking);
    window.addEventListener("touchend", stopSeeking);
    window.addEventListener("pointerup", stopSeeking);
    window.addEventListener("pointercancel", stopSeeking);

    return () => {
      window.removeEventListener("mouseup", stopSeeking);
      window.removeEventListener("touchend", stopSeeking);
      window.removeEventListener("pointerup", stopSeeking);
      window.removeEventListener("pointercancel", stopSeeking);
    };
  }, [isSeeking]);

  useEffect(() => {
    const showUiFunction = () => {
      if (!showUi) setShowSettings(false);
      if (!showUi) setShowMobileVolume(false);
    };

    showUiFunction();
  }, [showUi]);

  const computeAnchoredMenu = (
    triggerEl: HTMLElement | null,
    menuEl: HTMLElement | null,
  ) => {
    const wrap = wrapRef.current;
    if (!wrap || !triggerEl || !menuEl) return null;
    const wrapRect = wrap.getBoundingClientRect();
    const triggerRect = triggerEl.getBoundingClientRect();
    const triggerCenterX =
      triggerRect.left - wrapRect.left + triggerRect.width / 2;

    const menuWidth = menuEl.offsetWidth || 210;
    const edgePad = 8;
    const minCenter = menuWidth / 2 + edgePad;
    const maxCenter = Math.max(
      minCenter,
      wrapRect.width - menuWidth / 2 - edgePad,
    );
    const menuCenterX = Math.min(
      maxCenter,
      Math.max(minCenter, triggerCenterX),
    );
    const arrowX = Math.min(
      menuWidth - 12,
      Math.max(12, triggerCenterX - (menuCenterX - menuWidth / 2)),
    );
    return { menuCenterX, arrowX };
  };


  useLayoutEffect(() => {
    if (!showSettings) return;
    const update = () => {
      const pos = computeAnchoredMenu(
        settingsBtnRef.current,
        settingsMenuRef.current,
      );
      if (!pos) return;
      setSettingsMenuX(pos.menuCenterX);
      setSettingsArrowX(pos.arrowX);
    };
    update();
    const rafA = window.requestAnimationFrame(update);
    const rafB = window.requestAnimationFrame(() =>
      window.requestAnimationFrame(update),
    );
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.cancelAnimationFrame(rafA);
      window.cancelAnimationFrame(rafB);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [showSettings]);

  useEffect(() => {
    const hideFunction = () => {
      if (showSettings) hideHint();
    };
    hideFunction();
  }, [showSettings]);

  useEffect(() => {
    const qualityFunction = () => {
      if (
        quality !== "Auto" &&
        detectedQuality &&
        quality !== detectedQuality
      ) {
        setQuality(detectedQuality);
      }
    };

    qualityFunction();
  }, [quality, detectedQuality]);

  useEffect(() => {
    const video = videoRef.current;
    const ambient = ambientVideoRef.current;
    if (!video || !ambient || !ambientBackground) return;

    const syncTime = () => {
      if (
        Math.abs((ambient.currentTime || 0) - (video.currentTime || 0)) > 0.08
      ) {
        ambient.currentTime = video.currentTime || 0;
      }
    };

    const onPlay = async () => {
      syncTime();
      try {
        await ambient.play();
      } catch {
        // ignore autoplay block; ambient is decorative only
      }
    };
    const onPause = () => {
      syncTime();
      ambient.pause();
    };
    const onSeeking = syncTime;
    const onRateChange = () => {
      ambient.playbackRate = video.playbackRate || 1;
    };

    syncTime();
    if (!video.paused) onPlay();
    else ambient.pause();

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("timeupdate", onSeeking);
    video.addEventListener("ratechange", onRateChange);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("timeupdate", onSeeking);
      video.removeEventListener("ratechange", onRateChange);
    };
  }, [ambientBackground]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnterPip = () => setIsPipActive(true);
    const onLeavePip = () => setIsPipActive(false);

    video.addEventListener(
      "enterpictureinpicture",
      onEnterPip as EventListener,
    );
    video.addEventListener(
      "leavepictureinpicture",
      onLeavePip as EventListener,
    );

    return () => {
      video.removeEventListener(
        "enterpictureinpicture",
        onEnterPip as EventListener,
      );
      video.removeEventListener(
        "leavepictureinpicture",
        onLeavePip as EventListener,
      );
    };
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play();
    else video.pause();
  };

  const onVideoTap = async () => {
    if (!showUi) {
      setShowUi(true);
      return;
    }
    await togglePlay();
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(duration)) return;
    const next = Math.max(0, Math.min(duration, value));
    video.currentTime = next;
    setCurrentTime(next);
  };

  const toggleFullscreen = async () => {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) await el.requestFullscreen();
    else await document.exitFullscreen();
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current as
      | (HTMLVideoElement & {
          requestPictureInPicture?: () => Promise<unknown>;
        })
      | null;
    if (!video || typeof document === "undefined") return;

    const pipDoc = document as Document & {
      pictureInPictureElement?: Element | null;
      exitPictureInPicture?: () => Promise<void>;
    };

    try {
      if (pipDoc.pictureInPictureElement) {
        await pipDoc.exitPictureInPicture?.();
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP toggle failed:", err);
    }
  };

  const showHint = (
    label: string,
    target?: EventTarget | null,
    placement: "above" | "below" = "above",
  ) => {
    const wrap = wrapRef.current;
    if (wrap && target instanceof HTMLElement) {
      const wrapRect = wrap.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setHintPos({
        x: targetRect.left - wrapRect.left + targetRect.width / 2,
        y:
          placement === "below"
            ? targetRect.bottom - wrapRect.top + 6
            : targetRect.top - wrapRect.top - 6,
        below: placement === "below",
      });
    }
    if (hintTimeoutRef.current !== null) {
      window.clearTimeout(hintTimeoutRef.current);
    }
    setActiveHint(label);
    hintTimeoutRef.current = window.setTimeout(() => {
      setActiveHint(null);
      setHintPos(null);
      hintTimeoutRef.current = null;
    }, 1200);
  };

  const getVolumeHintLabel = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches
    ) {
      return "Volume";
    }
    return muted ? "Unmute" : "Mute";
  };

  const frameStyle = useMemo<CSSProperties>(() => {
    if (immersive) {
      return {
        width: "100%",
        height: "100%",
      };
    }
    const safeRatio = Math.max(0.35, Math.min(videoRatio, 3));
    return {
      aspectRatio: `${safeRatio}`,
      width: `min(92vw, calc(78vh * ${safeRatio}))`,
      maxWidth: "1100px",
      maxHeight: "78vh",
    };
  }, [immersive, videoRatio]);

  return (
    <div
      ref={wrapRef}
      className={`relative group/player overflow-hidden ${
        immersive
          ? "rounded-none border-0 bg-black shadow-none"
          : "rounded-xl border border-white/10 bg-[#05050a] shadow-2xl"
      } ${className}`}
      style={frameStyle}
    >
      {immersive && ambientBackground && (
        <video
          ref={ambientVideoRef}
          src={src}
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 z-0 w-full h-full object-cover scale-110 blur-2xl opacity-30 saturate-110 pointer-events-none"
        />
      )}

      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        playsInline
        className="relative z-10 block w-full h-full object-contain"
        onClick={onVideoTap}
      />

      <div
        className={`absolute inset-0 z-20 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none transition-opacity ${
          showUi ? "opacity-100" : "opacity-0"
        }`}
      />

      <button
        type="button"
        onClick={() => {
          hideHint();
          setShowMobileVolume(false);
          setShowSettings(false);
          void togglePlay();
        }}
        className={`absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/20 bg-black/55 text-white transition ${
          showUi ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <FontAwesomeIcon
          icon={playing ? faPause : faPlay}
          className="w-4 h-4"
        />
      </button>

      {(onDownload || onClose) && (
        <div
          className={`absolute top-3 right-3 z-30 flex items-center gap-2 transition-opacity ${
            showUi ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {onDownload && (
            <button
              type="button"
              onClick={() => {
                hideHint();
                setShowMobileVolume(false);
                setShowSettings(false);
                onDownload();
              }}
              onMouseEnter={(e) =>
                showHint("Download", e.currentTarget, "below")
              }
              onMouseLeave={hideHint}
              onTouchStart={(e) =>
                showHint("Download", e.currentTarget, "below")
              }
              className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
              aria-label="Download video"
            >
              <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={() => {
                hideHint();
                setShowMobileVolume(false);
                setShowSettings(false);
                onClose();
              }}
              onMouseEnter={(e) => showHint("Close", e.currentTarget, "below")}
              onMouseLeave={hideHint}
              onTouchStart={(e) => showHint("Close", e.currentTarget, "below")}
              className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
              aria-label="Close viewer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <div
        className={`absolute z-30 left-0 right-0 bottom-0 p-2 sm:p-2.5 transition-opacity ${
          showUi ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-2 py-2">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-200">
            <button
              type="button"
              onClick={() => {
                hideHint();
                setShowMobileVolume(false);
                setShowSettings(false);
                void togglePlay();
              }}
              onMouseEnter={(e) =>
                showHint(playing ? "Pause" : "Play", e.currentTarget)
              }
              onMouseLeave={hideHint}
              onTouchStart={(e) =>
                showHint(playing ? "Pause" : "Play", e.currentTarget)
              }
              className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
              aria-label={playing ? "Pause" : "Play"}
            >
              <FontAwesomeIcon
                icon={playing ? faPause : faPlay}
                className="w-3 h-3"
              />
            </button>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={() => setIsSeeking(false)}
              onTouchStart={() => setIsSeeking(true)}
              onTouchEnd={() => setIsSeeking(false)}
              className="flex-1 accent-indigo-400 cursor-pointer h-1"
              aria-label="Seek video"
              style={{
                background: `linear-gradient(90deg, rgba(129,140,248,.95) ${progress}%, rgba(255,255,255,.22) ${progress}%)`,
              }}
            />

            <span className="tabular-nums text-[11px] text-gray-200/90 px-1 whitespace-nowrap">
              {fmt(currentTime)} / {fmt(duration)}
            </span>

            <div className="relative">
              <button
                ref={volumeBtnRef}
                type="button"
                onClick={() => {
                  hideHint();
                  setShowSettings(false);
                  if (window.matchMedia("(max-width: 767px)").matches) {
                    setShowMobileVolume((v) => !v);
                    return;
                  }
                  setMuted((v) => !v);
                }}
                onMouseEnter={(e) => {
                  if (!showMobileVolume) {
                    showHint(getVolumeHintLabel(), e.currentTarget);
                  }
                }}
                onMouseLeave={hideHint}
                onTouchStart={(e) => {
                  if (!showMobileVolume) {
                    showHint(getVolumeHintLabel(), e.currentTarget);
                  }
                }}
                className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                <FontAwesomeIcon
                  icon={muted ? faVolumeXmark : faVolumeHigh}
                  className="w-3 h-3"
                />
              </button>

              {showUi && showMobileVolume && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-40 md:hidden rounded-lg border border-white/15 bg-black/75 backdrop-blur-md px-2 py-2">
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-black/75 border-r border-b border-white/15" />
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMuted((v) => !v)}
                      className="w-7 h-7 rounded-md text-white/90 hover:text-white transition"
                      aria-label={muted ? "Unmute" : "Mute"}
                    >
                      <FontAwesomeIcon
                        icon={muted ? faVolumeXmark : faVolumeHigh}
                        className="w-3 h-3"
                      />
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="h-24 w-1.5 accent-indigo-400 cursor-pointer"
                      aria-label="Mobile volume"
                      style={{ writingMode: "vertical-lr", direction: "rtl" }}
                    />
                  </div>
                </div>
              )}
            </div>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="hidden md:block w-20 accent-indigo-400 h-1"
              aria-label="Volume"
            />

            <button
              ref={settingsBtnRef}
              type="button"
              onClick={() => {
                hideHint();
                setShowMobileVolume(false);
                setShowSettings((v) => !v);
              }}
              onMouseEnter={(e) => {
                if (!showSettings) showHint("Settings", e.currentTarget);
              }}
              onMouseLeave={hideHint}
              onTouchStart={(e) => {
                if (!showSettings) showHint("Settings", e.currentTarget);
              }}
              className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
              aria-label="Player settings"
            >
              <FontAwesomeIcon icon={faGear} className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                hideHint();
                setShowMobileVolume(false);
                setShowSettings(false);
                void togglePictureInPicture();
              }}
              onMouseEnter={(e) =>
                showHint("Picture in Picture", e.currentTarget)
              }
              onMouseLeave={hideHint}
              onTouchStart={(e) =>
                showHint("Picture in Picture", e.currentTarget)
              }
              className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
              aria-label="Picture in picture"
            >
              <FontAwesomeIcon
                icon={faRectangleList}
                className={`w-3 h-3 ${isPipActive ? "text-indigo-300" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                hideHint();
                setShowMobileVolume(false);
                setShowSettings(false);
                void toggleFullscreen();
              }}
              onMouseEnter={(e) =>
                showHint(
                  isFullscreen ? "Exit fullscreen" : "Fullscreen",
                  e.currentTarget,
                )
              }
              onMouseLeave={hideHint}
              onTouchStart={(e) =>
                showHint(
                  isFullscreen ? "Exit fullscreen" : "Fullscreen",
                  e.currentTarget,
                )
              }
              className="w-8 h-8 rounded-md text-white/90 hover:text-white transition"
              aria-label="Fullscreen"
            >
              <FontAwesomeIcon
                icon={isFullscreen ? faCompress : faExpand}
                className="w-3 h-3"
              />
            </button>
          </div>
        </div>
      </div>

      {showUi && activeHint && hintPos && (
        <div
          className={`absolute z-50 px-2 py-1 rounded bg-black/75 text-[10px] text-white pointer-events-none -translate-x-1/2 whitespace-nowrap ${
            hintPos.below ? "" : "-translate-y-full"
          }`}
          style={{ left: hintPos.x, top: hintPos.y }}
        >
          {activeHint}
          <span
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-black/75 rotate-45 ${
              hintPos.below ? "-top-1" : "-bottom-1"
            }`}
          />
        </div>
      )}

      {showUi && showSettings && (
        <div
          ref={settingsMenuRef}
          className="absolute bottom-14 z-40 min-w-[210px] rounded-lg border border-white/15 bg-black/75 backdrop-blur-md p-2 text-xs text-gray-100 -translate-x-1/2"
          style={{ left: settingsMenuX ?? undefined }}
        >
          <span
            className="absolute -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-black/75 border-r border-b border-white/15"
            style={{ left: settingsArrowX ?? undefined }}
          />
          <button
            type="button"
            onClick={() => setAmbientBackground((v) => !v)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/10 transition"
          >
            <span>Ambient background</span>
            <span className="text-[10px] text-gray-300">
              {ambientBackground ? "On" : "Off"}
            </span>
          </button>
          <div className="mt-1 border-t border-white/10 pt-1">
            <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wide">
              Playback Speed
            </div>
            <div className="flex flex-wrap items-center gap-1 px-2 pb-1">
              {[0.75, 1, 1.25, 1.5, 2, 5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-2 py-1 rounded text-[10px] transition ${
                    playbackRate === rate
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
          <div className="mt-1 border-t border-white/10 pt-1">
            <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wide">
              Quality
            </div>
            <div className="flex items-center gap-1 px-2 pb-1">
              {["Auto", ...(detectedQuality ? [detectedQuality] : [])].map(
                (q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    className={`px-2 py-1 rounded text-[10px] transition ${
                      quality === q
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {q}
                  </button>
                ),
              )}
            </div>
            <div className="px-2 pb-1 text-[10px] text-gray-500">
              {detectedQuality
                ? `Source max: ${detectedQuality}`
                : "Loading source quality..."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
