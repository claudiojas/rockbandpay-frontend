# RockBandPay API

Este é o backend para o sistema de pagamento cashless RockBandPay, projetado para gerenciar produtos, pedidos e consumo em eventos.

---

## Tecnologias Utilizadas

*   **Framework:** [Fastify](https://www.fastify.io/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
*   **Executor de Testes:** [Vitest](https://vitest.dev/)
*   **Executor de TypeScript:** [tsx](https://github.com/esbuild-kit/tsx)

---

## Começando

Siga as instruções abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

*   Node.js (v18 ou superior)
*   npm
*   Git
*   Docker (para rodar o PostgreSQL facilmente)

### Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone git@github.com:claudiojas/rockbandpay-api.git
    cd rockbandpay-api
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Banco de Dados:**
    O projeto usa PostgreSQL. A forma mais fácil de subir uma instância é com o Docker Compose fornecido:
    ```bash
    docker-compose up -d
    ```

4.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example` (se houver) ou com o seguinte conteúdo:
    ```env
    DATABASE_URL="postgresql://docker:docker@localhost:5432/rockbandpay?schema=public"
    ```

5.  **Aplique as migrações do banco de dados:**
    Este comando irá criar as tabelas no banco de dados com base no schema do Prisma.
    ```bash
    npx prisma migrate dev
    ```

---

## Scripts Disponíveis

*   **Rodar em modo de desenvolvimento (com hot-reload):**
    ```bash
    npm run dev
    ```

*   **Rodar os testes automatizados:**
    ```bash
    npm run test
    ```

---

## Documentação da API

### Categorias

#### Criar uma nova categoria
*   **Método:** `POST`
*   **Endpoint:** `/categorie`
*   **Corpo (Body):**
    ```json
    {
      "name": "Bebidas",
      "isActive": true
    }
    ```
*   **Exemplo com cURL:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"name": "Bebidas", "isActive": true}' http://localhost:3000/categorie
    ```

#### Listar produtos de uma categoria
*   **Método:** `GET`
*   **Endpoint:** `/categories/:id/products`
*   **Exemplo com cURL:**
    ```bash
    curl http://localhost:3000/categories/cmfwtevf50001pgrl9da8cxau/products
    ```

### Produtos

#### Criar um novo produto
*   **Método:** `POST`
*   **Endpoint:** `/products`
*   **Corpo (Body):**
    ```json
    {
      "name": "Suco de Laranja",
      "price": 8.50,
      "categoryId": "cmfwtevf50001pgrl9da8cxau"
    }
    ```
*   **Exemplo com cURL:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"name": "Suco de Laranja", "price": 8.50, "categoryId": "..."}' http://localhost:3000/products
    ```

#### Listar todos os produtos
*   **Método:** `GET`
*   **Endpoint:** `/products`
*   **Exemplo com cURL:**
    ```bash
    curl http://localhost:3000/products
    ```

#### Atualizar um produto
*   **Método:** `PUT`
*   **Endpoint:** `/products/:id`
*   **Corpo (Body):**
    ```json
    {
      "price": 9.00
    }
    ```
*   **Exemplo com cURL:**
    ```bash
    curl -X PUT -H "Content-Type: application/json" -d '{"price": 9.00}' http://localhost:3000/products/cmfwtf7m30002pgrlpya7rxgw
    ```

### Pulseiras (Wristbands)

#### Registrar uma nova pulseira
*   **Método:** `POST`
*   **Endpoint:** `/wristband`
*   **Corpo (Body):**
    ```json
    {
      "code": "ROCK-12345",
      "qrCode": "some-qr-code-data-12345"
    }
    ```
*   **Exemplo com cURL:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"code": "ROCK-12345", "qrCode": "some-qr-code-data-12345"}' http://localhost:3000/wristband
    ```

#### Consultar pulseira por código
*   **Método:** `GET`
*   **Endpoint:** `/wristbands/:code`
*   **Exemplo com cURL:**
    ```bash
    curl http://localhost:3000/wristbands/ROCK-12345
    ```

### Pedidos (Orders)

#### Criar um novo pedido
*   **Método:** `POST`
*   **Endpoint:** `/orders`
*   **Corpo (Body):**
    ```json
    {
      "wristbandId": "cmfwth0000003pgrl3qpmrstb"
    }
    ```
*   **Exemplo com cURL:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"wristbandId": "..."}' http://localhost:3000/orders
    ```

#### Adicionar item a um pedido
*   **Método:** `POST`
*   **Endpoint:** `/orders/:orderId/items`
*   **Corpo (Body):**
    ```json
    {
      "productId": "cmfwtf7m30002pgrlpya7rxgw",
      "quantity": 2,
      "unitPrice": 9.00,
      "totalPrice": 18.00
    }
    ```
*   **Exemplo com cURL:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"productId": "...", "quantity": 2, ...}' http://localhost:3000/orders/cmfwti92r0005pgrl10xikapu/items
    ```

#### Ver o consumo de uma pulseira
*   **Método:** `GET`
*   **Endpoint:** `/orders/:wristbandId`
*   **Exemplo com cURL:**
    ```bash
    curl http://localhost:3000/orders/cmfwth0000003pgrl3qpmrstb
    ```
