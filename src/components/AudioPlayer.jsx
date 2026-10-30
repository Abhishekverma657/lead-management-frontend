import React, { useState, useRef, useEffect } from "react";
import { LucidePlay, LucidePause, LucideDownload, LucideVolume2 } from "lucide-react";

export default function AudioPlayer({ src, title = "Call Recording", duration: initialDuration = 0 }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(initialDuration || 0);

    useEffect(() => {
        if (initialDuration && isFinite(initialDuration) && initialDuration > 0) {
            setDuration(initialDuration);
        }
    }, [initialDuration]);

    // Single-audio playback constraint: pause other audio players when this one starts
    useEffect(() => {
        const handleOtherPlay = (e) => {
            if (e.detail?.id !== src && isPlaying && audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        };

        window.addEventListener("leadconnect:audio-play", handleOtherPlay);
        return () => window.removeEventListener("leadconnect:audio-play", handleOtherPlay);
    }, [src, isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            const dur = audio.duration;
            if (dur && isFinite(dur) && dur > 0) {
                setDuration(dur);
            }
        };

        const setAudioTime = () => {
            setCurrentTime(audio.currentTime || 0);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener("loadedmetadata", setAudioData);
        audio.addEventListener("loadeddata", setAudioData);
        audio.addEventListener("durationchange", setAudioData);
        audio.addEventListener("timeupdate", setAudioTime);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("loadedmetadata", setAudioData);
            audio.removeEventListener("loadeddata", setAudioData);
            audio.removeEventListener("durationchange", setAudioData);
            audio.removeEventListener("timeupdate", setAudioTime);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [src]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Notify other audio players to pause immediately
            window.dispatchEvent(new CustomEvent("leadconnect:audio-play", { detail: { id: src } }));
            audioRef.current.play().catch(e => console.error("Audio playback error:", e));
            setIsPlaying(true);
        }
    };

    const handleSeek = (e) => {
        const seekTime = Number(e.target.value);
        setCurrentTime(seekTime);
        if (audioRef.current) {
            audioRef.current.currentTime = seekTime;
        }
    };

    const formatTime = (timeInSeconds) => {
        if (!timeInSeconds || isNaN(timeInSeconds) || !isFinite(timeInSeconds) || timeInSeconds < 0) return "00:00";
        const mins = Math.floor(timeInSeconds / 60);
        const secs = Math.floor(timeInSeconds % 60);
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl px-3 py-2 flex items-center gap-2.5 w-full shadow-2xs hover:border-orange-300 transition-colors">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                type="button"
                onClick={togglePlay}
                className="w-7 h-7 rounded-lg bg-[#FF5B22] hover:bg-[#EA580C] text-white flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                title={isPlaying ? "Pause" : "Play Recording"}
            >
                {isPlaying ? <LucidePause size={13} /> : <LucidePlay size={13} className="ml-0.5" />}
            </button>

            {/* Progress Bar Slider */}
            <div className="flex-1 flex items-center">
                <input
                    type="range"
                    min={0}
                    max={isFinite(duration) && duration > 0 ? duration : 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF5B22]"
                />
            </div>

            {/* Duration Display */}
            <span className="text-[11px] font-mono font-medium text-slate-500 tabular-nums whitespace-nowrap shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Download Link */}
            <a
                href={src}
                download="call-recording.mp3"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-md transition-colors shrink-0"
                title="Download MP3"
            >
                <LucideDownload size={13} />
            </a>
        </div>
    );
}
