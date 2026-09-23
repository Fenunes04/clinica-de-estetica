let checkoutState = {
  step: 1,
  name: "",
  phone: "",
  address: { street: "", number: "", complement: "", neighborhood: "", zip: "", reference: "" },
  payment: "",
  paymentLabel: "",
  changeFor: "",
  notes: ""
};

function openCheckout() {
  if (getCartItems().length === 0) return;
  checkoutState = {
    step: 1,
    name: "",
    phone: "",
    address: { street: "", number: "", complement: "", neighborhood: "", zip: "", reference: "" },
    payment: "",
    paymentLabel: "",
    changeFor: "",
    notes: ""
  };
  renderPaymentOptions();
  document.getElementById("checkout-modal").classList.add("modal--open");
  document.getElementById("checkout-modal").setAttribute("aria-hidden", "false");
  closeCartDrawer();
  renderCheckoutStep();
}

function closeCheckout() {
  const modal = document.getElementById("checkout-modal");
  modal.classList.remove("modal--open");
  modal.setAttribute("aria-hidden", "true");
}

function renderPaymentOptions() {
  const container = document.getElementById("checkout-payment-options");
  container.innerHTML = CONFIG.PAYMENT_METHODS.map(
    (method) => `
    <label class="payment-option">
      <input type="radio" name="payment" value="${method.value}" data-label="${method.label}">
      ${method.label}
    </label>
  `
  ).join("");
  container.querySelectorAll('input[name="payment"]').forEach((input) => {
    input.addEventListener("change", () => {
      const changeWrapper = document.getElementById("checkout-change-wrapper");
      changeWrapper.style.display = input.value === "dinheiro" ? "block" : "none";
    });
  });
}

function showCheckoutError(message) {
  document.getElementById("checkout-error").textContent = message;
}

function renderCheckoutStep() {
  document.querySelectorAll(".checkout-step").forEach((panel) => {
    panel.style.display = Number(panel.dataset.step) === checkoutState.step ? "block" : "none";
  });
  document.getElementById("checkout-error").textContent = "";
  document.getElementById("checkout-back-btn").style.display = checkoutState.step === 1 ? "none" : "inline-flex";
  document.getElementById("checkout-next-btn").style.display = checkoutState.step === 4 ? "none" : "inline-flex";
  document.getElementById("checkout-submit-btn").style.display = checkoutState.step === 4 ? "inline-flex" : "none";
  if (checkoutState.step === 4) {
    renderCheckoutSummary();
  }
}

function goToNextStep() {
  if (checkoutState.step === 1) {
    checkoutState.name = document.getElementById("checkout-name").value.trim();
    checkoutState.phone = document.getElementById("checkout-phone").value.trim();
    if (!checkoutState.name) return showCheckoutError("Preencha seu nome para continuar.");
    if (!checkoutState.phone) return showCheckoutError("Informe seu telefone para continuar.");
  }
  if (checkoutState.step === 2) {
    checkoutState.address.street = document.getElementById("checkout-street").value.trim();
    checkoutState.address.number = document.getElementById("checkout-number").value.trim();
    checkoutState.address.complement = document.getElementById("checkout-complement").value.trim();
    checkoutState.address.neighborhood = document.getElementById("checkout-neighborhood").value.trim();
    checkoutState.address.zip = document.getElementById("checkout-zip").value.trim();
    checkoutState.address.reference = document.getElementById("checkout-reference").value.trim();
    if (!checkoutState.address.street) return showCheckoutError("Informe seu endereço.");
    if (!checkoutState.address.number) return showCheckoutError("Informe o número do endereço.");
    if (!checkoutState.address.neighborhood) return showCheckoutError("Informe o bairro.");
  }
  if (checkoutState.step === 3) {
    const selected = document.querySelector('input[name="payment"]:checked');
    if (!selected) return showCheckoutError("Selecione uma forma de pagamento.");
    checkoutState.payment = selected.value;
    checkoutState.paymentLabel = selected.dataset.label;
    checkoutState.changeFor = document.getElementById("checkout-change-for").value.trim();
  }
  checkoutState.step = Math.min(4, checkoutState.step + 1);
  renderCheckoutStep();
}

function goToPreviousStep() {
  checkoutState.step = Math.max(1, checkoutState.step - 1);
  renderCheckoutStep();
}

function renderCheckoutSummary() {
  const items = getCartItems();
  const addr = checkoutState.address;
  const paymentText =
    checkoutState.payment === "dinheiro" && checkoutState.changeFor
      ? `${checkoutState.paymentLabel} (troco para ${formatCurrency(Number(checkoutState.changeFor.replace(",", ".")) || 0)})`
      : checkoutState.paymentLabel;
  document.getElementById("checkout-summary").innerHTML = `
    <ul class="checkout-summary__items">
      ${items.map((i) => `<li>${i.quantity}x ${i.name} — ${formatCurrency(i.unitPrice * i.quantity)}</li>`).join("")}
    </ul>
    <p><strong>Subtotal:</strong> ${formatCurrency(getCartSubtotal())}</p>
    <p><strong>Entrega:</strong> a combinar</p>
    <p><strong>Total:</strong> ${formatCurrency(getCartSubtotal())}</p>
    <p><strong>Nome:</strong> ${checkoutState.name} — ${checkoutState.phone}</p>
    <p><strong>Endereço:</strong> ${addr.street}, ${addr.number}${addr.complement ? " - " + addr.complement : ""} - ${addr.neighborhood}</p>
    <p><strong>Pagamento:</strong> ${paymentText}</p>
  `;
}

function submitOrder() {
  checkoutState.notes = document.getElementById("checkout-notes").value.trim();
  openWhatsAppOrder();
  clearCart();
  closeCheckout();
}
