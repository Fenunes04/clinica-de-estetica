function buildOrderMessage() {
  const items = getCartItems();
  const itemsText = items
    .map((item) => {
      const notes = item.notes ? ` (Obs: ${item.notes})` : "";
      return `${item.quantity}x ${item.name} - ${formatCurrency(item.unitPrice * item.quantity)}${notes}`;
    })
    .join("\n");
  const subtotal = getCartSubtotal();
  const addr = checkoutState.address;
  const addressText = `${addr.street}, ${addr.number}${addr.complement ? " - " + addr.complement : ""} - ${addr.neighborhood}${addr.zip ? ", CEP " + addr.zip : ""}${addr.reference ? " (Ref: " + addr.reference + ")" : ""}`;
  const paymentText =
    checkoutState.payment === "dinheiro" && checkoutState.changeFor
      ? `${checkoutState.paymentLabel} (troco para ${formatChangeAmount(checkoutState.changeFor)})`
      : checkoutState.paymentLabel;

  return [
    "Olá, Torandu's Burguer!",
    "",
    "Gostaria de fazer o seguinte pedido:",
    "",
    itemsText,
    "",
    `Subtotal: ${formatCurrency(subtotal)}`,
    "Entrega: a combinar",
    `Total: ${formatCurrency(subtotal)}`,
    "",
    `Nome: ${checkoutState.name}`,
    `Telefone: ${checkoutState.phone}`,
    `Endereço: ${addressText}`,
    `Forma de pagamento: ${paymentText}`,
    `Observações: ${checkoutState.notes || "Nenhuma"}`
  ].join("\n");
}

function openWhatsAppOrder() {
  const message = buildOrderMessage();
  const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const opened = window.open(url, "_blank");
  return Boolean(opened);
}
