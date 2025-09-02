import React from "react";
import { FaShoppingCart, FaCogs } from "react-icons/fa";

/** Mapeamento de negócio → cor (para PEDIDO) */
export const NEGOCIO_CONFIG = [
  { match: "SOLIDWORKS", color: "#1976d2" },
  { match: "LANTEK",     color: "#4caf50" },
  { match: "EDGECAM",    color: "#ff9800" },
  { match: "STRATASYS",  color: "#9c27b0" },
  { match: "DASSAULT",   color: "#6a1b9a" },
  { match: "VISI",       color: "#0288d1" },
];

/** Cores de fallback por situação/valor quando não há match por negócio */
const STATUS_COLORS = {
  "0": "#9e9e9e",
  "1": "#2e7d32",
  "2": "#f57c00",
  "3": "#6a1b9a",
};

export const UPSALE_THRESHOLD = 0.10;
export const IGNORE_NEGOCIO_COD = 506;
export const RENEW_WORDS = ["RENOVA", "RENEW", "RENOV"];

/** Ícone do marcador central conforme o tipo */
export function iconForTipo(tipo) {
  return String(tipo || "").toUpperCase() === "OS" ? <FaCogs /> : <FaShoppingCart />;
}

/** Cor do card/bullet baseada em negócio / situação / valor */
export function getColorByNegocio(ds_negocio, situacao, vl_total) {
  if (ds_negocio) {
    const text = String(ds_negocio).toUpperCase();
    for (const cfg of NEGOCIO_CONFIG) {
      if (text.includes(cfg.match.toUpperCase())) return cfg.color;
    }
  }
  const sit = String(situacao ?? "");
  if (STATUS_COLORS[sit]) return STATUS_COLORS[sit];

  const v = Number(vl_total) || 0;
  if (v >= 500000) return "#6a1b9a";
  if (v >= 100000) return "#1976d2";
  if (v >= 20000)  return "#4caf50";
  if (v > 0)       return "#0288d1";
  return "#455a64";
}
