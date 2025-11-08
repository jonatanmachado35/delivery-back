# 🚀 Guia de Execução do Projeto - Sistema de Entregas

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- **Node.js** >= 20
- **Docker** e **Docker Compose**
- **npm** ou **yarn**

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env-exemple .env
```

Edite o arquivo `.env` com suas configurações. As principais variáveis são:

```env
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/quick
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRATION=8h
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=mysecretpassword
LOCATION_HOST=https://us1.locationiq.com/v1
LOCATION_KEY=sua_chave_locationiq
FILE_CLOUD_NAME=seu_cloud_name
FILE_CLOUD_API_KEY=sua_api_key
FILE_CLOUD_SECRET=seu_secret
```

### 3. Iniciar Banco de Dados e Redis com Docker

```bash
cd DOCKER
docker-compose up -d
```

Isso irá iniciar:
- **PostgreSQL com PostGIS** na porta `5432`
- **Redis** na porta `6379`

### 4. Executar Migrações do Prisma

```bash
npx prisma migrate deploy
```

### 5. Executar Seed (Opcional - popular banco com dados iniciais)

```bash
npm run seed
```

## ▶️ Executar o Projeto

### Desenvolvimento (com hot reload)

```bash
npm run start:dev
```

### Produção

```bash
npm run build
npm run start:prod
```

### Debug

```bash
npm run start:debug
```

O servidor estará rodando em: **http://localhost:3000**

## 📚 Documentação Swagger

Após iniciar o servidor, acesse a documentação interativa em:

**http://localhost:3000/docs**

Aqui você pode ver todos os endpoints, fazer testes diretamente e ver os exemplos de requisição/resposta.

## 🧪 Como Testar no Postman

### 1. Configurar Ambiente no Postman

Crie um novo ambiente no Postman com as seguintes variáveis:
- `base_url`: `http://localhost:3000`
- `token`: (será preenchido após o login)

### 2. Endpoints Públicos (sem autenticação)

#### **Criar Conta de Empresa**
```
POST {{base_url}}/auth/signup/company
Content-Type: application/json

{
  "email": "empresa@exemplo.com",
  "password": "senha123",
  "name": "Minha Empresa",
  "phone": "(11) 99999-9999",
  "cnpj": "12.345.678/0001-90",
  "address": {
    "street": "Rua Exemplo",
    "number": "123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "complement": "Sala 10"
  }
}
```

#### **Criar Conta de Entregador**
```
POST {{base_url}}/auth/signup/deliveryman
Content-Type: application/json

{
  "email": "entregador@exemplo.com",
  "password": "senha123",
  "name": "João Entregador",
  "phone": "(11) 99999-9999",
  "cpf": "123.456.789-00",
  "dateOfBirth": "1990-01-01",
  "address": {
    "street": "Rua Exemplo",
    "number": "456",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "vehicle": {
    "licensePlate": "ABC1234",
    "brand": "Honda",
    "model": "CG 160",
    "year": "2023",
    "color": "Azul",
    "vehicleType": "Moto"
  }
}
```

#### **Login**
```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "empresa@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "empresa@exemplo.com",
    "role": "COMPANY",
    ...
  }
}
```

**⚠️ IMPORTANTE:** Copie o `token` da resposta e configure na variável `token` do ambiente do Postman.

#### **Listar Tipos de Veículos** (sem autenticação)
```
GET {{base_url}}/vehicle-types
```

### 3. Endpoints Protegidos (requerem autenticação)

Configure o header `Authorization` em todas as requisições protegidas:

```
Authorization: Bearer {{token}}
```

#### **Listar Entregas (Paginação)**
```
GET {{base_url}}/delivery?page=1&limit=10
Authorization: Bearer {{token}}
```

**Query Parameters opcionais:**
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 100)
- `code`: código da entrega (busca parcial)
- `status`: PENDING | IN_PROGRESS | COMPLETED | CANCELED
- `vehicleType`: tipo de veículo
- `isFragile`: true | false
- `minPrice`: preço mínimo
- `maxPrice`: preço máximo
- `completedFrom`: data inicial (YYYY-MM-DD)
- `completedTo`: data final (YYYY-MM-DD)
- `originCity`: cidade de origem
- `clientCity`: cidade do cliente

