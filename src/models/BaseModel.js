import db from "../db/database.js";
import { v4 as uuidv4 } from "uuid";

class BaseModel {
  static tabela = "";

  constructor(
    id,
    nome,
    email,
    senha,
    cpf,
    endereco,
    dataNascimento,
    fotoPerfil
  ) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.cpf = cpf;
    this.endereco = endereco;
    this.dataNascimento = dataNascimento;
    this.fotoPerfil = fotoPerfil;
  }

  static async buscarTodos() {
    const [rows] = await db.query(`SELECT * FROM ${this.tabela}`);

    // Converte a foto_perfil de cada registro para Base64
    rows.forEach((registro) => {
      if (registro.foto_perfil) {
        registro.foto_perfil = registro.foto_perfil.toString("base64");
      }
    });

    return rows;
  }

  static async buscarPorId(id) {
    const [rows] = await db.query(`SELECT * FROM ${this.tabela} WHERE id = ?`, [
      id,
    ]);

    if (rows.length > 0) {
      let registro = rows[0];

      // Converte a foto_perfil para Base64
      if (registro.foto_perfil) {
        registro.foto_perfil = registro.foto_perfil.toString("base64");
      }

      return registro;
    } else {
      throw new Error("Registro não encontrado");
    }
  }

  static gerarId() {
    return uuidv4();
  }

  static validarCamposObrigatorios(dados, camposObrigatorios) {
    const camposFaltando = camposObrigatorios.filter((campo) => !dados[campo]);
    if (camposFaltando.length > 0) {
      throw new Error(
        `Campos obrigatórios não informados: ${camposFaltando.join(", ")}`
      );
    }
  }

  static converterCampoParaColuna(campo) {
    return campo.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}

export default BaseModel;
