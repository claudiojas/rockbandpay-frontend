# Roadmap de Desenvolvimento - RockBandPay Frontend

---

## Fase 1: MVP do Operador de Caixa (Concluída)

O objetivo desta fase foi criar uma interface de usuário completamente funcional para o fluxo de trabalho diário de um operador de caixa. Todas as funcionalidades essenciais, desde o login e abertura de caixa até o lançamento de pedidos, gerenciamento de mesas/produtos e fechamento de conta/caixa, foram implementadas.

### Funcionalidades Concluídas:

1.  **Estrutura do Projeto:** Configuração do ambiente com React, TypeScript, Vite e TanStack.
2.  **Telas Principais:**
    *   Tela de Abertura de Caixa (`/login`)
    *   Ponto de Venda (PDV) (`/`)
    *   Gerenciamento de Produtos e Mesas (`/products/add`, `/manage-tables`)
    *   Fechamento de Conta do Cliente (`/close-bill/:code`)
    *   Fechamento de Caixa do Operador (`/cash-register/close`)
3.  **Funcionalidades de Gerenciamento e UX:**
    *   **Dashboard Gerencial (`/dashboard`):** Implementado um dashboard completo com múltiplos relatórios para análise de negócio. Utiliza a biblioteca Recharts para visualização de dados e hooks customizados para buscar dados agregados do backend. Funcionalidades incluem:
        - Faturamento por Mesa.
        - Faturamento por Forma de Pagamento.
        - Desempenho de Produtos.
        - Vendas ao Longo do Tempo.
        - Filtros por período (semana/mês) que atualizam todos os relatórios dinamicamente.
    *   **Tela de Consulta de Sessões (`/overview`):**
        *   Alternância de visualização (pendentes vs. todas).
        *   Exclusão de pedidos (hard delete).
        *   Desativação de mesas (soft delete).

---

## Fase 2: Gerenciamento e Cozinha (Concluída)

**Visão:** Expandir a aplicação para dar aos gerentes controle total sobre o ciclo de vida dos produtos e criar painéis de tempo real para a cozinha e para os garçons, otimizando o fluxo de preparação e entrega de pedidos.

### Itens Desenvolvidos:

1.  **Gerenciamento Completo de Produtos:**
    *   **Status:** Concluído.
    *   **Ação:** Foi criada uma nova página de "Gerenciamento de Produtos" (`/manage-products`) que permite listar, editar detalhes (nome, preço) e adicionar estoque a produtos existentes através de um modal.
    *   A tela de "Adicionar Produto" agora inclui um campo para "Estoque Inicial".

2.  **Painel da Cozinha (Kanban):
    **
    *   **Status:** Concluído.
    *   **Ação:** Foi criada a página "Cozinha" (`/kitchen`) que se conecta ao backend via WebSockets.
    *   Novos pedidos aparecem em tempo real na coluna "A Fazer".
    *   A cozinha pode mover os pedidos para "Em Preparo". Ao finalizar, o pedido é marcado como "Pronto" e desaparece da tela da cozinha, finalizando a responsabilidade da equipe.

3.  **Monitor do Garçom:
    **
    *   **Status:** Concluído.
    *   **Ação:** Foi criada a página "Monitor do Garçom" (`/waiter-monitor`) que exibe todos os pedidos marcados como "Prontos" pela cozinha.
    *   O garçom pode marcar um pedido como "Entregue", que atualiza seu status final no sistema e o remove da tela do monitor.

---

## Fase 3: Adaptação para Plataforma SaaS

**Visão:** Alinhar o frontend (tanto a aplicação do operador quanto a nova WebApp do cliente) com a arquitetura multi-tenant do backend.

*Esta fase mantém os mesmos itens de desenvolvimento descritos anteriormente (novo fluxo de cadastro/login, tratamento de subdomínios/rotas de tenant), mas será executada após a conclusão da Fase 2.*
