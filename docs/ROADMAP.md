# Roadmap de Desenvolvimento - RockBandPay

---

## Fase 1: Finalizar a Configuração e a Base do Backend

O objetivo desta fase é ter um ambiente de desenvolvimento funcional e as operações básicas do banco de dados prontas.

### Concluído

1.  **Configurar o Banco de Dados:**
    *   Instalação do PostgreSQL.
    *   Criação do banco de dados da aplicação.
    *   Configuração da `DATABASE_URL` no arquivo `.env`.

2.  **Aplicar o Schema no Banco:**
    *   Execução do comando `npx prisma migrate dev` para criar as tabelas iniciais.

3.  **Implementação de Rotas da API:**
    *   **Gerenciamento de Produtos:**
        *   `POST /products` (para criar um produto)
        *   `GET /products` (para listar todos os produtos)
        *   `PUT /products/:id` (para atualizar um produto)
        *   `GET /categories/:id/products` (para listar produtos de uma categoria)
    *   **Gerenciamento de Categorias:**
        *   `POST /categorie` (para criar uma categoria)
    *   **Gerenciamento de Pulseiras (Wristbands):**
        *   `POST /wristbands` (para registrar uma nova pulseira)
        *   `GET /wristbands/:code` (para consultar uma pulseira pelo código)
    *   **Gerenciamento de Pedidos (Orders):**
        *   `POST /orders` (para criar um novo pedido associado a uma pulseira)
        *   `GET /orders/:wristbandId` (para ver o consumo de uma pulseira)
        *   `POST /orders/:orderId/items` (para adicionar itens a um pedido)

4.  **Garantia de Qualidade e Documentação:**
    *   Criação de suíte de testes automatizados para todas as rotas da API da Fase 1.
    *   Criação do arquivo `README.md` com a documentação completa do projeto.

---

## Fase 2: Desenvolvimento do Frontend (Concluída)

O objetivo foi criar a interface que será usada para gerenciar os pedidos.

### Concluído

1.  **Estruturar o Projeto Frontend:**
    *   O diretório `frontend` foi iniciado com **React com TypeScript**.
    *   A comunicação com a API do backend foi configurada.

2.  **Desenvolver as Telas Principais:**
    *   **Tela de "Caixa" / Registro de Pedidos:** Interface para registrar pedidos.
    *   **Tela de Consulta e Pagamento:** Tela para consultar e pagar contas.
    *   **Telas de Gerenciamento:** Telas para gerenciar produtos e pulseiras.
    *   **Tela de Fechamento de Caixa:** Tela com o resumo do dia para o operador.

---

## Fase 3: Lógica de Negócio e Experiência do Usuário (Concluída)

O foco aqui foi refinar as regras de negócio e a experiência do usuário.

### Concluído

1.  **Refinar a Experiência do Usuário:**
    *   **Dashboard Gerencial:** Implementação de uma tela com métricas e gráficos de vendas.
    *   **Gerenciamento de Pedidos e Mesas:** Adicionada a funcionalidade de exclusão de pedidos e desativação de mesas na tela de consulta, tornando o fluxo do operador mais flexível e à prova de erros.

### Próximos Passos

1.  **Implementar a Lógica de Pagamento no Backend:**
    *   Criar a rota `POST /payments` que calcula o total de um pedido.
    *   Integrar com uma API de pagamentos (como a do PIX).

2.  **Refinar a Experiência do Usuário:**
    *   No frontend, criar a interface para exibir o QR code do PIX ou processar o pagamento com cartão.
    *   Implementar feedback visual para o status do pedido e do pagamento.
