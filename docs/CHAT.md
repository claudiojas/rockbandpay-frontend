# Histórico da Conversa - RockBandPay Backend

Este arquivo resume as decisões, a arquitetura e o progresso do desenvolvimento do backend.

## Objetivo Atual

**Fase 1 do backend concluída.** A API está totalmente implementada, testada e documentada. O próximo grande passo é o início da **Fase 2: Desenvolvimento do Frontend**.

## Arquitetura Definida

Decidimos usar uma arquitetura em camadas para a lógica da aplicação:

`Rotas (Routers)` -> `Casos de Uso (UseCases)` -> `Repositório (Repositories)` -> `Banco de Dados (Prisma)`

- **Rotas:** Camada mais externa, responsável por receber requisições HTTP e devolver respostas.
- **UseCases:** Contém a lógica de negócio e validação de dados (usando `zod`).
- **Repositório:** Camada de acesso a dados, responsável por interagir com o Prisma.

## Correção dos Testes e Debugging

- **Problema Inicial:** Os testes automatizados (`npm test`) estavam falhando com um erro de `timeout`.
- **Solução:**
  1.  Ajustamos o arquivo de teste (`src/routers/tests/createProduct.test.ts`) para inicializar o servidor Fastify usando `app.ready()` dentro de um `beforeAll`.
  2.  Corrigimos a chamada do `supertest` para usar `supertest(server.server)`, que é o objeto `http.Server` correto, disponível após o `app.ready()`.
- **Resultado:** O teste de criação de produto (`should be able to create a new product`) passou com sucesso.

## Finalização da Fase 1 e Estabilização da Suíte de Testes

Após corrigir o teste inicial, continuamos o desenvolvimento para finalizar a Fase 1.

- **Conclusão da API:**
  - [x] Implementada a última funcionalidade da Fase 1: a rota `POST /orders/:orderId/items` para adicionar itens a um pedido.
  - [x] Realizamos um teste manual completo (via cURL) em todas as 10 rotas da API para garantir o funcionamento.

- **Expansão e Depuração Avançada dos Testes:**
  - [x] Escrevemos testes automatizados para todas as rotas restantes (Categorias, Produtos, Pulseiras e Pedidos).
  - **Problema:** Encontramos uma severa instabilidade nos testes. Eles falhavam de forma intermitente com erros de `race condition` (ex: `expected 2 but got 3`) e `Foreign key constraint violated`.
  - **Análise:** A causa raiz foi a execução paralela de arquivos de teste pelo `vitest`, que fazia com que o estado do banco de dados "vazasse" entre os testes, mesmo com hooks de limpeza (`beforeEach`, `afterEach`) e flags (`--file-parallelism=false`).
  - **Solução Definitiva:** Para garantir 100% de isolamento e controle, todos os testes foram **unificados em um único arquivo (`api.test.ts`)**. A limpeza do banco de dados agora é feita com um `beforeEach` que roda antes de cada teste `it` nesse arquivo, garantindo um estado limpo e previsível para cada teste.
  - **Resultado:** A suíte de testes agora contém 10 testes de integração, está 100% estável e cobre todas as rotas da Fase 1.

- **Documentação:**
  - [x] Criado o `README.md` do backend com instruções de setup, scripts e documentação completa da API.
  - [x] Atualizado o `ROADMAP.md` para refletir a conclusão de todas as tarefas da Fase 1.
