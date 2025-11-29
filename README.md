# Back-end – Connect Digital

API responsável pela criação e acompanhamento de pedidos, integração com o fluxo de pagamento (Pix/AbacatePay) e comunicação com serviços externos (como Evolution).

> ℹ️ Este README é específico do **back-end**.  
> Para detalhes da interface web, consulte o [README do front-end](https://github.com/pedro-v-bezerra/connect-digital-frontend).

---

## 🚀 Tecnologias principais

- **NestJS 11** – Framework Node.js modular e opinativo, ideal para construir APIs escaláveis.
- **@nestjs/axios + Axios** – Cliente HTTP para comunicação com gateways externos (Evolution, AbacatePay).
- **@nestjs/config** – Gerenciamento centralizado de variáveis de ambiente.
- **class-validator + class-transformer** – Validação e transformação de DTOs.
- **RxJS** – Abstrações reativas utilizadas internamente pelo NestJS.

---

## 🛠️ Ferramentas de desenvolvimento

- **TypeScript** – Tipagem estática para maior segurança e legibilidade do código.
- **ESLint + Prettier** – Padronização de código e formatação automática.
- **Husky + lint-staged** – Execução de linters e formatadores antes dos commits.
- **Nest CLI** – Geração de módulos, services, controllers e estrutura de projeto.
- **Swagger** – Documentação das rotas e DTO's definidos.

---

## 📎 Requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

| Ferramenta     | Versão recomendada |
|----------------|--------------------|
| **Node.js**    | >= 22.x            |
| **npm ou yarn**| Última versão estável |

> O projeto foi desenvolvido e testado com Node 22.11.0.

---

## 🔐 Variáveis de ambiente

Dados sensíveis (como **API key da Evolution** e **chave da AbacatePay**) **não** estão hardcoded no código.  
Eles são carregados via arquivo `.env` e acessados através do `@nestjs/config`.

Na pasta `backend`, crie um arquivo **`.env`** com, por exemplo:

```env
# Porta da API
PORT=3001

# Evolution
EVOLUTION_API_KEY=sua_chave_da_evolution
EVOLUTION_BASE_URL=sua_url_da_evolution
EVOLUTION_INSTANCE_NAME=seu_nome_da_instancia

# AbacatePay
ABACATEPAY_API_KEY=sua_chave_da_abacatepay_aqui
ABACATEPAY_BASE_URL=https://api.abacatepay.com.br
```

---

## ▶️ Instruções para execução

1.**Instalar dependências**

Na raiz do projeto:

```bash
npm install
```

2.**Configurar o** ```.env```

Garanta que o arquivo .env exista na raiz do backend, conforme o exemplo da seção anterior ou arquivo .env.example na raiz do repositório.

3.**Rodar em modo desenvolvimento**

```bash
nest start
```
ou
```bash
npm run start:dev
```

A API ficará disponível em (por exemplo):

```text
http://localhost:3001
```
O front-end irá consumir essa API. Veja o [README do front-end](https://github.com/pedro-v-bezerra/connect-digital-frontend) para configurar NEST_API_URL.

---

## 📡 Endpoints (resumo)

Este é um resumo das rotas. Após rodar a aplicação, veja a documentação completa em [/api-docs#](http://localhost:3001/api-docs#/).

1.**Criar pedido**

```http
POST /orders
```

Body (exemplo):

```JSON
{
  "customerName": "Fulano",
  "email": "fulano@hotmail.com",
  "cpf": "999.999.999-99",
  "phone": "55999999999",
  "amount": 10000, //em centavos
  "address": "Rua 1, Lote 5",
  "productName": "Teste"
}
```
Resposta (exemplo):

```JSON
{
  "orderId": "123",
  "status": "pending",
  "pix": {
    "copyPasteKey": "0002010...",
    "qrCodeImageUrl": "data:image/png;base64..."
  }
}
```

2.**Consultar pedido**

```http
GET /orders/:id/status
```

Resposta (exemplo):

```JSON
{
  "orderId": "123",
  "status": "PENDING",
  "expiresAt": "2025-11-29T16:03:37.096Z"
}
```

3.**Simular pagamento**

Essa rota foi criada com o intuito de facilitar a simulação do pagamento.
```http
POST /orders/:id/simulate-payment
```

Resposta (exemplo):

```JSON
{
  "orderId": "123",
  "status": "PAID",
  "expiresAt": "2025-11-29T16:03:37.096Z"
}
```

---

## 📦 Bibliotecas utilizadas

### Dependências principais

| Biblioteca     | Motivo da escolha |
|----------------|--------------------|
| **@nestjs/common/core**    | Núcleo do NestJS, responsável pela arquitetura modular e injeção de dependências.            |
| **@nestjs/platform-express**| Adaptação HTTP baseada em Express, simples e consolidada. |
| **@nestjs/axios + axios**| Cliente HTTP para chamadas às APIs da Evolution e AbacatePay.|
| **@nestjs/config**| Gerenciamento centralizado das variáveis de ambiente (.env). |
| **class-validator**| Validação declarativa de DTOs (body, params, query). |
| **class-transformer**| Transformação de objetos (por exemplo, conversão de payloads em classes). |
| **rxjs**| Integrações reativas internas do NestJS. |

---

### 💡 Possíveis melhorias e próximos passos
- Implementar testes unitários e de integração cobrindo regras de negócio críticas.
- Adicionar logs estruturados (ex.: para integrações com Evolution e AbacatePay).
- Implementar mecanismos de retry/backoff em caso de falha nos gateways externos.
- Expor documentação da API (ex.: Swagger/OpenAPI).
- Introduzir camada de persistência (banco de dados) para histórico mais completo de pedidos e notificações de pagamento.

---

#### Desenvolvido por Pedro Victor Lima