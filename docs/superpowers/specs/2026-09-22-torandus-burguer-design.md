# Torandu's Burguer — Site institucional + pedidos online

Data: 2026-09-22
Status: Aprovado para planejamento

## 1. Objetivo

Construir uma landing page + sistema de pedidos online (client-side) para a
hamburgueria Torandu's Burguer, em Sorocaba-SP. O site deve apresentar a marca,
exibir o cardápio real com preços, permitir montar um pedido em um carrinho
persistente, coletar dados de entrega/pagamento e finalizar o pedido via
WhatsApp (mensagem pré-formatada), sem processamento de pagamento real.

Prioridades, na ordem definida pelo usuário: funcionalidade > experiência do
usuário > identidade visual da marca > conversão > responsividade >
performance > estética.

## 2. Escopo técnico

- **Stack:** HTML + CSS + JavaScript puro (ES modules), sem build step, sem
  framework, sem dependências de Node/npm. Deploy possível em qualquer
  hospedagem estática (GitHub Pages, Netlify, servidor simples) ou uso local.
- **Sem backend.** Todo o estado (carrinho) vive no browser (`localStorage`).
  O "checkout" apenas monta uma mensagem de texto e abre o WhatsApp do
  cliente (`wa.me`) com o pedido pré-preenchido.
- **Sem processamento de pagamento real.** As opções de pagamento
  (Pix, cartão, dinheiro) são apenas informativas na mensagem enviada — a
  cobrança real acontece depois, fora do site, pela loja.

## 3. Dados reais confirmados (não inventar)

Extraídos das imagens de referência fornecidas pelo usuário e confirmados por
ele para uso direto no site (sem placeholder):

- **Nome:** Torandu's Burguer
- **WhatsApp:** `5515997737600` (formato E.164 sem `+`, para uso em `wa.me`)
- **Instagram:** `@torandusburguer` (`https://instagram.com/torandusburguer`)
- **Endereço:** Rua João Valentino Joel, 1214 - Vila Hortência, Sorocaba - SP,
  18020286, Brasil
- **Avaliação Google:** 5,0 ★ — 29 avaliações
- **Horário de funcionamento:**
  - Domingo: 18h–23h
  - Segunda-feira: fechado
  - Terça-feira: 18h–23h
  - Quarta-feira: 18h–23h
  - Quinta-feira: 18h–23h
  - Sexta-feira: 18h–23h30
  - Sábado: 18h–23h
- **Formas de pagamento:** Pix (online), Google Pay (online), Nubank
  (online), Cartão de crédito (online), Cartão de crédito (na entrega)
- **Texto institucional (usar literalmente, sem alterar sentido):**
  > "Na Torandu's Burguer, acreditamos que um hambúrguer vai muito além de
  > matar a fome: ele precisa proporcionar uma experiência. Por isso, criamos
  > hambúrgueres artesanais preparados com ingredientes selecionados, carnes
  > de alta qualidade e combinações exclusivas que fogem do comum, sem abrir
  > mão do sabor que conquista qualquer pessoa. Cada receita é desenvolvida
  > com cuidado para oferecer equilíbrio, personalidade e muito sabor.
  > Utilizamos pão macio, hambúrgueres suculentos, ingredientes frescos e
  > molhos especiais produzidos para transformar cada lanche em um momento
  > único."
- **Logo:** reproduzir a identidade visual da logo de referência (chapéu de
  cowboy + chifres de boi sobre o texto "Torandu's Burguer", paleta
  laranja/terracota/marrom) como SVG/imagem no header e footer. Não criar uma
  identidade nova.
- **Desconto de primeira compra:** banner "10% de desconto na primeira
  compra, identifique-se — pedido mínimo R$30,00" (informativo; sem sistema
  de cadastro/login real — o site pode exibir o banner como comunicação, sem
  aplicar desconto automático, já que não há autenticação de cliente nesta
  fase).
- **Sem pedido mínimo** para o pedido em si (exceto os R$30 citados no banner
  de desconto de primeira compra, que é uma condição separada).

Onde a descrição de um produto aparece cortada nas capturas de tela
(reticências truncadas pela própria interface original, não pelo usuário),
o texto será reproduzido exatamente como capturado, sem completar ou
inventar o restante. Isso fica marcado no arquivo de dados com um comentário
`// descrição parcial — completar com o texto real` para fácil localização.

