"use client";

import React, { useRef, useState } from "react";
import { motion } from "motion/react";

const STRENGTH = 0.3;

const MagneticButton = () => {
  const ref = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const { clientX, clientY } = e;

    const x = (clientX - (left + width / 2)) * STRENGTH;
    const y = (clientY - (top + height / 2)) * STRENGTH;

    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const hasMoved = position.x !== 0 || position.y !== 0;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="border border-dashed rounded-[16px]"
      style={{
        borderColor: hasMoved ? "var(--color-primary)" : "transparent",
        backgroundColor:
          "color-mix(in srgb, var(--color-primary) 40%, transparent)",
      }}
    >
      <motion.div
        ref={ref}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.3 }}
      >
        <button className="relative bg-linear-to-b from-primary to-primary text-white font-medium px-4 h-14 flex justify-center items-center rounded-[15px] active:scale-98 transition-all duration-150 cursor-pointer text-shadow-xs group group/btn overflow-hidden">
          <div className="relative group-hover/btn:-translate-y-3/4 group-hover/btn:opacity-0 transition-all duration-300">
            Subscribe Now
          </div>
          <div className="absolute top-1/2 left-0 right-0 opacity-0 translate-y-3/4 group-hover/btn:opacity-100 group-hover/btn:-translate-y-1/2 transition-all duration-300">
            Subscribe Now
          </div>
        </button>
      </motion.div>
    </div>
  );
};

export default MagneticButton;
