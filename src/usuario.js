import db from "./database.js";
import { v4 as uuidv4 } from "uuid";

class Usuario {
    constructor(id, nome, email, senha, cpf, endereco, dataNascimento) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.cpf = cpf;
        this.endereco = endereco;
        this.dataNascimento = dataNascimento;
    }

    static async consultarTodos() {
        const [rows] = await db.query("SELECT * FROM cliente");
        return rows;
    }

    static async consultarPorId(id) {
        const [rows] = await db.query("SELECT * FROM cliente WHERE id = ?", [id]);
        return rows[0];
    }

    static async cadastrar(nome, email, senha, cpf, endereco, dataNascimento) {
        const id = uuidv4(); // cria id único
        const statusCliente = "ativo"; // valor inicial do status
        await db.query(
            "INSERT INTO cliente (id, nome, email, senha, cpf, endereco, data_nascimento, status_cliente) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [id, nome, email, senha, cpf, endereco, dataNascimento, statusCliente]
        );
        return { id, nome, email };
    }

    static async atualizar(id, nome, senha, cpf, endereco, dataNascimento) {
        const statusCliente = "ativo"; // ou outro valor
        await db.query(
            "UPDATE cliente SET nome=?, senha=?, cpf=?, endereco=?, data_nascimento=?, status_cliente=? WHERE id=?",
            [nome, senha, cpf, endereco, dataNascimento, statusCliente, id]
        );
        return { message: "Cliente atualizado com sucesso" };
    }


    static async excluir(email, senha) {
        const statusCliente = "Inativo"; // marca como inativo
        await db.query(
            "UPDATE cliente SET status_cliente=? WHERE email=? AND senha=?",
            [statusCliente, email, senha]
        );
        return { message: "Cliente marcado como inativo com sucesso" };
    }

}

export default Usuario;