## 4. Catálogo de produtos

Todos os produtos e preços abaixo são reais, extraídos das capturas de tela.
Serão organizados no arquivo `js/data/products.js` com campos
`{ id, name, description, price, category, badge, featured, available }`.

### Hambúrgueres Artesanais
| Nome | Preço | Descrição |
|---|---|---|
| Bruto Rústico | R$42,00 | Pão brioche, Hambúrguer 160g, Ovo, Bacon fatias, Queijo cheddar, Cebola caramelizada, Maionese e Picles |
| SIMPRÃO | R$25,00 | Pão Brioche, Burguer 160g, Queijo cheddar e maionese da casa |
| Quase todo dia | R$35,00 | Pão Brioche, Hambúrguer 160g, Queijo Prato, Cebola, Tomate Chapeados, Maionese Caipira e Picles |
| Ce Tá Preparada | R$37,00 | Pão Brioche, Hambúrguer 160g, Queijo Prato, Catupiry Maçaricado, Cebola Crispy e Barbecue Branco |
| Esse B.o É Meu | R$42,00 | Pão, Hambúrguer 160g, Queijo Cheddar Fatia, Queijo Cheddar Cremoso, Bacon, Doritos e Maionese De Bacon |
| Relação Errada | R$38,90 | Pão Brioche, Hambúrguer 160g, Provolone, Doce De Leite, Bacon E Maionese Caipira |
| Arranhão | R$38,00 | Pão Brioche, Filé de sobrecoxa empanado, mussarela, creme De Milho, alface, cebola roxa, tomate e barbecue branco |
| Tubarões | R$51,00 | Pão brioche, hambúrguer 160g, queijo mussarela, cream cheese, costela desfia... *(descrição parcial)* |
| Eu te seguro | R$52,00 | Pão brioche, hambúrguer 160g, queijo coalho no mel, abacaxi grelha... *(descrição parcial)* |
| Aô Goiás | R$39,99 | Uma homenagem ao verdadeiro pit dog goiano, em versão artesanal! Pão brioche macio, hambúrguer artesanal de 160g... *(descrição parcial)* |

