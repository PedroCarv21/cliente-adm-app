import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "database",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let connection;

try {
  connection = mysql.createPool(dbConfig);

  connection
    .getConnection()
    .then((conn) => {
      console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");
      conn.release();
    })
    .catch((error) => {
      console.error("❌ Erro ao conectar ao banco de dados:");
      console.error(`   Host: ${dbConfig.host}`);
      console.error(`   Database: ${dbConfig.database}`);
      console.error(`   Erro: ${error.message}`);
      console.error(
        "\n⚠️  A aplicação continuará rodando, mas as operações de banco falharão."
      );
    });
} catch (error) {
  console.error("❌ Erro fatal ao criar pool de conexões:", error);
  process.exit(1);
}

export default connection;
