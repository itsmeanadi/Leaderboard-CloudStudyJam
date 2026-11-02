"use client";

import React, { useState, useEffect } from "react";

export type CatVariant =
  | "default"
  | "competitive"
  | "sleepy"
  | "celebrating"
  | "curious"
  | "confused"
  | "trophy"
  | "empty";

interface CatMascotProps {
  variant?: CatVariant;
  size?: number | string;
  className?: string;
  interactive?: boolean;
}

export default function CatMascot({
  variant = "default",
  size = 64,
  className = "",
  interactive = false,
}: CatMascotProps) {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized offset from viewport center
      const { innerWidth, innerHeight } = window;
      const xRatio = (e.clientX / innerWidth - 0.5) * 4; // -2 to +2 px
      const yRatio = (e.clientY / innerHeight - 0.5) * 4;
      setPupilOffset({
        x: Math.max(-2.5, Math.min(2.5, xRatio)),
        y: Math.max(-2.5, Math.min(2.5, yRatio)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  const px = pupilOffset.x;
  const py = pupilOffset.y;

  return (
    <div
      className={`inline-block select-none transition-transform duration-300 ${
        isHovered ? "scale-105" : ""
      } ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label={`GDGoC Cat Mascot - ${variant}`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* ================= 1. DEFAULT CAT ================= */}
        {variant === "default" && (
          <g>
            {/* Curled Tail */}
            <path
              d="M86 92C96 92 106 82 106 70C106 60 98 56 94 60C90 64 96 74 88 78C82 81 78 84 78 88"
              stroke="#151515"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Body */}
            <ellipse cx="60" cy="82" rx="28" ry="24" fill="#151515" />
            {/* Front paws */}
            <ellipse cx="50" cy="98" rx="8" ry="5" fill="#151515" />
            <ellipse cx="70" cy="98" rx="8" ry="5" fill="#151515" />
            {/* Head */}
            <circle cx="60" cy="52" r="26" fill="#151515" />
            {/* Ears */}
            <polygon points="38,42 34,16 52,32" fill="#151515" />
            <polygon points="40,38 37,22 49,32" fill="#FFB586" />
            <polygon points="82,42 86,16 68,32" fill="#151515" />
            <polygon points="80,38 83,22 71,32" fill="#FFB586" />
            {/* Eyes */}
            <ellipse cx="48" cy="50" rx="6.5" ry="8" fill="#FFFFFF" />
            <ellipse cx="72" cy="50" rx="6.5" ry="8" fill="#FFFFFF" />
            {/* Pupils with interaction */}
            <circle cx={48 + px} cy={50 + py} r="3.5" fill="#151515" />
            <circle cx={72 + px} cy={50 + py} r="3.5" fill="#151515" />
            {/* Eye shine */}
            <circle cx="46.5" cy="48" r="1.3" fill="#FFFFFF" />
            <circle cx="70.5" cy="48" r="1.3" fill="#FFFFFF" />
            {/* Nose & Mouth */}
            <polygon points="60,57 58,59 62,59" fill="#FFB586" />
            <path
              d="M56 61C58 63 60 62 60 60C60 62 62 63 64 61"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Whiskers */}
            <line x1="32" y1="55" x2="22" y2="53" stroke="#888591" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="32" y1="59" x2="21" y2="61" stroke="#888591" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="88" y1="55" x2="98" y2="53" stroke="#888591" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="88" y1="59" x2="99" y2="61" stroke="#888591" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}

        {/* ================= 2. COMPETITIVE CAT ================= */}
        {variant === "competitive" && (
          <g>
            {/* Body crouching ready to sprint */}
            <ellipse cx="60" cy="80" rx="34" ry="20" fill="#151515" />
            {/* Flicking curved tail */}
            <path
              d="M92 78C104 74 110 58 102 46C96 38 90 42 92 48"
              stroke="#151515"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            {/* Paws */}
            <ellipse cx="36" cy="94" rx="9" ry="5" fill="#151515" />
            <ellipse cx="84" cy="94" rx="9" ry="5" fill="#151515" />
            {/* Head */}
            <circle cx="60" cy="50" r="25" fill="#151515" />
            {/* Swept Back Ears */}
            <polygon points="38,40 28,20 48,30" fill="#151515" />
            <polygon points="40,36 33,24 46,30" fill="#FFB586" />
            <polygon points="82,40 92,20 72,30" fill="#151515" />
            <polygon points="80,36 87,24 74,30" fill="#FFB586" />
            {/* Determined / Competitive Slit Eyes */}
            <path d="M42 47Q50 42 56 49Q49 53 42 47Z" fill="#FFFFFF" />
            <path d="M78 47Q70 42 64 49Q71 53 78 47Z" fill="#FFFFFF" />
            {/* Pupils */}
            <ellipse cx="49" cy="48" rx="2" ry="3.5" fill="#151515" />
            <ellipse cx="71" cy="48" rx="2" ry="3.5" fill="#151515" />
            {/* Cheek flame / determined spark */}
            <polygon points="60,56 58,58 62,58" fill="#FFB586" />
            <path d="M57 60Q60 63 63 60" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            {/* Speed lines */}
            <line x1="12" y1="46" x2="24" y2="46" stroke="#FFB586" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="8" y1="52" x2="20" y2="52" stroke="#FFB586" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* ================= 3. SLEEPY CAT ================= */}
        {variant === "sleepy" && (
          <g>
            {/* Sleeping loaf body */}
            <ellipse cx="60" cy="74" rx="34" ry="24" fill="#151515" />
            {/* Tucked tail */}
            <path
              d="M28 82C22 76 24 66 32 68"
              stroke="#151515"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Head resting low */}
            <circle cx="56" cy="54" r="22" fill="#151515" />
            {/* Relaxed Ears */}
            <polygon points="36,44 26,30 46,38" fill="#151515" />
            <polygon points="39,41 32,32 44,38" fill="#DCD8EF" />
            <polygon points="74,44 84,30 64,38" fill="#151515" />
            <polygon points="71,41 78,32 66,38" fill="#DCD8EF" />
            {/* Happy closed sleepy curved eyes */}
            <path d="M42 54Q47 50 52 54" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M60 54Q65 50 70 54" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            {/* Peaceful mouth */}
            <path d="M53 59Q56 61 59 59" stroke="#FFB586" strokeWidth="1.5" strokeLinecap="round" />
            {/* Soft pink blush */}
            <circle cx="39" cy="58" r="3" fill="#FFB586" opacity="0.7" />
            <circle cx="73" cy="58" r="3" fill="#FFB586" opacity="0.7" />
            {/* Floating z Z Z */}
            <text x="86" y="32" fill="#DCD8EF" fontSize="11" fontWeight="bold" fontFamily="monospace">z</text>
            <text x="94" y="22" fill="#DCD8EF" fontSize="14" fontWeight="bold" fontFamily="monospace">Z</text>
          </g>
        )}

        {/* ================= 4. CELEBRATING CAT ================= */}
        {variant === "celebrating" && (
          <g>
            {/* Body standing tall */}
            <ellipse cx="60" cy="80" rx="22" ry="24" fill="#151515" />
            {/* Raised paws */}
            <path d="M42 68Q30 52 32 40Q38 40 46 54" fill="#151515" />
            <path d="M78 68Q90 52 88 40Q82 40 74 54" fill="#151515" />
            {/* Head */}
            <circle cx="60" cy="50" r="23" fill="#151515" />
            {/* Ears */}
            <polygon points="40,38 34,18 52,28" fill="#151515" />
            <polygon points="42,35 38,22 49,28" fill="#FFB586" />
            <polygon points="80,38 86,18 68,28" fill="#151515" />
            <polygon points="78,35 82,22 71,28" fill="#FFB586" />
            {/* Joyful closed eyes */}
            <path d="M46 48Q51 43 56 48" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M64 48Q69 43 74 48" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
            {/* Open happy mouth */}
            <path d="M55 54Q60 61 65 54Z" fill="#FFB586" />
            {/* Sparkles & Confetti */}
            <circle cx="20" cy="24" r="2.5" fill="#FFB586" />
            <polygon points="100,24 102,28 106,29 102,31 100,35 98,31 94,29 98,28" fill="#DCD8EF" />
            <circle cx="98" cy="48" r="2" fill="#FFB586" />
            <polygon points="18,60 20,63 24,64 20,66 18,70 16,66 12,64 16,63" fill="#FFB586" />
          </g>
        )}

        {/* ================= 5. CURIOUS CAT ================= */}
        {variant === "curious" && (
          <g transform="rotate(7 60 60)">
            {/* Body */}
            <ellipse cx="60" cy="84" rx="26" ry="22" fill="#151515" />
            <ellipse cx="50" cy="98" rx="7" ry="4" fill="#151515" />
            <ellipse cx="70" cy="98" rx="7" ry="4" fill="#151515" />
            {/* Head tilted */}
            <circle cx="60" cy="50" r="25" fill="#151515" />
            {/* Ears */}
            <polygon points="38,38 30,16 50,28" fill="#151515" />
            <polygon points="40,35 34,20 48,28" fill="#FFB586" />
            <polygon points="82,38 90,16 70,28" fill="#151515" />
            <polygon points="80,35 86,20 72,28" fill="#FFB586" />
            {/* Huge curious saucer eyes */}
            <ellipse cx="48" cy="48" rx="8" ry="9" fill="#FFFFFF" />
            <ellipse cx="72" cy="48" rx="8" ry="9" fill="#FFFFFF" />
            {/* Big dilated pupils with interaction */}
            <circle cx={48 + px * 0.8} cy={48 + py * 0.8} r="5" fill="#151515" />
            <circle cx={72 + px * 0.8} cy={48 + py * 0.8} r="5" fill="#151515" />
            {/* Sparkle highlights */}
            <circle cx="46" cy="45" r="2" fill="#FFFFFF" />
            <circle cx="70" cy="45" r="2" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="1" fill="#FFFFFF" />
            <circle cx="74" cy="50" r="1" fill="#FFFFFF" />
            {/* Nose */}
            <polygon points="60,56 58,58 62,58" fill="#FFB586" />
            <path d="M57 60Q60 62 63 60" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}

        {/* ================= 6. CONFUSED CAT ================= */}
        {variant === "confused" && (
          <g>
            {/* Body */}
            <ellipse cx="60" cy="82" rx="26" ry="22" fill="#151515" />
            {/* Head tilted */}
            <circle cx="60" cy="52" r="24" fill="#151515" />
            {/* One ear up, one ear folded */}
            <polygon points="38,42 32,18 52,32" fill="#151515" />
            <polygon points="40,38 35,23 49,32" fill="#FFB586" />
            {/* Folded ear */}
            <path d="M78 40L88 34L82 46Z" fill="#151515" />
            <path d="M80 39L86 35L82 44Z" fill="#DCD8EF" />
            {/* Mismatched eyes: one large, one squinty */}
            <ellipse cx="48" cy="52" rx="7.5" ry="9" fill="#FFFFFF" />
            <circle cx="48" cy="52" r="4" fill="#151515" />
            <circle cx="46.5" cy="50" r="1.3" fill="#FFFFFF" />
            {/* Squinty quizzical eye */}
            <path d="M68 53Q74 48 78 53" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            {/* Wavy mouth */}
            <path d="M54 62Q58 60 62 63Q65 61 68 62" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Floating question mark */}
            <text x="88" y="32" fill="#FFB586" fontSize="18" fontWeight="bold" fontFamily="sans-serif">?</text>
          </g>
        )}

        {/* ================= 7. TROPHY / CHAMPION CAT ================= */}
        {variant === "trophy" && (
          <g>
            {/* Tail waving with gold ribbon */}
            <path
              d="M84 88C98 88 106 74 102 62C98 56 94 62 94 68"
              stroke="#151515"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Royal cape / scarf */}
            <path d="M42 66Q60 76 78 66L84 94Q60 98 36 94Z" fill="#211F32" />
            <path d="M44 68Q60 76 76 68" stroke="#FFB586" strokeWidth="2.5" />
            {/* Body */}
            <ellipse cx="60" cy="80" rx="24" ry="20" fill="#151515" />
            {/* Head */}
            <circle cx="60" cy="50" r="24" fill="#151515" />
            {/* Ears */}
            <polygon points="38,40 32,18 52,30" fill="#151515" />
            <polygon points="40,36 35,23 49,30" fill="#FFB586" />
            <polygon points="82,40 88,18 68,30" fill="#151515" />
            <polygon points="80,36 85,23 71,30" fill="#FFB586" />
            {/* Golden Crown */}
            <path
              d="M48 24L52 14L60 20L68 14L72 24Z"
              fill="#FFB586"
              stroke="#151515"
              strokeWidth="1.5"
            />
            <circle cx="60" cy="17" r="1.5" fill="#FFFFFF" />
            <circle cx="52" cy="14" r="1.2" fill="#FFFFFF" />
            <circle cx="68" cy="14" r="1.2" fill="#FFFFFF" />
            {/* Proud arched smiling eyes */}
            <path d="M46 48Q51 43 56 48" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M64 48Q69 43 74 48" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
            {/* Confident smile */}
            <polygon points="60,55 58,57 62,57" fill="#FFB586" />
            <path d="M56 59Q60 63 64 59" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Sparkling stars */}
            <polygon points="22,34 24,38 28,39 24,41 22,45 20,41 16,39 20,38" fill="#FFB586" />
            <polygon points="98,34 100,38 104,39 100,41 98,45 96,41 92,39 96,38" fill="#FFB586" />
          </g>
        )}

        {/* ================= 8. EMPTY STATE CAT ================= */}
        {variant === "empty" && (
          <g>
            {/* Cardboard Box */}
            <path
              d="M30 68L60 56L90 68L90 98L30 98Z"
              fill="#DCD8EF"
              stroke="#151515"
              strokeWidth="2"
            />
            <path d="M60 56L60 98" stroke="#151515" strokeWidth="1.5" />
            {/* Box flaps */}
            <polygon points="30,68 18,60 48,52 60,56" fill="#C9C3E6" stroke="#151515" strokeWidth="1.5" />
            <polygon points="90,68 102,60 72,52 60,56" fill="#C9C3E6" stroke="#151515" strokeWidth="1.5" />
            {/* Peeking Cat Head inside box */}
            <circle cx="60" cy="48" r="22" fill="#151515" />
            {/* Ears */}
            <polygon points="40,38 34,20 50,30" fill="#151515" />
            <polygon points="42,35 37,24 48,30" fill="#FFB586" />
            <polygon points="80,38 86,20 70,30" fill="#151515" />
            <polygon points="78,35 83,24 72,30" fill="#FFB586" />
            {/* Big wondering round eyes */}
            <ellipse cx="49" cy="46" rx="7" ry="8" fill="#FFFFFF" />
            <ellipse cx="71" cy="46" rx="7" ry="8" fill="#FFFFFF" />
            <circle cx={49 + px * 0.7} cy={46 + py * 0.7} r="4" fill="#151515" />
            <circle cx={71 + px * 0.7} cy={46 + py * 0.7} r="4" fill="#151515" />
            <circle cx="47.5" cy="44" r="1.5" fill="#FFFFFF" />
            <circle cx="69.5" cy="44" r="1.5" fill="#FFFFFF" />
            {/* Little paws holding the edge of the box */}
            <ellipse cx="46" cy="68" rx="6" ry="4" fill="#151515" />
            <ellipse cx="74" cy="68" rx="6" ry="4" fill="#151515" />
          </g>
        )}
      </svg>
    </div>
  );
}

