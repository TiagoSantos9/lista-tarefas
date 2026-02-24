const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT UNIQUE NOT NULL,
      custo REAL NOT NULL CHECK(custo >= 0),
      data_limite TEXT NOT NULL,
      ordem INTEGER UNIQUE NOT NULL
    )
  `);
});


// LISTAR
app.get("/tarefas", (req, res) => {
  db.all("SELECT * FROM tarefas ORDER BY ordem ASC", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});


// CRIAR
app.post("/tarefas", (req, res) => {

  const { nome, custo, data_limite } = req.body;

  if (!nome || custo == null || !data_limite) {
    return res.status(400).json({ erro: "Campos obrigatórios" });
  }

  db.get("SELECT * FROM tarefas WHERE nome = ?", [nome], (err, row) => {

    if (row) {
      return res.status(400).json({ erro: "Nome já existe" });
    }

    db.get("SELECT MAX(ordem) as max FROM tarefas", (err, result) => {

      const novaOrdem = (result?.max || 0) + 1;

      db.run(
        `INSERT INTO tarefas (nome, custo, data_limite, ordem)
         VALUES (?, ?, ?, ?)`,
        [nome, custo, data_limite, novaOrdem],
        function (err) {

          if (err) return res.status(500).json(err);

          res.json({ id: this.lastID });
        }
      );
    });

  });

});


// EDITAR
app.put("/tarefas/:id", (req, res) => {

  const { nome, custo, data_limite } = req.body;
  const id = req.params.id;

  if (!nome || custo == null || !data_limite) {
    return res.status(400).json({ erro: "Campos obrigatórios" });
  }

  db.get(
    "SELECT id FROM tarefas WHERE nome = ? AND id != ?",
    [nome, id],
    (err, row) => {

      if (row) {
        return res.status(400).json({ erro: "Nome duplicado" });
      }

      db.run(
        `UPDATE tarefas
         SET nome = ?, custo = ?, data_limite = ?
         WHERE id = ?`,
        [nome, custo, data_limite, id],
        function (err) {

          if (err) return res.status(500).json(err);

          res.json({ atualizado: true });
        }
      );
    }
  );
});


// EXCLUIR
app.delete("/tarefas/:id", (req, res) => {

  const id = req.params.id;

  db.run("DELETE FROM tarefas WHERE id = ?", id, function (err) {

    if (err) return res.status(500).json(err);

    res.json({ deletado: true });
  });
});


// SUBIR
app.put("/tarefas/subir/:id", (req, res) => {

  const id = req.params.id;

  db.get("SELECT * FROM tarefas WHERE id = ?", [id], (err, tarefa) => {

    if (!tarefa) return res.json();

    db.get(
      "SELECT * FROM tarefas WHERE ordem < ? ORDER BY ordem DESC LIMIT 1",
      [tarefa.ordem],
      (err, anterior) => {

        if (!anterior) return res.json();

        db.run(
          "UPDATE tarefas SET ordem=? WHERE id=?",
          [anterior.ordem, tarefa.id]
        );

        db.run(
          "UPDATE tarefas SET ordem=? WHERE id=?",
          [tarefa.ordem, anterior.id],
          () => res.json({ ok: true })
        );
      }
    );

  });

});


// DESCER
app.put("/tarefas/descer/:id", (req, res) => {

  const id = req.params.id;

  db.get("SELECT * FROM tarefas WHERE id = ?", [id], (err, tarefa) => {

    db.get(
      "SELECT * FROM tarefas WHERE ordem > ? ORDER BY ordem ASC LIMIT 1",
      [tarefa.ordem],
      (err, proxima) => {

        if (!proxima) return res.json();

        db.run(
          "UPDATE tarefas SET ordem=? WHERE id=?",
          [proxima.ordem, tarefa.id]
        );

        db.run(
          "UPDATE tarefas SET ordem=? WHERE id=?",
          [tarefa.ordem, proxima.id],
          () => res.json({ ok: true })
        );

      }
    );

  });

});

app.listen(PORT, () => {
  console.log("Servidor rodando em http://localhost:3000");
});