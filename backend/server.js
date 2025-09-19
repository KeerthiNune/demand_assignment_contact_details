// backend/server.js
import express from "express";
import cors from "cors";
import { run, get, all } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Contact Book API" });
});

app.post("/contacts", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "name, email and phone are required" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "invalid email" });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "phone must be 10 digits" });
    }

    const result = await run(
      "INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)",
      [name.trim(), email.trim(), phone.trim()]
    );

    const newContact = await get("SELECT * FROM contacts WHERE id = ?", [
      result.lastID,
    ]);
    res.status(201).json(newContact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/contacts", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "10", 10));
    const offset = (page - 1) * limit;

    const contacts = await all(
      "SELECT * FROM contacts ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    const totalRow = await get("SELECT COUNT(*) as count FROM contacts");
    const total = totalRow ? totalRow.count : 0;

    res.json({ contacts, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/contacts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const result = await run("DELETE FROM contacts WHERE id = ?", [id]);
    if (result.changes && result.changes > 0) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ error: "contact not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
