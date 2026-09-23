const PRODUCTS = [
  { id: "burg-bruto-rustico", name: "Bruto Rústico", description: "Pão brioche, hambúrguer 160g, ovo, bacon fatias, queijo cheddar, cebola caramelizada, maionese e picles.", price: 42.00, category: "hamburgueres", badge: "MAIS PEDIDO", featured: true, available: true },
  { id: "burg-simprao", name: "Simprão", description: "Pão brioche, burguer 160g, queijo cheddar e maionese da casa.", price: 25.00, category: "hamburgueres", badge: "MAIS PEDIDO", featured: true, available: true },
  { id: "burg-quase-todo-dia", name: "Quase Todo Dia", description: "Pão brioche, hambúrguer 160g, queijo prato, cebola, tomate chapeados, maionese caipira e picles.", price: 35.00, category: "hamburgueres", badge: "MAIS PEDIDO", featured: true, available: true },
  { id: "burg-ce-ta-preparada", name: "Cê Tá Preparada", description: "Pão brioche, hambúrguer 160g, queijo prato, catupiry maçaricado, cebola crispy e barbecue branco.", price: 37.00, category: "hamburgueres", badge: "MAIS PEDIDO", featured: true, available: true },
  { id: "burg-esse-bo-e-meu", name: "Esse B.O É Meu", description: "Pão, hambúrguer 160g, queijo cheddar fatia, queijo cheddar cremoso, bacon, doritos e maionese de bacon.", price: 42.00, category: "hamburgueres", badge: "MAIS PEDIDO", featured: true, available: true },
  { id: "burg-relacao-errada", name: "Relação Errada", description: "Pão brioche, hambúrguer 160g, provolone, doce de leite, bacon e maionese caipira.", price: 38.90, category: "hamburgueres", badge: null, featured: false, available: true },
  { id: "burg-arranhao", name: "Arranhão", description: "Pão brioche, filé de sobrecoxa empanado, mussarela, creme de milho, alface, cebola roxa, tomate e barbecue branco.", price: 38.00, category: "hamburgueres", badge: null, featured: false, available: true },
  { id: "burg-tubaroes", name: "Tubarões", description: "Pão brioche, hambúrguer 160g, queijo mussarela, cream cheese, costela desfiada... (descrição parcial)", price: 51.00, category: "hamburgueres", badge: null, featured: false, available: true },
  { id: "burg-eu-te-seguro", name: "Eu Te Seguro", description: "Pão brioche, hambúrguer 160g, queijo coalho no mel, abacaxi grelhado... (descrição parcial)", price: 52.00, category: "hamburgueres", badge: null, featured: false, available: true },
  { id: "burg-ao-goias", name: "Aô Goiás", description: "Uma homenagem ao verdadeiro pit dog goiano, em versão artesanal! Pão brioche macio, hambúrguer artesanal de 160g... (descrição parcial)", price: 39.99, category: "hamburgueres", badge: null, featured: false, available: true },

  { id: "side-aneis-cebola", name: "Anéis de Cebola", description: "Nossos anéis de cebola crocante e sequinhos. 10 unidades.", price: 19.99, category: "acompanhamentos", badge: null, featured: false, available: true },
  { id: "side-batata-simprona", name: "Batata Simprona", description: "Batata 300g temperada com nosso tempero caipira. Acompanha maionese da casa.", price: 25.00, category: "acompanhamentos", badge: null, featured: false, available: true },
  { id: "side-batata-cheddar-bacon", name: "Batata Cheddar e Bacon", description: "A combinação perfeita e cremosa de batata crinkle com cheddar cremoso, bacon, parmesão ralado e cebolinha.", price: 31.00, category: "acompanhamentos", badge: null, featured: false, available: true },
  { id: "side-batata-costela", name: "Batata Costela", description: "Batata frita, creme de catupiry, costela desfiada, torresminho e finalizada com cebolinha.", price: 39.99, category: "acompanhamentos", badge: null, featured: false, available: true },
  { id: "side-pastelzinho-pernil", name: "Pastelzinho de Pernil", description: "Porção de 10 mini pastéis com nosso recheio de pernil cremoso.", price: 24.90, category: "acompanhamentos", badge: null, featured: false, available: true },
  { id: "side-franguim", name: "Franguim", description: "Nosso delicioso frango empanado crocante e suculento. 10 unidades por porção.", price: 23.00, category: "acompanhamentos", badge: null, featured: false, available: true },

  { id: "combo-caixa-rodeio", name: "Caixa Rodeio", description: "Nossa caixa rodeio contém: 2 hambúrgueres... (descrição parcial)", price: 97.90, category: "combos", badge: null, featured: false, available: true },

  { id: "sazonal-ponto-fraco", name: "Ponto Fraco", description: "Pão brioche. Hambúrguer de linguiça 150g... (descrição parcial)", price: 39.99, category: "sazonal", badge: "SAZONAL DO MÊS", featured: false, available: true },

  { id: "dessert-mini-pudim", name: "Mini Pudim da Chef", description: "Um docim pós-búrguer.", price: 10.00, category: "sobremesas", badge: null, featured: false, available: true },

  { id: "veg-fala-mal-de-mim", name: "Fala Mal De Mim", description: "Pão vegano, carne de lentilha 150g, alface, tomate, cebola roxa e maionese caipira e picles.", price: 36.90, category: "vegetarianos", badge: null, featured: false, available: true },
  { id: "veg-kibe-vegano", name: "Kibe Vegano", description: "300g de kibe 100% vegetal, feito com ingredientes naturais. (6 unidades)", price: 24.30, category: "vegetarianos", badge: "ESGOTADO", featured: false, available: false },

  { id: "kids-trio", name: "Trio Kids", description: "Pão brioche, smash 160g, queijo cheddar e maionese da casa. Acompanha uma porção de fritas + suco Del Valle laranja.", price: 39.90, category: "kids", badge: null, featured: false, available: true },

  { id: "add-maionese-caipira", name: "Maionese Caipira", description: "Maionese da casa, receita caipira.", price: 3.00, category: "adicionais", badge: null, featured: false, available: true },
  { id: "add-maionese-bacon", name: "Maionese de Bacon", description: "Maionese da casa com bacon.", price: 3.00, category: "adicionais", badge: null, featured: false, available: true },
  { id: "add-barbecue-branco", name: "Barbecue Branco", description: "Criação da nossa chef, um delicioso molho barbecue branco.", price: 3.00, category: "adicionais", badge: null, featured: false, available: true },

  { id: "shake-moranguinnn", name: "Moranguinnn", description: "Shake de morango, creme de morango, geleia... (descrição parcial)", price: 28.90, category: "shakes", badge: null, featured: false, available: true },
  { id: "shake-ovotella", name: "Ovotella", description: "Milk-shake com base de creme americano, muita Nutella e o crocante inconfundível do Ovomaltine... (descrição parcial)", price: 29.90, category: "shakes", badge: null, featured: false, available: true },
  { id: "shake-kinder-de-bao", name: "Kinder de Bão", description: "Núu... trem bão!", price: 29.90, category: "shakes", badge: null, featured: false, available: true },
  { id: "shake-nutella-pacoca", name: "Nutella com Paçoca", description: "Creme americano, Nutella, amendoim e paçoquinha... (descrição parcial)", price: 28.00, category: "shakes", badge: null, featured: false, available: true },
  { id: "shake-dodileite", name: "Dodileite", description: "Base de creme americano super cremoso, muito doce de leite... (descrição parcial)", price: 26.00, category: "shakes", badge: null, featured: false, available: true },

  { id: "drink-agua-mineral", name: "Água Mineral", description: "Verificar qual marca temos no dia.", price: 4.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-coca-zero", name: "Refrigerante Coca-Cola Zero Lata", description: "Lata 350ml.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-coca-lata", name: "Refrigerante Coca-Cola Lata", description: "Lata 350ml.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-guarana-antarctica", name: "Refrigerante Guaraná Antarctica Lata", description: "Lata 350ml.", price: 7.00, category: "bebidas", badge: "ESGOTADO", featured: false, available: false },
  { id: "drink-sprite-310", name: "Sprite 310ml", description: "Lata 310ml.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-fanta-laranja", name: "Fanta Laranja Lata", description: "Lata 350ml.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-fanta-uva", name: "Fanta Uva", description: "Lata 350ml.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-h2oh-limoneto", name: "Refrigerante H2OH Limoneto 500ml", description: "Garrafa 500ml.", price: 7.50, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-sprite-fresh", name: "Sprite Fresh 510ml", description: "Unidade 510ml.", price: 7.50, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-suco-acerola-laranja", name: "Suco Bioleve Acerola e Laranja", description: "Produzida com água mineral bioleve, suco natural e fontes de vitaminas.", price: 5.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-suco-citricas", name: "Suco Bioleve Frutas Cítricas", description: "Produzida com água mineral bioleve, suco natural e fontes de vitaminas.", price: 5.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-itubaina", name: "Itubaina ou Tubaína (vidro)", description: "Garrafa de vidro.", price: 8.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-kuat-momesso", name: "Kuat / Momesso", description: "Refrigerante.", price: 9.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-heineken", name: "Cerveja Heineken Lata", description: "Lata.", price: 9.50, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-refri-1l", name: "Refrigerante 1 Litro", description: "Garrafa 1 litro.", price: 12.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-refri-2l", name: "Refrigerante 2 Litros", description: "Garrafa 2 litros.", price: 15.00, category: "bebidas", badge: "ESGOTADO", featured: false, available: false },
  { id: "drink-refri-600", name: "Refrigerante 600ml", description: "Consultar disponibilidade.", price: 9.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-amstel", name: "Amstel", description: "Cerveja lager.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-agua-gas-maca", name: "Água Gaseificada Sabor Maçã", description: "Preço não visível na captura de tela original — confirmar com a loja.", price: 0, category: "bebidas", badge: "CONFIRMAR PREÇO", featured: false, available: false }
];
