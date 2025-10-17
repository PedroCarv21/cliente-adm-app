import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔐 Sistema de Autenticação Ativo`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`\n📋 Endpoints disponíveis:`);
  console.log(`\n🔑 Autenticação:`);
  console.log(`   POST   /auth/login`);
  console.log(`   POST   /auth/refresh`);
  console.log(`   POST   /auth/logout`);
  console.log(`\n👥 Clientes:`);
  console.log(`   GET    /clientes (🔒 Autenticado)`);
  console.log(`   GET    /clientes/:id (🔒 Autenticado)`);
  console.log(`   POST   /clientes (Público)`);
  console.log(`   PUT    /clientes/:id (🔒 Autenticado)`);
  console.log(`   DELETE /clientes (🔒 Autenticado)`);
  console.log(`\n💡 Dica: Configure as variáveis de ambiente no arquivo .env`);
});
