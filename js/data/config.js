const CONFIG = {
  WHATSAPP_NUMBER: "5515997737600",
  INSTAGRAM_URL: "https://instagram.com/torandusburguer",
  GOOGLE_MAPS_DIRECTIONS_URL:
    "https://www.google.com/maps/dir/?api=1&destination=Rua+Jo%C3%A3o+Valentino+Joel+1214+Vila+Hort%C3%AAncia+Sorocaba+SP+18020286",
  GOOGLE_MAPS_EMBED_URL:
    "https://www.google.com/maps?q=Rua+Jo%C3%A3o+Valentino+Joel,+1214+-+Vila+Hort%C3%AAncia,+Sorocaba+-+SP,+18020-286&output=embed",
  ADDRESS: {
    street: "Rua João Valentino Joel, 1214",
    neighborhood: "Vila Hortência",
    city: "Sorocaba",
    state: "SP",
    zip: "18020-286",
    country: "Brasil"
  },
  OPENING_HOURS: {
    domingo: { open: "18:00", close: "23:00" },
    segunda: null,
    terca: { open: "18:00", close: "23:00" },
    quarta: { open: "18:00", close: "23:00" },
    quinta: { open: "18:00", close: "23:00" },
    sexta: { open: "18:00", close: "23:30" },
    sabado: { open: "18:00", close: "23:00" }
  },
  PAYMENT_METHODS: [
    { value: "pix", label: "Pix" },
    { value: "google_pay", label: "Google Pay" },
    { value: "nubank", label: "Nubank" },
    { value: "cartao_credito_online", label: "Cartão de crédito (online)" },
    { value: "cartao_credito_entrega", label: "Cartão de crédito (na entrega)" },
    { value: "cartao_debito_entrega", label: "Cartão de débito (na entrega)" },
    { value: "dinheiro", label: "Dinheiro (na entrega)" }
  ],
  GOOGLE_RATING: { score: 5.0, count: 29 },
  FIRST_ORDER_DISCOUNT: { percent: 10, minOrder: 30 }
};

const CATEGORY_LABELS = {
  hamburgueres: "Hambúrgueres",
  acompanhamentos: "Acompanhamentos",
  combos: "Para Dividir",
  sazonal: "Sazonal do Mês",
  sobremesas: "Sobremesas",
  vegetarianos: "Vegetarianos",
  kids: "Kids",
  adicionais: "Adicionais",
  shakes: "Shakes",
  bebidas: "Bebidas"
};

const CATEGORY_ICONS = {
  hamburgueres: "🍔",
  acompanhamentos: "🍟",
  combos: "🍱",
  sazonal: "🔥",
  sobremesas: "🍮",
  vegetarianos: "🥬",
  kids: "🧒",
  adicionais: "🥫",
  shakes: "🥤",
  bebidas: "🧃"
};
