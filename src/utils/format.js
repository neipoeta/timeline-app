import { IGNORE_NEGOCIO_COD } from "../config/business";

/** parse de valor monetário vindo em vários formatos BR/EN */
export function parseMoney(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/\s/g, "");
  if (/^[\d\.]+,[\d]+$/.test(cleaned)) return Number(cleaned.replace(/\./g, "").replace(",", "."));
  if (cleaned.includes(",") && !cleaned.includes(".")) return Number(cleaned.replace(",", "."));
  const n = Number(cleaned.replace(/\./g, ""));
  if (!isNaN(n)) return n;
  const n2 = Number(cleaned.replace(",", "."));
  return isNaN(n2) ? null : n2;
}

export function formatMonthYear(dt) {
  if (!dt) return "";
  try {
    const month = dt.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
    return `${month} ${dt.getFullYear()}`;
  } catch { return ""; }
}

/** primeira parte útil do ds_negocio, descartando OUTROS e código ignorado */
export function primaryNegocioFrom(ds_negocio, cd_negocio) {
  if (!ds_negocio && !cd_negocio) return null;
  if (cd_negocio && Number(cd_negocio) === IGNORE_NEGOCIO_COD) return null;
  if (ds_negocio && String(ds_negocio).toUpperCase().includes("OUTROS")) return null;
  if (!ds_negocio) return cd_negocio ? String(cd_negocio) : null;
  return String(ds_negocio).split(",")[0].trim();
}

/** data usada para ordenar e para o rótulo (OS usa dt_evento, PEDIDO usa dt_abertura) */
export function chooseDateForItem(raw) {
  const isOS = String(raw?.tipo || "").toUpperCase() === "OS";
  const d = isOS ? raw?.dt_evento : raw?.dt_abertura;
  const dt = d ? new Date(d) : null;
  return { dtSort: dt, dateLabel: formatMonthYear(dt) };
}

/** parser do campo de configuração `campos` → [{label, key}] */
export function parseCamposSpec(spec) {
  const s = String(spec || "").trim();
  if (!s) return [];
  return s
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const parts = chunk.split("@").map((p) => p.trim()); // há um '@' sobrando no final do JSON
      const label = parts[0] || "";
      const key   = parts[1] || "";
      return label && key ? { label, key } : null;
    })
    .filter(Boolean);
}
