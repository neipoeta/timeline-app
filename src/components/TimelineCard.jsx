import React, { useMemo } from "react";
import { VerticalTimelineElement } from "react-vertical-timeline-component";
import { FaStar, FaSyncAlt } from "react-icons/fa";

/* imagens locais dos badges (mantidas) */
import trophyPng from "../images/ico-16x16-trophy.png";
import medalPng  from "../images/ico-16x16-medalha-ouro.png";

/* apenas os que continuam como imagem */
const BADGE_IMAGE = {
  first: trophyPng,   // Primeira compra
  cross: medalPng,    // Cross-sell
};

export default function TimelineCard({ item, position = "left" }) {
  const get = (obj, k) => (obj && k in obj ? obj[k] : undefined);

  const formatVal = (key, val) => {
    if (val === null || val === undefined || val === "") return "—";
    const k = String(key || "").toLowerCase();
    if (k.includes("vl_total") || k.includes("valor")) {
      const n = Number(val);
      if (!isNaN(n)) return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    if (k.startsWith("dt_")) {
      try { const d = new Date(val); if (!isNaN(d)) return d.toLocaleDateString("pt-BR"); } catch {}
    }
    return String(val).trim();
  };

  // normaliza label p/ comparação sem acento e case-insensitive
  const norm = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase();

  // [{label,key},...]
  const parsedCampos = useMemo(() => {
    const spec = String(item?.raw?.campos || item?.campos || "").trim();
    if (!spec) return [];
    return spec
      .split(";")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const parts = chunk.split("@").map((p) => p.trim());
        const label = parts[0] || "";
        const key = parts[1] || "";
        return label && key ? { label, key } : null;
      })
      .filter(Boolean);
  }, [item]);

  // título
  const title = useMemo(() => {
    if (parsedCampos.length) {
      const first = parsedCampos[0];
      const rawVal = get(item, first.key) ?? get(item?.raw, first.key);
      const val = formatVal(first.key, rawVal);
      const labelUpper = norm(first.label);
      if ((labelUpper === "PEDIDO" || labelUpper === "OS") && val !== "—") {
        const clean = String(val).replace(/^R\$\s*/, "");
        return `${labelUpper} ${clean}`;
      }
    }
    const isOS = String(item?.tipo || "").toUpperCase() === "OS";
    return isOS ? `OS ${item?.cd_ordem_servico ?? "—"}` : `PEDIDO ${item?.cd_pedido ?? "—"}`;
  }, [parsedCampos, item]);

  // TAGs (somente para PEDIDO): usa label "Negócio"
  const tags = useMemo(() => {
    const isPedido = String(item?.tipo || "").toUpperCase() === "PEDIDO";
    if (!isPedido || !parsedCampos.length) return [];

    const negIdx = parsedCampos.findIndex(({ label }) => norm(label) === "NEGOCIO");
    if (negIdx < 0) return [];

    const rawVal = get(item, parsedCampos[negIdx].key) ?? get(item?.raw, parsedCampos[negIdx].key);
    if (rawVal == null || rawVal === "") return [];

    return String(rawVal)
      .split(/[,;/]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [parsedCampos, item]);

  // linhas (remove o 1º se for PEDIDO/OS e remove "Negócio" quando virou TAG)
  const lines = useMemo(() => {
    if (!parsedCampos.length) return [];

    const first = parsedCampos[0];
    const omitFirst = ["PEDIDO", "OS"].includes(norm(first.label));

    const isPedido = String(item?.tipo || "").toUpperCase() === "PEDIDO";
    const negKey = isPedido
      ? parsedCampos.find((c) => norm(c.label) === "NEGOCIO")?.key
      : null;

    const arr = omitFirst ? parsedCampos.slice(1) : parsedCampos;

    return arr
      .filter((c) => !(isPedido && negKey && c.key === negKey))
      .map(({ label, key }) => {
        const rawVal = get(item, key) ?? get(item?.raw, key);
        return { label, value: formatVal(key, rawVal) };
      });
  }, [parsedCampos, item]);

  const contentStyle = {
    background: item?.bulletColor || "#546e7a",
    color: "#fff",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  };

  const arrowStyle =
    position === "left"
      ? { borderRight: `7px solid ${item?.bulletColor || "#546e7a"}` }
      : { borderLeft: `7px solid ${item?.bulletColor || "#546e7a"}` };

  /* badges: upsell/renewal com ícone React (MAIORES); first/cross com PNG (maiores via CSS) */
  const badges = (item?.badges || []).map((b, i) => {
    let content;
    if (b.type === "upsell") {
      content = <FaStar size={18} />;      // ↑ levemente maior
    } else if (b.type === "renewal") {
      content = <FaSyncAlt size={18} />;   // ↑ levemente maior
    } else {
      const src = BADGE_IMAGE[b.type] || medalPng;
      content = <img className="badge-img" src={src} alt={b.title || b.type} />;
    }
    return (
      <div key={i} className="badge" title={b.title}>
        {content}
      </div>
    );
  });

  return (
    <VerticalTimelineElement
      className="vertical-timeline-element--work custom-element"
      contentStyle={contentStyle}
      contentArrowStyle={arrowStyle}
      date={item?.dateLabel || ""}
      dateClassName="date-opposite"
      iconStyle={{ background: item?.bulletColor || "#546e7a", color: "#fff" }}
      icon={item?.bulletIcon}
      position={position}
    >
      {/* TAGs acima do título quando for PEDIDO */}
      {String(item?.tipo || "").toUpperCase() === "PEDIDO" && !!tags.length && (
        <div className="tags-row">
          {tags.map((t, i) => (
            <span key={`${t}-${i}`} className="tag light">{t}</span>
          ))}
        </div>
      )}

      <div className="card-header">
        <div className="card-title">{title}</div>
        <div className="badges-wrapper">{badges}</div>
      </div>

      {!!lines.length && (
        <div className="kv" style={{ marginTop: 8 }}>
          {lines.map((ln, i) => (
            <div key={i} className="kv-line">
              <span className="kv-label">{ln.label}:</span> {ln.value}
            </div>
          ))}
        </div>
      )}
    </VerticalTimelineElement>
  );
}
