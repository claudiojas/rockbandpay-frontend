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

## Fase 2: Adaptação para Plataforma SaaS (Próximo Passo)

**Visão:** Alinhar o frontend com a nova arquitetura multi-tenant do backend.

### Itens a Desenvolver:

1.  **Novo Fluxo de Cadastro e Login:**
    *   Criar uma tela de **cadastro de empresa (tenant)**, que será o primeiro passo para um novo cliente usar o serviço.
    *   Ajustar a tela de login para autenticar no sistema mestre do backend, que gerencia todos os tenants.
    *   Implementar a lógica para lidar com subdomínios ou rotas específicas de cada tenant (ex: `cliente-a.rockbandpay.com` ou `rockbandpay.com/cliente-a`).

2.  **Ajustes Gerais na Aplicação:**
    *   Garantir que o token de autenticação (JWT, por exemplo) obtido após o login seja enviado em todas as requisições subsequentes à API.
    *   O restante da aplicação deve continuar funcionando como está, pois a API se encarregará de direcionar as requisições para o banco de dados correto do tenant. O frontend não precisará saber qual banco de dados está sendo usado.
