# Roadmap de Desenvolvimento - RockBandPay Frontend

---

## Fase 1: MVP do Operador de Caixa (Concluída)

O objetivo desta fase foi criar uma interface de usuário completamente funcional para o fluxo de trabalho diário de um operador de caixa. Todas as funcionalidades essenciais, desde o login e abertura de caixa até o lançamento de pedidos, gerenciamento de mesas/produtos e fechamento de conta/caixa, foram implementadas.

### Funcionalidades Concluídas:

1.  **Estrutura do Projeto:** Configuração do ambiente com React, TypeScript, Vite e TanStack.
2.  **Telas Principais:**
    *   Tela de Abertura de Caixa (`/login`)
    *   Ponto de Venda (PDV) (`/`)
    *   Gerenciamento de Produtos e Pulseiras (`/products/add`, `/wristbands`)
    *   Fechamento de Conta do Cliente (`/close-bill/:code`)
    *   Fechamento de Caixa do Operador (`/cash-register/close`)
3.  **Funcionalidades de Gerenciamento e UX:**
    *   Dashboard Gerencial com métricas de vendas (`/dashboard`).
    *   Tela de Consulta de Mesas (`/wristbands-overview`) com:
        *   Alternância de visualização (pendentes vs. todas).
        *   Exclusão de pedidos (hard delete).
        *   Desativação de mesas (soft delete).

---

## Fase 2: Implementação do "Garçom Automatizado" (Próximo Passo)

**Visão:** Expandir a experiência do usuário criando interfaces para o cliente final e para a cozinha, permitindo um fluxo de autoatendimento completo.

### Itens a Desenvolver:

1.  **Criar a WebApp do Cliente (Novo Projeto Frontend):**
    *   **Objetivo:** Permitir que o cliente visualize o cardápio, faça pedidos e pague sua conta diretamente da mesa.
    *   **Tecnologias:** React, Vite, TanStack Query, Axios.
    *   **Funcionalidades:**
        *   Leitura de QR Code para iniciar a sessão da mesa.
        *   Navegação no cardápio (consumindo `GET /products`).
        *   Envio de pedidos (consumindo `POST /orders`).
        *   Visualização da comanda em tempo real (via WebSockets ou polling para `GET /orders/my-session`).
        *   Integração com gateway de pagamento para fechar a conta.

2.  **Criar o Painel da Cozinha (Nova Tela no Frontend Atual):**
    *   **Objetivo:** Exibir novos pedidos em tempo real para a equipe da cozinha.
    *   **Tecnologia:** React, **WebSockets**.
    *   **Funcionalidade:** Uma nova rota (ex: `/kitchen-display`) que se conecta ao backend via WebSocket e renderiza os pedidos à medida que chegam, permitindo a atualização de seu status (ex: "Preparando", "Pronto").

---

## Fase 3: Adaptação para Plataforma SaaS

**Visão:** Alinhar o frontend (tanto a aplicação do operador quanto a nova WebApp do cliente) com a arquitetura multi-tenant do backend.

*Esta fase mantém os mesmos itens de desenvolvimento descritos anteriormente (novo fluxo de cadastro/login, tratamento de subdomínios/rotas de tenant), mas será executada após a conclusão da Fase 2.*
