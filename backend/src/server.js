const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
require("dotenv").config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "warehouse-secret";

// Helper function untuk mencatat notifikasi
async function createNotification(userId, username, actionType, entityType, entityName, message) {
  try {
    await pool.query(
      "INSERT INTO notifications (user_id, username, action_type, entity_type, entity_name, message) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, username, actionType, entityType, entityName, message]
    );
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token diperlukan" });
  }
  try {
    req.user = jwt.verify(header.slice(7), SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Token tidak valid" });
  }
}

app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) return next();
  if (req.path === "/api/auth/login" || req.path === "/api/health") return next();
  return authenticate(req, res, next);
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const statusLabel = (stockTotal) => {
  if (stockTotal <= 20) return "Stock Menipis";
  if (stockTotal <= 50) return "Perlu Monitoring";
  return "Aman";
};

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query("SELECT id, username, password_hash, role FROM users WHERE username = ?", [username]);
    if (!rows.length) return res.status(401).json({ message: "Username/password salah" });
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ message: "Username/password salah" });
    const token = jwt.sign({ id: rows[0].id, role: rows[0].role }, SECRET, { expiresIn: "1d" });
    return res.json({ token, user: { id: rows[0].id, username: rows[0].username, role: rows[0].role } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post("/api/auth/change-password", async (req, res) => {
  try {
    const userId = req.user.id;
    const { old_password: oldPassword, new_password: newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: "Password lama dan baru wajib" });
    const [rows] = await pool.query("SELECT password_hash FROM users WHERE id=?", [userId]);
    if (!rows.length) return res.status(404).json({ message: "User tidak ditemukan" });
    const ok = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!ok) return res.status(400).json({ message: "Password lama salah" });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash=? WHERE id=?", [hash, userId]);
    return res.json({ message: "Password berhasil diubah" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/api/material-stocks", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, tanggal, no_po, nama_material, ukuran_panjang, ukuran_lebar, jumlah_roll, supplier_id, kategori_id FROM material_stocks ORDER BY id DESC",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/material-stocks", async (req, res) => {
  try {
    const { tanggal, no_po, nama_material, ukuran_panjang, ukuran_lebar, jumlah_roll, supplier_id, kategori_id } = req.body;
    await pool.query(
      "INSERT INTO material_stocks (tanggal, no_po, nama_material, ukuran_panjang, ukuran_lebar, jumlah_roll, supplier_id, kategori_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        tanggal,
        no_po,
        nama_material,
        Number(ukuran_panjang || 0),
        Number(ukuran_lebar || 0),
        Number(jumlah_roll || 0),
        supplier_id || null,
        kategori_id || null,
      ],
    );
    
    // Log notification
    const username = req.user?.username || "Unknown";
    await createNotification(
      req.user?.id || 0,
      username,
      "create",
      "Stock Material",
      nama_material,
      `${username} menambahkan stock material "${nama_material}"`
    );
    
    res.json({ message: "Data material berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/material-stocks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, no_po, nama_material, ukuran_panjang, ukuran_lebar, jumlah_roll, supplier_id, kategori_id } = req.body;
    await pool.query(
      "UPDATE material_stocks SET tanggal=?, no_po=?, nama_material=?, ukuran_panjang=?, ukuran_lebar=?, jumlah_roll=?, supplier_id=?, kategori_id=? WHERE id=?",
      [
        tanggal,
        no_po,
        nama_material,
        Number(ukuran_panjang || 0),
        Number(ukuran_lebar || 0),
        Number(jumlah_roll || 0),
        supplier_id || null,
        kategori_id || null,
        id,
      ],
    );
    
    // Log notification
    const username = req.user?.username || "Unknown";
    await createNotification(
      req.user?.id || 0,
      username,
      "update",
      "Stock Material",
      nama_material,
      `${username} mengupdate stock material "${nama_material}"`
    );
    
    res.json({ message: "Data material berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/material-stocks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Get material name before delete
    const [[material]] = await pool.query("SELECT nama_material FROM material_stocks WHERE id=?", [id]);
    const materialName = material?.nama_material || "Unknown";
    
    await pool.query("DELETE FROM material_stocks WHERE id=?", [id]);
    
    // Log notification
    const username = req.user?.username || "Unknown";
    await createNotification(
      req.user?.id || 0,
      username,
      "delete",
      "Stock Material",
      materialName,
      `${username} menghapus stock material "${materialName}"`
    );
    
    res.json({ message: "Data material dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/label-stocks", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, tanggal, pn_prefix, nama_item, ukuran_value, stock_awal, stock_total, finishing, isi, status FROM label_stocks ORDER BY id DESC",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function buildPn(pnNumber) {
  const n = String(pnNumber || "").replace(/\/label-RBM$/i, "").trim();
  return `${n}/label-RBM`;
}

app.post("/api/label-stocks", async (req, res) => {
  try {
    const { tanggal, pn_number, nama_item, ukuran_value, stock_awal, stock_total, finishing, isi } = req.body;
    const pn = buildPn(pn_number);
    const status = statusLabel(Number(stock_total || 0));
    await pool.query(
      "INSERT INTO label_stocks (tanggal, pn_prefix, nama_item, ukuran_value, stock_awal, stock_total, finishing, isi, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [tanggal, pn, nama_item, ukuran_value, Number(stock_awal || 0), Number(stock_total || 0), finishing, isi, status],
    );
    res.json({ message: "Data label berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/label-stocks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, pn_number, nama_item, ukuran_value, stock_awal, stock_total, finishing, isi } = req.body;
    const pn = buildPn(pn_number);
    const status = statusLabel(Number(stock_total || 0));
    await pool.query(
      "UPDATE label_stocks SET tanggal=?, pn_prefix=?, nama_item=?, ukuran_value=?, stock_awal=?, stock_total=?, finishing=?, isi=?, status=? WHERE id=?",
      [tanggal, pn, nama_item, ukuran_value, Number(stock_awal || 0), Number(stock_total || 0), finishing, isi, status, id],
    );
    res.json({ message: "Data label berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/label-stocks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM label_stocks WHERE id=?", [id]);
    res.json({ message: "Data label dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/categories", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nama_kategori, supplier FROM categories ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { nama_kategori, supplier } = req.body;
    await pool.query("INSERT INTO categories (nama_kategori, supplier) VALUES (?, ?)", [nama_kategori, supplier]);
    res.json({ message: "Kategori berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kategori, supplier } = req.body;
    await pool.query("UPDATE categories SET nama_kategori=?, supplier=? WHERE id=?", [nama_kategori, supplier, id]);
    res.json({ message: "Kategori berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM categories WHERE id=?", [id]);
    res.json({ message: "Kategori dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/transactions/in", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, tanggal, no_lps, pn, nama_item, ukuran, jumlah_roll FROM label_masuk ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/transactions/in", async (req, res) => {
  try {
    const { tanggal, no_lps, pn_number, nama_item, ukuran_panjang, ukuran_lebar, jumlah_roll } = req.body;
    const pn = buildPn(pn_number);
    const ukuran = `${ukuran_panjang}mm x ${ukuran_lebar}mm`;
    await pool.query(
      "INSERT INTO label_masuk (tanggal, no_lps, pn, nama_item, ukuran, jumlah_roll) VALUES (?, ?, ?, ?, ?, ?)",
      [tanggal, no_lps, pn, nama_item, ukuran, Number(jumlah_roll || 0)],
    );
    res.json({ message: "Label masuk berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/transactions/in/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, no_lps, pn_number, nama_item, ukuran_panjang, ukuran_lebar, jumlah_roll } = req.body;
    const pn = buildPn(pn_number);
    const ukuran = `${ukuran_panjang}mm x ${ukuran_lebar}mm`;
    await pool.query(
      "UPDATE label_masuk SET tanggal=?, no_lps=?, pn=?, nama_item=?, ukuran=?, jumlah_roll=? WHERE id=?",
      [tanggal, no_lps, pn, nama_item, ukuran, Number(jumlah_roll || 0), id],
    );
    res.json({ message: "Label masuk berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/transactions/in/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM label_masuk WHERE id=?", [id]);
    res.json({ message: "Label masuk dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/transactions/out", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, tanggal, no_sj, pn, nama_item, ukuran, jumlah_roll FROM label_keluar ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/transactions/out", async (req, res) => {
  try {
    const { tanggal, no_sj, pn_number, nama_item, ukuran_panjang, ukuran_lebar, jumlah_roll } = req.body;
    const pn = buildPn(pn_number);
    const ukuran = `${ukuran_panjang}mm x ${ukuran_lebar}mm`;
    await pool.query(
      "INSERT INTO label_keluar (tanggal, no_sj, pn, nama_item, ukuran, jumlah_roll) VALUES (?, ?, ?, ?, ?, ?)",
      [tanggal, no_sj, pn, nama_item, ukuran, Number(jumlah_roll || 0)],
    );
    res.json({ message: "Label keluar berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/transactions/out/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, no_sj, pn_number, nama_item, ukuran_panjang, ukuran_lebar, jumlah_roll } = req.body;
    const pn = buildPn(pn_number);
    const ukuran = `${ukuran_panjang}mm x ${ukuran_lebar}mm`;
    await pool.query(
      "UPDATE label_keluar SET tanggal=?, no_sj=?, pn=?, nama_item=?, ukuran=?, jumlah_roll=? WHERE id=?",
      [tanggal, no_sj, pn, nama_item, ukuran, Number(jumlah_roll || 0), id],
    );
    res.json({ message: "Label keluar berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/transactions/out/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM label_keluar WHERE id=?", [id]);
    res.json({ message: "Label keluar dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/documents/lps", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, no_lps, pn, detail_form, created_at FROM lps_docs ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/documents/lps", async (req, res) => {
  try {
    const { no_lps, pn, detail_form } = req.body;
    await pool.query("INSERT INTO lps_docs (no_lps, pn, detail_form) VALUES (?, ?, ?)", [no_lps, pn, JSON.stringify(detail_form || {})]);
    res.json({ message: "Dokumen LPS berhasil disimpan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/documents/sj", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, no_sj, pn, detail_form, created_at FROM sj_docs ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/documents/sj", async (req, res) => {
  try {
    const { no_sj, pn, detail_form } = req.body;
    await pool.query("INSERT INTO sj_docs (no_sj, pn, detail_form) VALUES (?, ?, ?)", [no_sj, pn, JSON.stringify(detail_form || {})]);
    res.json({ message: "Dokumen SJ berhasil disimpan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, full_name, username, role, created_at FROM users ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { full_name, username, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (full_name, username, password_hash, role) VALUES (?, ?, ?, ?)", [full_name, username, passwordHash, role || "admin"]);
    res.json({ message: "User berhasil dibuat" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, username, role, password } = req.body;
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query("UPDATE users SET full_name=?, username=?, role=?, password_hash=? WHERE id=?", [full_name, username, role || "admin", passwordHash, id]);
    } else {
      await pool.query("UPDATE users SET full_name=?, username=?, role=? WHERE id=?", [full_name, username, role || "admin", id]);
    }
    res.json({ message: "User berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id=?", [id]);
    res.json({ message: "User dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/settings", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT setting_key, setting_value FROM app_settings ORDER BY setting_key ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;
    await pool.query(
      "INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)",
      [setting_key, setting_value],
    );
    res.json({ message: "Setting disimpan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/backups", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, backup_name, note, created_by, created_at FROM backup_logs ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/backups", async (req, res) => {
  try {
    const { note, created_by } = req.body;
    const backupName = `backup_${Date.now()}.sql`;
    await pool.query("INSERT INTO backup_logs (backup_name, note, created_by) VALUES (?, ?, ?)", [backupName, note || "Manual backup", created_by || "system"]);
    res.json({ message: "Backup log dibuat", backup_name: backupName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/dashboard/summary", async (_req, res) => {
  try {
    const [[m]] = await pool.query("SELECT COUNT(*) AS total FROM material_stocks");
    const [[l]] = await pool.query("SELECT COUNT(*) AS total FROM label_stocks");
    const [[i]] = await pool.query("SELECT COUNT(*) AS total FROM label_masuk");
    const [[o]] = await pool.query("SELECT COUNT(*) AS total FROM label_keluar");
    res.json({
      material: m.total,
      label: l.total,
      masuk: i.total,
      keluar: o.total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Notifications endpoints
app.get("/api/notifications", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await pool.query(
      "SELECT id, user_id, username, action_type, entity_type, entity_name, message, is_read, created_at FROM notifications ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/notifications/unread-count", async (_req, res) => {
  try {
    const [[result]] = await pool.query("SELECT COUNT(*) AS count FROM notifications WHERE is_read = FALSE");
    res.json({ count: result.count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id]);
    res.json({ message: "Notifikasi ditandai sudah dibaca" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/notifications/mark-all-read", async (_req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE");
    res.json({ message: "Semua notifikasi ditandai sudah dibaca" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM notifications WHERE id = ?", [id]);
    res.json({ message: "Notifikasi dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on port ${PORT}`);
});
