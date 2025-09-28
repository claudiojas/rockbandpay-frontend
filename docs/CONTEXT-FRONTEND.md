# Contexto do Desenvolvimento do Frontend - RockBandPay

Este documento serve como um ponto de sincronia para desenvolvedores (humanos ou IAs) continuarem o desenvolvimento da aplicação frontend do RockBandPay. Ele descreve o estado atual, as funcionalidades implementadas e as tecnologias utilizadas.

## 1. Ponto Atual do Desenvolvimento

O desenvolvimento atual está focado na construção das interfaces para o operador de caixa. A estrutura base do projeto está configurada, e as principais telas de operação estão sendo criadas. Acabamos de finalizar a implementação da tela de **Detalhes e Fechamento de Caixa**.

**Contexto Pendente:** Estamos aguardando uma verificação do backend sobre a origem e a regra de negócio do campo `expectedInCash`, que é exibido na tela de fechamento de caixa. A implementação atual consome este campo diretamente da API (`GET /cash-register/active-details`).

## 2. Funcionalidades Desenvolvidas

Até o momento, as seguintes funcionalidades e telas foram implementadas:

### a. Tela de Ponto de Venda (Rota: `/`)
- **Arquivo:** `src/routes/index.lazy.tsx`
- **Funcionalidade:** Permite que o operador de caixa:
  - Visualize produtos e categorias.
  - Filtre produtos por nome e categoria.
  - Adicione produtos a um pedido, associando-os a um código de pulseira (`wristbandCode`).
  - Visualize o resumo do pedido atual e o valor total.
  - Consulte o histórico de consumo de uma pulseira.
  - Finalize um pedido, enviando os dados para o backend.
- **Navegação:** Contém um link no cabeçalho para a tela de "Fechar Caixa".

### b. Tela de Detalhes e Fechamento de Caixa (Rota: `/cash-register/close`)
- **Arquivo:** `src/routes/cash-register.close.lazy.tsx`
- **Funcionalidade:**
  - Busca e exibe um resumo completo da sessão do caixa ativo ao carregar a tela (endpoint `GET /cash-register/active-details`).
  - Apresenta um **Resumo Financeiro**: Valor de Abertura, Total Recebido e Valor Esperado em Caixa.
  - Mostra um **Detalhamento por Método de Pagamento**.
  - Lista todos os **Produtos Vendidos** durante a sessão, com quantidade e valor total por produto.
  - Permite ao operador **Fechar o Caixa** através de um botão que aciona o endpoint `POST /cash-register/close`.
  - Trata casos de erro, como quando nenhum caixa está aberto.

### c. Outras Rotas e Componentes
- **Login, Adicionar Produto, Criar Pulseira, etc.:** Existem links para essas rotas na navegação principal (`src/routes/__root.tsx`), indicando que são funcionalidades planejadas ou em desenvolvimento.
- **Componentes de UI:** O projeto utiliza componentes reutilizáveis de `src/components/ui` (Button, Card, etc.), baseados em `shadcn/ui`.

## 3. Estrutura do Projeto

O projeto segue uma estrutura organizada e baseada em funcionalidades:

- `src/routes/`: Contém os componentes de página para cada rota da aplicação, utilizando **TanStack Router** para o roteamento baseado em arquivos.
- `src/components/`: Contém componentes React reutilizáveis, divididos em `page` (componentes específicos de uma página) e `ui` (componentes genéricos de UI).
- `src/hooks/`: Contém custom hooks para encapsular lógica de busca de dados, como `useProducts` e `useCategories`.
- `src/lib/`: Utilitários e configurações, como a instância configurada do `axios` para comunicação com a API.
- `src/routeTree.gen.ts`: Arquivo gerado automaticamente pelo TanStack Router que define a árvore de rotas da aplicação.

## 4. Tecnologias e Bibliotecas

- **Framework:** React 19
- **Linguagem:** TypeScript
- **Build Tool:** Vite
- **Roteamento:** TanStack Router (com roteamento baseado em arquivos)
- **Estilização:** Tailwind CSS
- **Componentes de UI:** shadcn/ui (ou uma implementação similar)
- **Requisições HTTP:** Axios
- **Gerenciamento de Estado (Server):** TanStack Query (usado nos hooks `useProducts`, etc.)

Qualquer desenvolvedor pode continuar o trabalho clonando o repositório, instalando as dependências (`npm install`) e iniciando o servidor de desenvolvimento (`npm run dev`).
