import db from "./database.js";
import { v4 as uuidv4 } from "uuid";

class Usuario {
    static tabela = "";

    constructor(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.cpf = cpf;
        this.endereco = endereco;
        this.dataNascimento = dataNascimento;
        this.fotoPerfil = fotoPerfil;
    }

    static async consultarTodos() {
        const [rows] = await db.query(`SELECT * FROM ${this.tabela}`);

        // Converte a foto_perfil de cada cliente para Base64
        rows.forEach(cliente => {
            if (cliente.foto_perfil) {
                cliente.foto_perfil = cliente.foto_perfil.toString('base64');
            }
        });

        return rows;
    }

    static async consultarPorId(id) {
        const [rows] = await db.query(`SELECT * FROM ${this.tabela} WHERE id = ?`, [id]);

        if (rows.length > 0) {
            let cliente = rows[0];

            // Converte a foto_perfil para Base64
            if (cliente.foto_perfil) {
                cliente.foto_perfil = cliente.foto_perfil.toString('base64');
            }

            return cliente;
        } else {
            throw new Error('Cliente não encontrado');
        }
    }

    

    static async cadastrar(nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil) {
        const id = uuidv4();
        await db.query(
            `INSERT INTO ${this.tabela} (id, nome, email, senha, cpf, endereco, data_nascimento, foto_perfil) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil]
        );
        return { id, nome, email };
    }


    static async atualizar(id, nome, senha, cpf, endereco, dataNascimento, fotoPerfil) {
        const statusCliente = "ativo"; // ou outro valor
        await db.query(
            `UPDATE ${this.tabela} SET nome=?, senha=?, cpf=?, endereco=?, data_nascimento=?, status_cliente=?, foto_perfil=? WHERE id=?`,
            [nome, senha, cpf, endereco, dataNascimento, statusCliente, fotoPerfil, id]
        );
        return { message: "Cliente atualizado com sucesso" };
    }

    static async excluir(email, senha) {
        const statusCliente = "Inativo"; // marca como inativo
        await db.query(
            `UPDATE ${this.tabela} SET status_cliente=? WHERE email=? AND senha=?`,
            [statusCliente, email, senha]
        );
        return { message: "Cliente marcado como inativo com sucesso" };
    }
}

export default Usuario;
