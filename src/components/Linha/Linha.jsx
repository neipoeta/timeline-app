import React, { useEffect, useRef, useState } from "react";
import "./Linha.scss";

/**
 * Envolve a VerticalTimeline e desenha uma linha central com gradiente
 * segmentado, usando as posições dos ícones + cores recebidas.
 */
export default function Linha({ colors = [], children }) {
  const shellRef = useRef(null);
  const [bg, setBg] = useState("");

  useEffect(() => {
    const recompute = () => {
      const wrap = shellRef.current;
      if (!wrap) return;
      const vt = wrap.querySelector(".vertical-timeline");
      const icons = Array.from(wrap.querySelectorAll(".vertical-timeline-element-icon"));
      if (!vt || icons.length === 0) return;

      const vtRect = vt.getBoundingClientRect();
      const height = vtRect.height;

      // centros Y de cada ícone (px) relativos ao topo da timeline
      const centers = icons.map(el => {
        const r = el.getBoundingClientRect();
        return (r.top - vtRect.top) + r.height / 2;
      });

      const n = Math.min(centers.length, colors.length);
      if (!n) return;

      const mids = [];
      for (let i = 0; i < n - 1; i++) mids.push((centers[i] + centers[i + 1]) / 2);

      const stops = [];
      for (let i = 0; i < n; i++) {
        const start = i === 0 ? 0 : mids[i - 1];
        const end   = i === n - 1 ? height : mids[i];
        const c = colors[i] || "#546e7a";
        stops.push(`${c} ${start}px`, `${c} ${end}px`);
      }
      setBg(`linear-gradient(to bottom, ${stops.join(",")})`);
    };

    recompute();
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(recompute);
    if (shellRef.current) ro.observe(shellRef.current);

    return () => { window.removeEventListener("resize", onResize); ro.disconnect(); };
  }, [colors]);

  return (
    <div className="timeline-shell" ref={shellRef}>
      {children}
      <div className="line-gradient" style={{ background: bg }} />
    </div>
  );
}
