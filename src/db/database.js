import mysql from "mysql2/promise";

// Configuração do banco de dados
const connection = await mysql.createPool({
  host: "edumysql.acesso.rj.senac.br",
  user: "20252_prjint5",
  password: "Senac@2025",
  database: "20252_prjint5_pedrocarvalho",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default connection;