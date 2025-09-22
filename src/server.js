import express from "express";
import { clienteRoutes } from "./cliente.js";

const app = express();
// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rotas de Cliente
app.use("/clientes", clienteRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
//teste