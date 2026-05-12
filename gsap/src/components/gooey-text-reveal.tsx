"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef } from "react";

const config = {
  smoothing: 0.1,
  movementThreshold: 0.01,
  sizeFromSpeed: 0.2,
  expandMultiplier: 2,
  expandTime: 2,
  expandEase: "power1.inOut",
  dissolveStart: 2,
  dissolveTime: 3,
  dissolveEase: "power3.in",
};

const GooeyTextReveal = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<SVGSVGElement>(null);
  const maskRef = useRef<SVGGElement>(null);

  const pointer = useRef({ x: 0, y: 0 });
  const smoothPointer = useRef({ x: 0, y: 0 });
  const hasStarted = useRef(false);

  const onPointerMove = useCallback(
    (x: number, y: number) => {
      if (!hasStarted.current) {
        pointer.current = { x, y };
        smoothPointer.current = { x, y };
        hasStarted.current = true;
        return;
      }

      pointer.current = { x, y };
    },
    [hasStarted],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.addEventListener("mousemove", (e) => {
      onPointerMove(e.pageX, e.pageY);
    });

    container.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        onPointerMove(e.touches[0].pageX, e.touches[0].pageY);
      },
      { passive: false },
    );

    container.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        onPointerMove(e.touches[0].pageX, e.touches[0].pageY);
      },
      { passive: false },
    );
  }, [onPointerMove]);

  function matchSVGToViewport() {
    if (!svgContainerRef.current || !containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();

    svgContainerRef.current.style.width = `${width}px`;
    svgContainerRef.current.style.height = `${height}px`;
  }

  useEffect(() => {
    matchSVGToViewport();
    window.addEventListener("resize", matchSVGToViewport);

    return () => {
      window.removeEventListener("resize", matchSVGToViewport);
    };
  }, []);

  function stampSmudgeAt(x: string, y: string, radius: string) {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );

    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", "#fff");

    maskRef.current?.prepend(circle);

    const animatedRadius = { current: Number(radius) };

    const timeline = gsap.timeline({
      onUpdate: () => {
        circle.setAttribute(
          "r",
          Math.max(0, animatedRadius.current).toString(),
        );
      },
      onComplete: () => {
        timeline.kill();
        circle.remove();
      },
    });

    timeline.to(animatedRadius, {
      current: Number(radius) * config.expandMultiplier,
      duration: config.expandTime,
      ease: config.expandEase,
    });

    timeline.to(
      animatedRadius,
      {
        current: 0,
        duration: config.dissolveTime,
        ease: config.dissolveEase,
      },
      config.dissolveStart,
    );
  }

  useEffect(() => {
    function update() {
      if (hasStarted) {
        smoothPointer.current.x +=
          (pointer.current.x - smoothPointer.current.x) * config.smoothing;
        smoothPointer.current.y +=
          (pointer.current.y - smoothPointer.current.y) * config.smoothing;
        const speed = Math.hypot(
          pointer.current.x - smoothPointer.current.x,
          pointer.current.y - smoothPointer.current.y,
        );
        if (speed > config.movementThreshold) {
          stampSmudgeAt(
            smoothPointer.current.x.toString(),
            smoothPointer.current.y.toString(),
            (speed * config.sizeFromSpeed).toString(),
          );
        }
      }
      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative uppercase w-full h-svh overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full p-8 text-center select-none flex justify-center items-end bg-neutral-900 text-neutral-100">
        <h1 className="text-[clamp(5rem,22.5vw,30rem)] leading-none tracking-[0.01px] font-bold">
          About Me
        </h1>
      </div>
      <div className="absolute top-0 left-0 w-full h-full p-8 text-center select-none flex items-center justify-center bg-neutral-100 text-neutral-900 mask-[url(#smudge-mask)]">
        <h3 className="text-[clamp(3rem,5vw,6rem)] leading-none font-bold">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Labore culpa
          iste aliquid atque similique eos explicabo mollitia, enim itaque
          dolore cupiditate quidem exercitationem recusandae iusto sint eligendi
          assumenda autem optio alias laboriosam qui aut vel ab?
        </h3>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        ref={svgContainerRef}
        className="absolute top-0 left-0 pointer-events-none"
      >
        <defs>
          <filter id="smudge-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation={"25"} />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -14"
            />
          </filter>
        </defs>

        <mask id="smudge-mask">
          <g ref={maskRef} filter="url(#smudge-goo)"></g>
        </mask>
      </svg>
    </div>
  );
};

export default GooeyTextReveal;
