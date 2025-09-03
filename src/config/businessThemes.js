// Cores/ícones por negócio (apenas configuração)
import { FaCogs, FaShoppingCart, FaCommentDots, FaBoxes } from "react-icons/fa";

export const businessThemes = [
  { match: /SOLIDWORKS/i, color: "#1976d2", icon: <FaCogs /> },
  { match: /LANTEK/i,     color: "#4caf50", icon: <FaShoppingCart /> },
  { match: /EDGECAM/i,    color: "#ff9800", icon: <FaCommentDots /> },
  { match: /STRATASYS/i,  color: "#9c27b0", icon: <FaCogs /> },
  { match: /DASSAULT/i,   color: "#6a1b9a", icon: <FaBoxes /> },
  { match: /VISI/i,       color: "#0288d1", icon: <FaCogs /> },
];

export const defaultOrderIcon = <FaShoppingCart />;
export const defaultOSIcon     = <FaCogs />;

// fallback de cor quando não bate negócio
export function colorByStatusOrValue(situacao, vl) {
  const v = Number(vl) || 0;
  const sit = String(situacao ?? "").trim();
  if (sit === "0") return "#9e9e9e";
  if (sit === "1") return "#2e7d32";
  if (sit === "2") return "#f57c00";
  if (sit === "3") return "#6a1b9a";
  if (v >= 500000) return "#6a1b9a";
  if (v >= 100000) return "#1976d2";
  if (v >= 20000)  return "#4caf50";
  if (v > 0)       return "#0288d1";
  return "#455a64";
}
