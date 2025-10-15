# Contexto do Desenvolvimento do Frontend - RockBandPay

Este documento descreve o estado atual, a arquitetura e os fluxos de trabalho da aplicação frontend do RockBandPay.

## 1. Arquitetura e Gerenciamento de Estado

O frontend utiliza uma arquitetura moderna com separação de responsabilidades e um gerenciamento de estado centralizado para certos domínios.

- **Framework:** React 19 com Vite
- **Roteamento:** TanStack Router (baseado em arquivos)
- **Gerenciamento de Estado (Server):** TanStack Query (React Query) para caching de dados da API.
- **Gerenciamento de Estado (Global):** React Context (`TableContext`) para gerenciar a lista de todas as mesas ativas e disponibilizá-la para múltiplos componentes.
- **Estilização:** Tailwind CSS com componentes `shadcn/ui`.

## 2. Fluxos de Trabalho e Telas Principais

A aplicação é dividida em telas com responsabilidades claras:

### a. Ponto de Venda (PDV) (Rota: `/`)
- **Arquivo:** `src/routes/index.lazy.tsx`
- **Função:** Tela principal do operador de caixa.
- **Fluxo:** O menu de seleção "Mesa Ativa" é populado usando o hook `useActiveSessions`, que busca dados do endpoint `GET /overview/sessions`. Isso garante que o operador só possa adicionar itens a sessões que já foram iniciadas (seja pelo cliente via QR Code ou manualmente pelo gerente). Isso resolve o erro 404 que ocorria ao tentar adicionar um pedido a uma mesa sem sessão.

### b. Gerenciamento de Mesas (Rota: `/manage-tables`)
- **Arquivo:** `src/routes/manage-tables.lazy.tsx`
- **Função:** Tela administrativa para o gerente configurar o salão.
- **Fluxo de Criação:** Permite criar novas mesas informando seu número.
- **Fluxo de Arquivamento (Soft Delete):** Permite selecionar múltiplas mesas e "Arquivá-las". Isso chama o endpoint `POST /tables/archive` que apenas desativa as mesas (`isActive = false`), preservando o histórico de vendas. A tela possui uma trava de segurança que impede o arquivamento de mesas que tenham sessões ativas.
- **Fluxo de Início de Sessão Manual:** Para cada mesa livre, há um botão "Iniciar Sessão". Isso permite que o gerente inicie uma sessão para clientes que não usam o QR Code, chamando o endpoint `POST /sessions`.

### c. Painel de Controle (Rota: `/overview`)
- **Arquivo:** `src/routes/overview.lazy.tsx`
- **Função:** Um painel de monitoramento em tempo real para o gerente.
- **Fluxo:** A tela busca e exibe **apenas** as sessões ativas, mostrando o total consumido em cada uma. Ao selecionar uma sessão, o gerente pode ver todos os itens e tem a opção de **excluir um item individualmente** para corrigir erros de lançamento (chama o endpoint `DELETE /orders/items/:itemId`).

### e. Gerenciamento de Produtos (Rota: `/manage-products`)
- **Arquivo:** `src/routes/manage-products.lazy.tsx`
- **Função:** Tela de administração que lista todos os produtos em uma tabela.
- **Fluxo:** Permite a edição de detalhes (nome, preço) e a adição de estoque para cada produto através de um modal (`EditProductModal`). Utiliza o hook `useProducts` para buscar os dados e `useMutation` para enviar as atualizações.

### f. Painel da Cozinha (Rota: `/kitchen`)
- **Arquivo:** `src/routes/kitchen.lazy.tsx`
- **Função:** Painel em tempo real para a cozinha, no estilo Kanban.
- **Fluxo:** Conecta-se ao backend via WebSocket para receber novos pedidos instantaneamente na coluna "A Fazer". A cozinha pode mover os pedidos para "Em Preparo". Ao finalizar, o pedido é marcado como `READY` e desaparece da tela.

### g. Monitor do Garçom (Rota: `/waiter-monitor`)
- **Arquivo:** `src/routes/waiter-monitor.lazy.tsx`
- **Função:** Painel para os garçons visualizarem os pedidos que estão prontos para serem entregues.
- **Fluxo:** Utiliza o novo hook `useOrdersByStatus('READY')` para buscar e exibir apenas os pedidos prontos. O garçom pode marcar um pedido como `DELIVERED`, que o remove da sua tela e finaliza o ciclo de entrega.

### h. Dashboard Gerencial (Rota: `/dashboard`)
- **Arquivo:** `src/routes/dashboard.lazy.tsx`
- **Função:** Apresentar uma visão geral do negócio com métricas e relatórios visuais.
- **Fluxo:** A página utiliza diversos hooks customizados (`useSalesByTable`, `useSalesByPaymentMethod`, etc.) para buscar dados já agregados pela API. Os dados são exibidos em vários gráficos (barras, pizza, linhas) usando a biblioteca Recharts. A página também implementa filtros de período (semana/mês) que atualizam dinamicamente todos os relatórios.