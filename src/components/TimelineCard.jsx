import React, { useMemo } from "react";
import { VerticalTimelineElement } from "react-vertical-timeline-component";

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

  const title = useMemo(() => {
    if (parsedCampos.length) {
      const first = parsedCampos[0];
      const rawVal = get(item, first.key) ?? get(item?.raw, first.key);
      const val = formatVal(first.key, rawVal);
      const labelUpper = String(first.label || "").toUpperCase();
      if ((labelUpper === "PEDIDO" || labelUpper === "OS") && val !== "—") {
        const clean = String(val).replace(/^R\$\s*/, "");
        return `${labelUpper} #${clean}`;
      }
    }
    const isOS = String(item?.tipo || "").toUpperCase() === "OS";
    return isOS ? `OS #${item?.cd_ordem_servico ?? "—"}` : `PEDIDO #${item?.cd_pedido ?? "—"}`;
  }, [parsedCampos, item]);

  const lines = useMemo(() => {
    if (!parsedCampos.length) return [];
    const first = parsedCampos[0];
    const omitFirst = ["PEDIDO", "OS"].includes(String(first.label || "").toUpperCase());
    const arr = omitFirst ? parsedCampos.slice(1) : parsedCampos;
    return arr.map(({ label, key }) => {
      const rawVal = get(item, key) ?? get(item?.raw, key);
      return { label, value: formatVal(key, rawVal) };
    });
  }, [parsedCampos, item]);

  const contentStyle = {
    background: item?.bulletColor || "#546e7a",
    color: "#fff",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  };
  const arrowStyle =
    position === "left"
      ? { borderRight: `7px solid ${item?.bulletColor || "#546e7a"}` }
      : { borderLeft: `7px solid ${item?.bulletColor || "#546e7a"}` };

  const badges = (item?.badges || []).map((b, i) => (
    <div key={i} className="badge" title={b.title}>
      {b.icon}
    </div>
  ));

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
