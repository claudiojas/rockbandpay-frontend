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

### d. Fechamento de Conta (Rota: `/close-bill/$code`)
- **Arquivo:** `src/routes/close-bill.$code.lazy.tsx`
- **Função:** Finalizar e pagar a conta de uma sessão.
- **Fluxo:** Após o pagamento ser confirmado, a lógica agora invalida o cache da query `active-sessions` (`['active-sessions']`). Isso garante que, ao voltar para a tela principal, a lista de mesas ativas esteja sempre atualizada.