import React from "react";
import medalha from "../../images/ico-16x16-medalha-ouro.png";
import trofeu from "../../images/ico-16x16-trophy.png";
import "./Marcadores.scss";

// ícones SVG simples (sem libs)
const UpIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d="M12 5l5 5-1.4 1.4L13 9.8V19h-2V9.8L8.4 11.4 7 10l5-5z" fill="currentColor"/>
  </svg>
);
const RefreshIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d="M17.65 6.35A7.95 7.95 0 0012 4a8 8 0 108 8h-2a6 6 0 11-6-6c1.66 0 3.14.69 4.22 1.78L14 10h6V4l-2.35 2.35z" fill="currentColor"/>
  </svg>
);

function norm(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * tipo: "Upsell" | "Cross-sell" | "Primeira compra do cliente" | "Renovação"
 */
export default function Marcador({ tipo, size = 22 }) {
  const t = norm(tipo);
  if (!t) return null;

  let content = null;
  let title = tipo;

  if (t.includes("upsell")) {
    content = <UpIcon size={size} />;
  } else if (t.includes("renovacao") || t.includes("renovação")) {
    content = <RefreshIcon size={size} />;
  } else if (t.includes("cross-sell") || t.includes("crosssell")) {
    content = <img src={medalha} alt="Cross-sell" width={size} height={size} />;
  } else if (t.includes("primeira compra")) {
    content = <img src={trofeu} alt="Primeira compra do cliente" width={size} height={size} />;
  } else {
    // fallback discreto (texto)
    content = <span className="marcador-text">{tipo}</span>;
  }

  return (
    <span className="marcador" title={title} aria-label={title}>
      {content}
    </span>
  );
}