Badges: SIMPRÃO, Quase todo dia, Bruto Rústico, Esse B.o É Meu, Ce Tá
Preparada = `featured: true` / badge "MAIS PEDIDO" (apareciam em "Os mais
pedidos").

### Entradinhas / Acompanhamentos
| Nome | Preço | Descrição |
|---|---|---|
| Anéis de Cebola | R$19,99 | Nossos anéis de cebola crocante e sequinhos. 10 unidades. |
| Batata Simprona | R$25,00 | Batata 300g temperada com nosso tempero caipira. Acompanha maionese da casa. |
| Batata Cheddar e Bacon | R$31,00 | Batata crinkle com cheddar cremoso, bacon, parmesão ralado e cebolinha. |
| Batata Costela | R$39,99 | Batata frita, creme de catupiry, costela desfiada, torresminho e cebolinha. |
| Pastelzinho de Pernil | R$24,90 | Porção de 10 mini pastéis com recheio de pernil cremoso. |
| Franguim | R$23,00 | Frango empanado crocante e suculento. 10 unidades por porção. |

### Para dividir / Combos
| Nome | Preço | Descrição |
|---|---|---|
| CAIXA RODEIO | R$97,90 | Combo com 2 hambúrgueres... *(descrição parcial)* |

### Sazonal do mês
| Nome | Preço | Descrição |
|---|---|---|
| PONTO FRACO | R$39,99 | Pão brioche. Hambúrguer de linguiça 150g... *(descrição parcial)* |

### Promoções ("Promo da Noite")
| Nome | Preço promo | Preço original | Descrição |
|---|---|---|---|
| 2 Quase Todo Dia | R$54,99 | R$70,00 (2× R$35) | 2 hambúrgueres Quase Todo Dia |

### Sobremesas
| Nome | Preço | Descrição |
|---|---|---|
| Mini pudim da chef | R$10,00 | — |

### Vegetarianos
| Nome | Preço | Descrição | Disponibilidade |
|---|---|---|---|
| Fala Mal De Mim | R$36,90 | Pão vegano, carne de lentilha 150g, alface, tomate, cebola roxa, maionese caipira e picles | disponível |
| Kibe vegano | R$24,30 | 300g de kibe 100% vegetal, ingredientes naturais (6 unidades) | **esgotado** |

### Kids
| Nome | Preço | Descrição |
|---|---|---|
| Trio Kids | R$39,90 | Pão brioche, smash 160g, queijo cheddar e maionese da casa. Acompanha porção de fritas + suco Del Valle laranja. |

### Adicionais / Molhos ("Toraneses")
| Nome | Preço |
|---|---|
| Maionese Caipira | R$3,00 |
| Maionese de Bacon | R$3,00 |
| Barbecue branco | R$3,00 |

### Shakes ("Shake-Randu'S", 400ml)
| Nome | Preço | Descrição |
|---|---|---|
| Moranguinnn | R$28,90 | Shake de morango, creme de morango, geleia... *(descrição parcial)* |
| Ovotella | R$29,90 | Creme americano, muita Nutella e crocante... *(descrição parcial)* |
| Kinder de Bão | R$29,90 | "NÚU... TREM BÃO!" |
| Nutella com Paçoca | R$28,00 | Creme americano, Nutella, amendoim e paçoquinha... *(descrição parcial)* |
| Dodileite | R$26,00 | Creme americano cremoso, doce de leite... *(descrição parcial)* |

### Bebidas
| Nome | Preço | Disponibilidade |
|---|---|---|
| Água Mineral | R$4,00 | disponível |
| Refrigerante Coca-Cola Zero Lata 350ml | R$7,00 | disponível |
| Refrigerante Coca-Cola Lata 350ml | R$7,00 | disponível |
| Refrigerante Guaraná Antarctica Lata 350ml | R$7,00 | **esgotado** |
| Sprite 310ml | R$7,00 | disponível |
| Fanta Laranja Lata 350ml | R$7,00 | disponível |
| Fanta Uva | R$7,00 | disponível |
| Refrigerante H2oh Limoneto 500ml | R$7,50 | disponível |
| Sprite Fresh 510ml | R$7,50 | disponível |
| Suco Bioleve Acerola e Laranja | R$5,00 | disponível |
| Suco Bioleve Frutas Cítricas | R$5,00 | disponível |
| Itubaina ou Tubaina (vidro) | R$8,00 | disponível |
| Kuat / Momesso | R$9,00 | disponível |
| Cerveja Heineken Lata | R$9,50 | disponível |
| Refrigerante 1 litro | R$12,00 | disponível |
| Refrigerante 2 litros | R$15,00 | **esgotado** |
| Refrigerante 600ml | R$9,00 | consultar disponibilidade |
| Amstel | R$7,00 | disponível |
| Água gaseificada sabor Maçã | *preço não legível na imagem* | usar placeholder `0` com comentário `// TODO: preço não visível na captura` |

Produtos marcados "esgotado" são renderizados com badge "Esgotado", botão
"Adicionar" desabilitado, e não somam ao carrinho.

## 5. Identidade visual

**Paleta** (variáveis CSS em `:root`):
```
--color-orange-burnt: #D95F02
--color-orange-ember: #E76F00
--color-terracotta: #C65D3A
--color-terracotta-dark: #9E4530
--color-brown: #5A321F
--color-brown-dark: #321C14
--color-charcoal: #171311
--color-off-white: #F5EBDD
--color-cream: #FFF3DF
```
Uso: fundo predominante em preto carvão/marrom escuro; laranja/terracota como
cor de destaque (botões, preços, badges, ícones). Sem laranja neon.

**Tipografia:** títulos em fonte de impacto (Bebas Neue / Oswald / Anton via
Google Fonts), texto em Inter. Carregadas via `<link>` no `<head>`.

**Estética:** rústico + brasa + artesanal + premium. Texturas sutis de
carvão/papel kraft/madeira em backgrounds, sem prejudicar legibilidade.
Efeitos de fumaça/glow muito discretos no hero, via CSS (gradientes/blur),
sem bibliotecas de partículas pesadas.

**Imagens de produto:** por decisão do usuário, cada categoria usa um
placeholder genérico consistente (ilustração/ícone temático em fundo com a
paleta da marca — ex. silhueta de hambúrguer para a categoria "Hambúrgueres",
de batata para "Acompanhamentos", de copo para "Bebidas"), referenciado via
caminho `assets/images/<categoria>/<slug>.jpg` já certo na estrutura de
dados, para troca futura por fotografia profissional sem alterar código.

## 6. Estrutura de arquivos

```
torandus-burguer/                  (raiz do projeto = raiz do repositório)
├── index.html
├── manifest.json                  (PWA básico: nome, ícones, theme-color)
├── favicon.svg
├── assets/
│   ├── css/
│   │   └── styles.css             (tokens + layout + componentes, mobile-first)
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero-burger-placeholder.jpg
│   │   └── categories/            (1 placeholder por categoria)
│   └── icons/                     (SVGs inline ou sprite: carrinho, busca, whatsapp, instagram, localização, etc.)
├── js/
│   ├── data/
│   │   ├── products.js            (catálogo da seção 4)
│   │   ├── promotions.js
│   │   ├── reviews.js             (placeholders estruturados — sem depoimentos inventados)
│   │   └── config.js              (WHATSAPP_NUMBER, INSTAGRAM_URL, GOOGLE_MAPS_URL, ADDRESS, OPENING_HOURS, PAYMENT_METHODS)
│   ├── cart.js                    (estado + persistência em localStorage)
│   ├── render.js                  (renderização do cardápio/filtros/busca/destaques)
│   ├── modal.js                   (modal de produto: quantidade, observação, adicionais)
│   ├── checkout.js                (fluxo de 4 etapas + validação de campos)
│   ├── whatsapp.js                (monta a mensagem final e chama wa.me)
│   ├── openingHours.js            (calcula aberto/fechado a partir de config.js)
│   └── app.js                     (bootstrap: menu mobile, scroll suave, listeners globais)
└── docs/superpowers/specs/        (este documento)
```

Módulos JS carregados via `<script type="module" src="js/app.js">`, que
importa os demais — não há bundler; ES modules nativos do navegador.

## 7. Componentes / seções da página (ordem no `index.html`)

1. **Header sticky**: logo, nav (Início / Pedidos / Promoções / Sobre /
   Avaliações / Contato), ícone de busca, ícone de carrinho com contador,
   menu hamburger no mobile.
2. **Hero**: headline, subheadline, CTA "Fazer meu pedido" (scroll até
   #pedidos) e "Ver cardápio", indicadores (🔥 Artesanal, 🥩 Carne
   selecionada, 🍔 Hambúrguer suculento, ⭐ 5,0 no Google), badge de
   aberto/fechado dinâmico.
3. **Por que Torandu's** — cards de diferenciais com hover.
4. **Faça seu pedido** (`#pedidos`) — busca, filtros por categoria, grid de
   produtos por categoria (renderizado a partir de `products.js`), banner de
   10% de desconto na primeira compra.
5. **Queridinhos da casa** — produtos com `featured: true`, cards maiores.
6. **Promoções da Brasa** (`#promocoes`) — cards com preço riscado/preço
   promocional quando aplicável.
7. **Sobre** — texto institucional literal.
8. **Avaliações** — 5,0★ / 29 avaliações no Google, grid de cards com
   placeholders para depoimentos reais.
9. **Selos de confiança** — compra segura, dados protegidos, pagamento
   seguro, pedido acompanhado, pedido rápido (sem alegações técnicas falsas).
10. **Onde estamos** — endereço, horários, mapa incorporado (Google Maps
    embed com o endereço real), botão "Como chegar" (abre
    `GOOGLE_MAPS_URL`).
11. **Footer de conversão** ("Deu fome?") + CTA final.
12. **Footer** — logo, links de navegação, contato (WhatsApp, Instagram,
    endereço), copyright.
13. **Carrinho** (drawer lateral, aberto por clique no ícone do header ou na
    barra inferior mobile) + **Modal de produto** + **Modal de checkout**
    (elementos fixos fora do fluxo normal, controlados via JS).
14. **Barra de navegação inferior fixa (mobile only)**: Início / Pedidos /
    Promoções / Carrinho.

## 8. Fluxo funcional do carrinho e checkout

- `addToCart(productId, quantity, extras, notes)` — grava no array de
  estado e em `localStorage['torandus_cart']`.
- Alterações de quantidade/remoção re-renderizam o drawer e o contador do
  header em tempo real (sem reload).
- Carrinho vazio → mensagem "Seu carrinho está vazio" + botão "Ver
  cardápio".
- Checkout em 4 etapas dentro de um único modal, com botão "voltar" em cada
  etapa:
  1. Dados (nome, telefone) — validação obrigatória.
  2. Entrega (endereço, número, complemento, bairro, CEP, referência) —
     validação obrigatória exceto complemento/referência.
  3. Pagamento (dinheiro / Pix / cartão crédito / cartão débito); se
     "dinheiro", exibir campo condicional "Troco para quanto?".
  4. Confirmação — resumo completo (itens, subtotal, total, dados, entrega,
     pagamento) + botão "Confirmar pedido".
- Ao confirmar: `whatsapp.js` monta a mensagem no formato definido na seção
  13 da especificação original do usuário e chama
  `window.open('https://wa.me/5515997737600?text=' + encodeURIComponent(mensagem))`.
- Erros de validação exibidos inline, mensagens em português, nunca só por
  cor (ícone + texto).

## 9. Responsividade e acessibilidade

- Mobile-first; breakpoints testados visualmente em 320/375/390/414/768/
  1024/1280/1440/1920px.
- Barra de navegação inferior fixa somente abaixo de 768px, sem sobrepor
  conteúdo (padding-bottom no body).
- Contraste AA mínimo entre texto e fundo em toda a paleta escura.
- Todos os controles interativos acessíveis por teclado, com foco visível;
  labels em todos os inputs; `aria-label` em ícones sem texto.

## 10. SEO e performance

- `<title>`, meta description, Open Graph, favicon, meta viewport, canonical
  e `robots` no `<head>` do `index.html`, conforme item 26 da especificação
  original.
- Hierarquia de headings H1 (hero) → H2 (seções) → H3 (produtos/cards).
- `alt` descritivo em todas as imagens.
- `loading="lazy"` em imagens abaixo da dobra; CSS e JS únicos e
  minificáveis manualmente (sem necessidade de bundler dado o volume do
  projeto).

## 11. Fora de escopo (mas com estrutura preparada)

- Área administrativa (CRUD de produtos, preços, promoções, horários,
  pedidos) — não implementada agora; os dados já vivem isolados em
  `js/data/*.js` para facilitar uma futura migração para um backend/admin.
- Acompanhamento de status de pedido (Novo / Confirmado / Em preparação /
  Saiu para entrega / Concluído / Cancelado) — apenas os rótulos ficam
  documentados aqui; sem UI funcional, pois depende de backend.
- Processamento real de pagamento — o site nunca captura dados de cartão;
  pagamento é somente informativo até a loja confirmar via WhatsApp.
- PWA completo — `manifest.json` básico incluso (nome, ícone, theme-color),
  sem service worker/offline nesta primeira versão.

## 12. Critérios de aceite / verificação manual

Antes de considerar concluído, verificar no navegador (desktop e mobile):

- [ ] Todos os links do header/footer/nav funcionam (scroll suave até a
      seção correta).
- [ ] Busca e filtros de categoria funcionam instantaneamente.
- [ ] Adicionar/remover/alterar quantidade atualiza carrinho, subtotal,
      total e contador do header imediatamente.
- [ ] Carrinho persiste após recarregar a página (localStorage).
- [ ] Produtos "esgotados" não podem ser adicionados ao carrinho.
- [ ] Checkout completo gera mensagem do WhatsApp com todos os campos
      corretos e abre `wa.me/5515997737600`.
- [ ] Layout correto em 375px, 768px e 1440px, sem sobreposição de
      elementos nem barra inferior cobrindo conteúdo.
- [ ] Indicador de aberto/fechado reflete corretamente o horário definido
      em `config.js`.
- [ ] Nenhum dado inventado (preços, endereço, telefone, avaliações) — tudo
      rastreável até a seção 3/4 deste documento ou marcado como
      placeholder/parcial explícito.