#### **Simular Entrega**
```
POST {{base_url}}/delivery/simulate
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "vehicleType": "Carro",
  "clientAddress": {
    "street": "Rua do Destinatário",
    "number": "789",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "useAddressCompany": true
}
```

**Ou com endereço de origem customizado:**
```json
{
  "vehicleType": "Carro",
  "clientAddress": {
    "street": "Rua do Destinatário",
    "number": "789",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "useAddressCompany": false,
  "address": {
    "street": "Rua de Origem",
    "number": "123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  }
}
```

#### **Criar Entrega**
```
POST {{base_url}}/delivery
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "vehicleType": "Carro",
  "height": 30,
  "width": 40,
  "length": 50,
  "weight": 5.5,
  "information": "Produto frágil - manuseio cuidadoso",
  "email": "cliente@exemplo.com",
  "telefone": "(11) 98765-4321",
  "isFragile": true,
  "clientAddress": {
    "street": "Rua do Destinatário",
    "number": "789",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "useAddressCompany": true
}
```

**Resposta:**
```json
{
  "code": "JT-VJ2k"
}
```

#### **Listar Usuários** (apenas ADMIN)
```
GET {{base_url}}/users?page=1&limit=10
Authorization: Bearer {{token}}
```

### 4. Configurar Autenticação Automática no Postman

Para facilitar os testes, você pode:

1. **Criar uma Collection** no Postman
2. **Configurar Pre-request Script** na collection:
   ```javascript
   // Executar login antes de cada requisição (ou criar um teste separado)
   pm.sendRequest({
       url: pm.environment.get("base_url") + "/auth/login",
       method: 'POST',
       header: {
           'Content-Type': 'application/json',
       },
       body: {
           mode: 'raw',
           raw: JSON.stringify({
               email: "empresa@exemplo.com",
               password: "senha123"
           })
       }
   }, function (err, res) {
       if (err) {
           console.log(err);
       } else {
           const jsonData = res.json();
           pm.environment.set("token", jsonData.token);
       }
   });
   ```

3. **Configurar Authorization** na collection:
   - Type: Bearer Token
   - Token: `{{token}}`

## 🔍 Exemplos de Respostas

### Listar Entregas - Resposta Completa
```json
{
  "data": [
    {
      "code": "JT-VJ2k",
      "height": 30,
      "width": 40,
      "length": 50,
      "weight": 5.5,
      "information": "Produto frágil",
      "isFragile": true,
      "price": "92.45",
      "email": "cliente@exemplo.com",
      "telefone": "(11) 98765-4321",
      "status": "PENDING",
      "completedAt": null,
      "vehicleType": "Carro",
      "ClientAddress": {
        "street": "Rua do Destinatário",
        "number": "789",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01234-567",
        "complement": "",
        "country": "Brasil"
      },
      "OriginAddress": {
        "street": "Rua da Empresa",
        "number": "123",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01234-567",
        "complement": "",
        "country": "Brasil"
      },
      "Company": {
        "name": "Minha Empresa"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

## 🛠️ Comandos Úteis

### Prisma
```bash
# Ver dados no Prisma Studio
npx prisma studio

# Gerar cliente Prisma após mudanças no schema
npx prisma generate

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Resetar banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset
```

### Docker
```bash
# Parar containers
cd DOCKER
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar containers
docker-compose restart
```

## ⚠️ Troubleshooting

### Erro de conexão com banco
- Verifique se o Docker está rodando
- Verifique se os containers estão ativos: `docker ps`
- Verifique se a porta 5432 está livre

### Erro de autenticação
- Verifique se o token está correto no header
- Formato: `Authorization: Bearer <token>`
- Verifique se o token não expirou (padrão: 8h)

### Erro ao criar entrega
- Verifique se há tipos de veículos cadastrados: `GET /vehicle-types`
- Verifique se a chave da API de localização está configurada corretamente

## 📝 Notas Importantes

1. **Endpoint `/auth/*`** não requer autenticação
2. **Endpoint `/vehicle-types` (GET)** não requer autenticação
3. Todos os outros endpoints **requerem** o token JWT no header `Authorization`
4. A documentação completa está disponível em `/docs` quando o servidor estiver rodando

