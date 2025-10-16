import express from "express";
import clienteRoutes from "./routes/clienteRoutes.js";
import administradorRoutes from "./routes/administradorRoutes.js";

const app = express();

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rotas da API
app.use("/clientes", clienteRoutes);
app.use("/administradores", administradorRoutes);

// Rota de saúde da API
app.get("/health", (req, res) => {
  res.json({ status: "API funcionando", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET    /clientes`);
  console.log(`   POST   /clientes`);
  console.log(`   GET    /clientes/:id`);
  console.log(`   PUT    /clientes/:id`);
  console.log(`   DELETE /clientes`);
  console.log(`   GET    /administradores`);
  console.log(`   POST   /administradores`);
  console.log(`   GET    /administradores/:id`);
  console.log(`   PUT    /administradores/:id`);
  console.log(`   DELETE /administradores`);
});
