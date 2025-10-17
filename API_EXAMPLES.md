# 📋 Exemplos Práticos de Uso da API

Este arquivo contém exemplos prontos para testar todos os endpoints da API.

## 🎯 Fluxo Completo de Uso

### 1. Registrar um novo cliente

```bash
curl -X POST http://localhost:3001/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "senha123",
    "cpf": "12345678900",
    "endereco": "Rua ABC, 123",
    "dataNascimento": "1990-01-01"
  }'
```

### 2. Fazer login como cliente

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "senha123"
  }'
```

**Resposta:**

```json
{
  "message": "Login realizado com sucesso.",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "usuario": {
    "id": "uuid-aqui",
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipo": "cliente"
  }
}
```

### 3. Usar o token para acessar dados protegidos

```bash
# Substitua {TOKEN} pelo accessToken recebido no login
# Substitua {ID} pelo id do usuário

curl -X GET http://localhost:3001/clientes/{ID} \
  -H "Authorization: Bearer {TOKEN}"
```

### 4. Renovar o token quando expirar

```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{REFRESH_TOKEN}"
  }'
```

### 5. Fazer logout

```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{REFRESH_TOKEN}"
  }'
```

## 🧪 Testes de Segurança

### Tentar acessar rota protegida sem token

```bash
curl -X GET http://localhost:3001/clientes
# Deve retornar: {"erro": "Token não fornecido."}
```

### Tentar acessar rota protegida com token inválido

```bash
curl -X GET http://localhost:3001/clientes \
  -H "Authorization: Bearer token_invalido"
# Deve retornar: {"erro": "Token inválido ou expirado."}
```

### Teste de rate limiting (5 tentativas em 15min)

```bash
# Tentar fazer login 6 vezes seguidas
for i in {1..6}; do
  curl -X POST http://localhost:3001/auth/login/cliente \
    -H "Content-Type: application/json" \
    -d '{"email": "joao@email.com", "senha": "senha_errada"}'
  echo "\nTentativa $i"
done
# A 6ª tentativa deve retornar: {"erro": "Muitas tentativas de login..."}
```

## 🔍 Testando com Postman/Insomnia

### 1. Criar variáveis de ambiente

```
baseUrl: http://localhost:3001
accessToken: (será preenchido automaticamente após login)
refreshToken: (será preenchido automaticamente após login)
userId: (será preenchido automaticamente após login)
```

### 2. Script após login (Postman)

```javascript
// Na aba "Tests" da requisição de login
const response = pm.response.json();

if (response.accessToken) {
  pm.environment.set("accessToken", response.accessToken);
  pm.environment.set("refreshToken", response.refreshToken);
  pm.environment.set("userId", response.usuario.id);
}
```

### 3. Usar variáveis nas requisições

```
GET {{baseUrl}}/clientes/{{userId}}
Authorization: Bearer {{accessToken}}
```

## ⚠️ Notas Importantes

1. **CORS**: Configure o `FRONTEND_URL` no .env para o domínio do seu frontend
2. **Secrets**: Altere as chaves JWT no .env para valores seguros em produção
3. **Tokens**: Os tokens JWT têm tempo de expiração configurável (padrão: 15 minutos para accessToken)
