// src/services/normalizeTimeline.js
import React from "react";
import { FaShoppingCart, FaCogs, FaStar, FaTrophy, FaSyncAlt } from "react-icons/fa";

// >>> NOVO: ícones PNG p/ o pino da linha
import iconPedido from "../images/ico-24x24-pedidos.png";
import iconOS from "../images/ico-24x24-ordens-de-servico.png";

/** Regras de cor por negócio + fallback por situação/valor */
const NEGOCIO_COLORS = [
  { test: /SOLIDWORKS/i, color: "#1976d2" },
  { test: /LANTEK/i,     color: "#4caf50" },
  { test: /EDGECAM/i,    color: "#ff9800" },
  { test: /STRATASYS/i,  color: "#9c27b0" },
  { test: /DASSAULT/i,   color: "#6a1b9a" },
  { test: /VISI/i,       color: "#0288d1" },
];
const SITUACAO_COLORS = { "0": "#9e9e9e", "1": "#2e7d32", "2": "#f57c00", "3": "#6a1b9a" };
const DEFAULT_OS   = "#607d8b";
const DEFAULT_ANY  = "#455a64";

const UPSALE_THRESHOLD = 0.10;
const IGNORE_NEGOCIO_COD = 506;
const RENEW_WORDS = ["RENOVA", "RENEW", "RENOV"];

const parseMoney = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/\s/g, "");
  if (/^[\d\\.]+,[\d]+$/.test(cleaned)) return Number(cleaned.replace(/\./g, "").replace(",", "."));
  if (cleaned.includes(",") && !cleaned.includes(".")) return Number(cleaned.replace(",", "."));
  const n = Number(cleaned.replace(/\./g, ""));
  if (!isNaN(n)) return n;
  const n2 = Number(cleaned.replace(",", "."));
  return isNaN(n2) ? null : n2;
};

const primaryNegocioFrom = (ds_negocio, cd_negocio) => {
  if (!ds_negocio && !cd_negocio) return null;
  if (cd_negocio && Number(cd_negocio) === IGNORE_NEGOCIO_COD) return null;
  if (ds_negocio && String(ds_negocio).toUpperCase().includes("OUTROS")) return null;
  if (!ds_negocio) return cd_negocio ? String(cd_negocio) : null;
  return String(ds_negocio).split(",")[0].trim();
};

const colorFor = (rec) => {
  if (String(rec?.tipo || "").toUpperCase() === "OS") return DEFAULT_OS;
  const text = String(rec?.ds_negocio || "");
  for (const r of NEGOCIO_COLORS) if (r.test.test(text)) return r.color;
  const sit = String(rec?.situacao ?? "");
  if (SITUACAO_COLORS[sit]) return SITUACAO_COLORS[sit];
  const v = Number(rec?.vl_total_em_reais ?? rec?.vl_total ?? 0);
  if (v >= 500000) return "#6a1b9a";
  if (v >= 100000) return "#1976d2";
  if (v >= 20000)  return "#4caf50";
  if (v > 0)       return "#0288d1";
  return DEFAULT_ANY;
};

const formatMonthYear = (dt) => {
  if (!dt) return "";
  try {
    const m = dt.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
    const y = dt.getFullYear();
    return `${m} ${y}`;
  } catch { return ""; }
};

export default function normalizeTimeline(raw = []) {
  // 1) normaliza cada item
  const items = raw.map((it) => {
    const isOS = String(it?.tipo || "").toUpperCase() === "OS";
    const v = parseMoney(it.vl_total_em_reais ?? it.vl_total ?? null);

    const dtEvent = isOS && it.dt_evento   ? new Date(it.dt_evento)   : null;
    const dtOpen  = !isOS && it.dt_abertura ? new Date(it.dt_abertura) : null;
    const dtSort  = dtEvent || dtOpen || null;

    const primaryNeg = primaryNegocioFrom(it.ds_negocio, it.cd_negocio);

    return {
      raw: it,
      tipo: it.tipo,
      cd_pedido: it.cd_pedido,
      cd_ordem_servico: it.cd_ordem_servico,
      dt_sort: dtSort,
      dateLabel: formatMonthYear(dtSort),
      nm_nome: it.nm_nome,
      nm_fantasia: it.nm_fantasia,
      cd_entidade: it.cd_entidade,
      vl_total_em_reais: v,
      situacao: it.situacao,
      ds_negocio: it.ds_negocio,
      primaryNegocio: primaryNeg,
    };
  });

  // 2) ordena
  items.sort((a, b) => (a.dt_sort || 0) - (b.dt_sort || 0));

  // 3) badges e visuais
  const lastByNegocio = {};
  let firstPedido = false;
  const orderedNegKeys = [];

  return items.map((item) => {
    const badges = [];

    // “Primeira compra” só para PEDIDO e primeira ocorrência
    if (!firstPedido && String(item?.tipo || "").toUpperCase() !== "OS") {
      badges.push({ type: "first", icon: <FaTrophy />, title: "Primeira compra" });
      firstPedido = true;
    }

    const dsUpper = (item.ds_negocio || "").toUpperCase();
    const isRenew =
      RENEW_WORDS.some((w) => dsUpper.includes(w)) ||
      String(item.situacao || "").trim() === "2";
    if (isRenew) badges.push({ type: "renewal", icon: <FaSyncAlt />, title: "Renovação" });

    const pn = item.primaryNegocio;
    const lastNeg = orderedNegKeys.length ? orderedNegKeys[orderedNegKeys.length - 1] : null;

    if (pn && lastNeg && pn !== lastNeg)
      badges.push({ type: "cross", icon: <FaStar />, title: "Cross-sell" });

    if (pn && lastByNegocio[pn] && item.vl_total_em_reais != null && lastByNegocio[pn].vl_total_em_reais != null) {
      const lastVal = lastByNegocio[pn].vl_total_em_reais || 0;
      if (item.vl_total_em_reais > lastVal * (1 + UPSALE_THRESHOLD))
        badges.push({ type: "upsell", icon: <FaStar />, title: "Upsell" });
    }

    if (pn && !orderedNegKeys.includes(pn)) orderedNegKeys.push(pn);
    if (pn) lastByNegocio[pn] = item;

    // cor e **ícone por tipo** (PNG em BRANCO usando filter)
    const bulletColor = colorFor(item);
    const isOS = String(item?.tipo || "").toUpperCase() === "OS";
    const bulletIcon = isOS
      ? <img src={iconOS} alt="OS" style={{ width: 28, height: 28, filter: "brightness(0) invert(1)" }} />
      : <img src={iconPedido} alt="Pedido" style={{ width: 28, height: 28, filter: "brightness(0) invert(1)" }} />;

    return { ...item, badges, bulletColor, bulletIcon };
  });
}
