import express from "express";
import { clienteRoutes } from "./cliente.js";
import { administradorRoutes } from "./adm.js";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rotas
app.use("/clientes", clienteRoutes);
app.use("/adm", administradorRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
