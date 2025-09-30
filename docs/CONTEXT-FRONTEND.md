# Contexto do Desenvolvimento do Frontend - RockBandPay

Este documento serve como um ponto de sincronia para desenvolvedores (humanos ou IAs) continuarem o desenvolvimento da aplicação frontend do RockBandPay. Ele descreve o estado atual, as funcionalidades implementadas e as tecnologias utilizadas.

## 1. Ponto Atual do Desenvolvimento

O frontend está **funcionalmente completo** para o fluxo de trabalho do operador de caixa. Todas as principais funcionalidades, desde a abertura do caixa até o registro de vendas e o fechamento do dia, estão implementadas e operacionais.

O foco atual é a adição de uma nova tela de **Dashboard Gerencial**, que fornecerá análises de vendas para proprietários e gerentes.

## 2. Funcionalidades Desenvolvidas

O fluxo de trabalho do operador de caixa está coberto de ponta a ponta pelas seguintes telas:

### a. Abertura de Caixa (Rota: `/login`)
- **Arquivo:** `src/routes/login.lazy.tsx`
- **Funcionalidade:** Tela inicial que força o operador a abrir um novo caixa com um valor inicial antes de poder acessar o sistema. Redireciona automaticamente para o PDV se um caixa já estiver ativo.

### b. Ponto de Venda (PDV) (Rota: `/`)
- **Arquivo:** `src/routes/index.lazy.tsx`
- **Funcionalidade:** A tela principal de operações, onde o operador pode:
  - Navegar pelo cardápio, com filtros por categoria e busca por nome.
  - Associar um pedido a uma pulseira/mesa.
  - Adicionar produtos ao pedido.
  - Consultar o histórico de consumo de uma pulseira a qualquer momento.
  - Finalizar o pedido, enviando-o para a API.

### c. Gerenciamento de Produtos (Rota: `/products/add`)
- **Arquivo:** `src/routes/products.add.lazy.tsx`
- **Funcionalidade:** Formulário para cadastrar novos produtos e, inclusive, adicionar novas categorias de produtos diretamente na mesma tela.

### d. Gerenciamento de Pulseiras (Rota: `/wristbands`)
- **Arquivo:** `src/routes/wristbands.lazy.tsx`
- **Funcionalidade:** Tela para o cadastro de novas pulseiras no sistema.

### e. Fechamento de Conta do Cliente (Rota: `/close-bill/$code`)
- **Arquivo:** `src/routes/close-bill.$code.lazy.tsx`
- **Funcionalidade:** Permite finalizar a conta de uma pulseira específica.
  - Exibe o consumo detalhado.
  - Permite a seleção de um método de pagamento (Dinheiro, PIX, etc.).
  - Registra o pagamento na API.

### f. Fechamento de Caixa (Fim de Expediente) (Rota: `/cash-register/close`)
- **Arquivo:** `src/routes/cash-register.close.lazy.tsx`
- **Funcionalidade:** Apresenta um relatório completo da sessão do caixa.
  - **Resumo Financeiro:** Valor de abertura, total recebido, valor esperado.
  - **Detalhes de Pagamento:** Total por método (Dinheiro, PIX, etc.).
  - **Produtos Vendidos:** Lista de todos os itens vendidos na sessão.
  - Permite encerrar o expediente do caixa.

### g. (Concluído) Dashboard Gerencial (Rota: `/dashboard`)
- **Arquivo:** `src/routes/dashboard.lazy.tsx`
- **Funcionalidade:** Uma nova tela, acessível a partir da página de login, destinada a gerentes.
  - Exibe relatórios visuais e textuais sobre o desempenho das vendas.
  - Análises semanais e mensais.
  - Ranking de produtos mais vendidos.
  - Gráficos de horários de pico de vendas.

## 3. Estrutura do Projeto

- `src/routes/`: Contém os componentes de página para cada rota da aplicação, utilizando **TanStack Router**.
- `src/components/`: Componentes React reutilizáveis (`ui`) e específicos de páginas (`page`).
- `src/hooks/`: Custom hooks para encapsular lógica de busca de dados (`useProducts`, `useCashRegisterStatus`, etc.).
- `src/lib/`: Utilitários e a instância configurada do `axios`.
- `src/routeTree.gen.ts`: Arquivo gerado pelo TanStack Router que define a árvore de rotas.

## 4. Tecnologias e Bibliotecas

- **Framework:** React 19
- **Linguagem:** TypeScript
- **Build Tool:** Vite
- **Roteamento:** TanStack Router
- **Estilização:** Tailwind CSS
- **Componentes de UI:** shadcn/ui
- **Requisições HTTP:** Axios
- **Gerenciamento de Estado (Server):** TanStack Query
- **Gráficos:** Recharts
