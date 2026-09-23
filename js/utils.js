function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value == null ? "" : value);
  return div.innerHTML;
}

function parseCurrencyInput(text) {
  if (!text) return null;
  let cleaned = text.replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    cleaned = cleaned.replace(",", ".");
  }
  const value = Number(cleaned);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function formatChangeAmount(rawText) {
  const parsed = parseCurrencyInput(rawText);
  return parsed !== null ? formatCurrency(parsed) : rawText;
}
