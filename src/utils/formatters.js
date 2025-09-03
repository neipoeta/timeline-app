// utils de parsing/format
export function parseMoney(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  const s = String(v).replace(/\s/g, "");
  if (/^[\d.]+,[\d]+$/.test(s)) return Number(s.replace(/\./g, "").replace(",", "."));
  if (s.includes(",") && !s.includes(".")) return Number(s.replace(",", "."));
  const n = Number(s.replace(/\./g, ""));
  if (!isNaN(n)) return n;
  const n2 = Number(s.replace(",", "."));
  return isNaN(n2) ? null : n2;
}

export function formatMonthYear(dt) {
  if (!dt) return "";
  try {
    const month = dt.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
    return `${month} ${dt.getFullYear()}`;
  } catch {
    return "";
  }
}

// "Label@key@;Label2@key2@" -> [{label,key},...]
export function parseCamposSpec(spec) {
  const txt = String(spec || "").trim();
  if (!txt) return [];
  return txt
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [label, key] = chunk.split("@").map((p) => p.trim());
      return label && key ? { label, key } : null;
    })
    .filter(Boolean);
}
