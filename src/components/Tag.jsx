import React from "react";

/**
 * Tag pill simples.
 * Props:
 *  - label: string (texto da tag)
 *  - tone: "light" | "outline" (opcional)
 */
export default function Tag({ label, tone = "light" }) {
  return <span className={`tag ${tone}`}>{label}</span>;
}
