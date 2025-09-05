import React from "react";
import "./TimelineTitulo.scss";

/** Mostra "PEDIDO 611899" (dsTipo + numero) */
export default function TimelineTitulo({ dsTipo, numero }) {
  const text = [dsTipo, numero].filter(Boolean).join(" ");
  return <div className="card-title">{text || "—"}</div>;
}
