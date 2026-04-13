const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
});

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "warehouse-secret";

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function untuk emit realtime updates
function emitDataUpdate(eventType, data) {
  io.emit('data-update', { type: eventType, data });
}

// Helper function untuk mencatat notifikasi
async function createNotification(userId, username, actionType, entityType, entityName, message) {
  try {
    await pool.query(
      "INSERT INTO notifications (user_id, username, action_type, entity_type, entity_name, message) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, username, actionType, entityType, entityName, message]
    );
    
    // Emit realtime notification to all connected clients
    emitDataUpdate('notification', {
      action: actionType,
      userId,
      username,
      entityType,
      entityName,
      message
    });
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
    
    // Emit realtime update
    emitDataUpdate('material-stocks', { action: 'create' });
    
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
    
    // Emit realtime update
    emitDataUpdate('material-stocks', { action: 'update', id });
    
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
    
    // Emit realtime update
    emitDataUpdate('material-stocks', { action: 'delete', id });
    
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
    
    // Emit realtime update
    emitDataUpdate('label-stocks', { action: 'create' });
    
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
    
    // Emit realtime update
    emitDataUpdate('label-stocks', { action: 'update', id });
    
    res.json({ message: "Data label berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/label-stocks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM label_stocks WHERE id=?", [id]);
    
    // Emit realtime update
    emitDataUpdate('label-stocks', { action: 'delete', id });
    
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
    
    // Emit realtime update
    emitDataUpdate('categories', { action: 'create' });
    
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
    
    // Emit realtime update
    emitDataUpdate('categories', { action: 'update', id });
    
    res.json({ message: "Kategori berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM categories WHERE id=?", [id]);
    
    // Emit realtime update
    emitDataUpdate('categories', { action: 'delete', id });
    
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
      [tanggal, no_lps || "", pn, nama_item, ukuran, Number(jumlah_roll || 0)],
    );
    
    // Emit realtime update
    emitDataUpdate('transactions-in', { action: 'create' });
    emitDataUpdate('dashboard', { action: 'update' });
    
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
      [tanggal, no_lps || "", pn, nama_item, ukuran, Number(jumlah_roll || 0), id],
    );
    
    // Emit realtime update
    emitDataUpdate('transactions-in', { action: 'update', id });
    emitDataUpdate('dashboard', { action: 'update' });
    
    res.json({ message: "Label masuk berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/transactions/in/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM label_masuk WHERE id=?", [id]);
    
    // Emit realtime update
    emitDataUpdate('transactions-in', { action: 'delete', id });
    emitDataUpdate('dashboard', { action: 'update' });
    
    res.json({ message: "Label masuk dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/transactions/out", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, tanggal, no_sj, pn, nama_item, ukuran, jumlah_roll, customer FROM label_keluar ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/transactions/out", async (req, res) => {
  try {
    const { tanggal, no_sj, pn_number, nama_item, ukuran_panjang, ukuran_lebar, jumlah_roll, customer } = req.body;
    const pn = buildPn(pn_number);
    const ukuran = `${ukuran_panjang}mm x ${ukuran_lebar}mm`;
    await pool.query(
      "INSERT INTO label_keluar (tanggal, no_sj, pn, nama_item, ukuran, jumlah_roll, customer) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [tanggal, no_sj, pn, nama_item, ukuran, Number(jumlah_roll || 0), customer || null],
    );
    
    // Emit realtime update
    emitDataUpdate('transactions-out', { action: 'create' });
    emitDataUpdate('dashboard', { action: 'update' });
    
    res.json({ message: "Label keluar berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/transactions/out/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, no_sj, pn_number, nama_item, ukuran_panjang, ukuran_lebar, jumlah_roll, customer } = req.body;
    const pn = buildPn(pn_number);
    const ukuran = `${ukuran_panjang}mm x ${ukuran_lebar}mm`;
    await pool.query(
      "UPDATE label_keluar SET tanggal=?, no_sj=?, pn=?, nama_item=?, ukuran=?, jumlah_roll=?, customer=? WHERE id=?",
      [tanggal, no_sj, pn, nama_item, ukuran, Number(jumlah_roll || 0), customer || null, id],
    );
    
    // Emit realtime update
    emitDataUpdate('transactions-out', { action: 'update', id });
    emitDataUpdate('dashboard', { action: 'update' });
    
    res.json({ message: "Label keluar berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/transactions/out/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM label_keluar WHERE id=?", [id]);
    
    // Emit realtime update
    emitDataUpdate('transactions-out', { action: 'delete', id });
    emitDataUpdate('dashboard', { action: 'update' });
    
    res.json({ message: "Label keluar dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/documents/lps", async (_req, res) => {
  try {
    // Get LPS docs with their items
    const [docs] = await pool.query(
      "SELECT id, no_lps, tanggal, created_at FROM lps_docs ORDER BY id DESC"
    );
    
    // Get items for each LPS doc
    for (const doc of docs) {
      const [items] = await pool.query(
        "SELECT li.*, lm.no_lps, lm.pn, lm.nama_item, lm.jumlah_roll FROM lps_items li LEFT JOIN label_masuk lm ON li.label_masuk_id = lm.id WHERE li.lps_doc_id = ?",
        [doc.id]
      );
      doc.items = items;
      doc.item_count = items.length;
    }
    
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/documents/lps", async (req, res) => {
  try {
    const { no_lps, tanggal, label_masuk_ids } = req.body;
    
    // Insert dokumen LPS
    const [result] = await pool.query(
      "INSERT INTO lps_docs (no_lps, tanggal) VALUES (?, ?)",
      [no_lps, tanggal]
    );
    
    const lpsDocId = result.insertId;
    
    // Insert items dan update no_lps di label_masuk
    if (label_masuk_ids && Array.isArray(label_masuk_ids) && label_masuk_ids.length > 0) {
      for (const labelMasukId of label_masuk_ids) {
        // Get data from label_masuk
        const [[labelData]] = await pool.query(
          "SELECT pn, nama_item, jumlah_roll FROM label_masuk WHERE id = ?",
          [labelMasukId]
        );
        
        if (labelData) {
          // Insert to lps_items
          await pool.query(
            "INSERT INTO lps_items (lps_doc_id, label_masuk_id, p_number, nama_item, jumlah) VALUES (?, ?, ?, ?, ?)",
            [lpsDocId, labelMasukId, labelData.pn, labelData.nama_item, labelData.jumlah_roll]
          );
          
          // Update no_lps di label_masuk
          await pool.query(
            "UPDATE label_masuk SET no_lps = ? WHERE id = ?",
            [no_lps, labelMasukId]
          );
        }
      }
    }
    
    res.json({ message: "Dokumen LPS berhasil disimpan dan No LPS telah diupdate ke Label Masuk" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/documents/lps/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { no_lps, tanggal, label_masuk_ids } = req.body;
    
    // Get old label_masuk_ids to clear their no_lps
    const [oldItems] = await pool.query(
      "SELECT label_masuk_id FROM lps_items WHERE lps_doc_id = ?",
      [id]
    );
    
    // Clear no_lps from old label_masuk
    for (const item of oldItems) {
      await pool.query(
        "UPDATE label_masuk SET no_lps = '' WHERE id = ?",
        [item.label_masuk_id]
      );
    }
    
    // Delete old items
    await pool.query("DELETE FROM lps_items WHERE lps_doc_id = ?", [id]);
    
    // Update dokumen LPS
    await pool.query(
      "UPDATE lps_docs SET no_lps=?, tanggal=? WHERE id=?",
      [no_lps, tanggal, id]
    );
    
    // Insert new items dan update no_lps di label_masuk
    if (label_masuk_ids && Array.isArray(label_masuk_ids) && label_masuk_ids.length > 0) {
      for (const labelMasukId of label_masuk_ids) {
        // Get data from label_masuk
        const [[labelData]] = await pool.query(
          "SELECT pn, nama_item, jumlah_roll FROM label_masuk WHERE id = ?",
          [labelMasukId]
        );
        
        if (labelData) {
          // Insert to lps_items
          await pool.query(
            "INSERT INTO lps_items (lps_doc_id, label_masuk_id, p_number, nama_item, jumlah) VALUES (?, ?, ?, ?, ?)",
            [id, labelMasukId, labelData.pn, labelData.nama_item, labelData.jumlah_roll]
          );
          
          // Update no_lps di label_masuk
          await pool.query(
            "UPDATE label_masuk SET no_lps = ? WHERE id = ?",
            [no_lps, labelMasukId]
          );
        }
      }
    }
    
    res.json({ message: "Dokumen LPS berhasil diperbarui dan No LPS telah diupdate ke Label Masuk" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/documents/lps/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get label_masuk_ids to clear their no_lps
    const [items] = await pool.query(
      "SELECT label_masuk_id FROM lps_items WHERE lps_doc_id = ?",
      [id]
    );
    
    // Clear no_lps from label_masuk
    for (const item of items) {
      await pool.query(
        "UPDATE label_masuk SET no_lps = '' WHERE id = ?",
        [item.label_masuk_id]
      );
    }
    
    // Delete LPS doc (items will be deleted by CASCADE)
    await pool.query("DELETE FROM lps_docs WHERE id=?", [id]);
    res.json({ message: "Dokumen LPS dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/documents/sj", async (_req, res) => {
  try {
    // Get SJ docs with their items
    const [docs] = await pool.query(
      "SELECT id, no_sj, tanggal, customer, created_at FROM sj_docs ORDER BY id DESC"
    );
    
    // Get items for each SJ doc
    for (const doc of docs) {
      const [items] = await pool.query(
        "SELECT si.*, lk.no_sj, lk.pn, lk.nama_item, lk.jumlah_roll FROM sj_items si LEFT JOIN label_keluar lk ON si.label_keluar_id = lk.id WHERE si.sj_doc_id = ?",
        [doc.id]
      );
      doc.items = items;
      doc.item_count = items.length;
    }
    
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/documents/sj", async (req, res) => {
  try {
    const { no_sj, tanggal, label_keluar_ids } = req.body;
    
    // Get customer from first label_keluar (assuming all have same customer)
    let customer = null;
    if (label_keluar_ids && Array.isArray(label_keluar_ids) && label_keluar_ids.length > 0) {
      const [[firstLabel]] = await pool.query(
        "SELECT customer FROM label_keluar WHERE id = ?",
        [label_keluar_ids[0]]
      );
      customer = firstLabel?.customer || null;
    }
    
    // Insert dokumen SJ
    const [result] = await pool.query(
      "INSERT INTO sj_docs (no_sj, tanggal, customer) VALUES (?, ?, ?)",
      [no_sj, tanggal, customer]
    );
    
    const sjDocId = result.insertId;
    
    // Insert items dan update no_sj di label_keluar
    if (label_keluar_ids && Array.isArray(label_keluar_ids) && label_keluar_ids.length > 0) {
      for (const labelKeluarId of label_keluar_ids) {
        // Get data from label_keluar
        const [[labelData]] = await pool.query(
          "SELECT pn, nama_item, jumlah_roll FROM label_keluar WHERE id = ?",
          [labelKeluarId]
        );
        
        if (labelData) {
          // Insert to sj_items
          await pool.query(
            "INSERT INTO sj_items (sj_doc_id, label_keluar_id, pn, nama_item, jumlah) VALUES (?, ?, ?, ?, ?)",
            [sjDocId, labelKeluarId, labelData.pn, labelData.nama_item, labelData.jumlah_roll]
          );
          
          // Update no_sj di label_keluar
          await pool.query(
            "UPDATE label_keluar SET no_sj = ? WHERE id = ?",
            [no_sj, labelKeluarId]
          );
        }
      }
    }
    
    res.json({ message: "Dokumen SJ berhasil disimpan dan No SJ telah diupdate ke Label Keluar" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/documents/sj/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { no_sj, tanggal, label_keluar_ids } = req.body;
    
    // Get customer from first label_keluar (assuming all have same customer)
    let customer = null;
    if (label_keluar_ids && Array.isArray(label_keluar_ids) && label_keluar_ids.length > 0) {
      const [[firstLabel]] = await pool.query(
        "SELECT customer FROM label_keluar WHERE id = ?",
        [label_keluar_ids[0]]
      );
      customer = firstLabel?.customer || null;
    }
    
    // Get old label_keluar_ids to clear their no_sj
    const [oldItems] = await pool.query(
      "SELECT label_keluar_id FROM sj_items WHERE sj_doc_id = ?",
      [id]
    );
    
    // Clear no_sj from old label_keluar
    for (const item of oldItems) {
      await pool.query(
        "UPDATE label_keluar SET no_sj = '' WHERE id = ?",
        [item.label_keluar_id]
      );
    }
    
    // Delete old items
    await pool.query("DELETE FROM sj_items WHERE sj_doc_id = ?", [id]);
    
    // Update dokumen SJ
    await pool.query(
      "UPDATE sj_docs SET no_sj=?, tanggal=?, customer=? WHERE id=?",
      [no_sj, tanggal, customer, id]
    );
    
    // Insert new items dan update no_sj di label_keluar
    if (label_keluar_ids && Array.isArray(label_keluar_ids) && label_keluar_ids.length > 0) {
      for (const labelKeluarId of label_keluar_ids) {
        // Get data from label_keluar
        const [[labelData]] = await pool.query(
          "SELECT pn, nama_item, jumlah_roll FROM label_keluar WHERE id = ?",
          [labelKeluarId]
        );
        
        if (labelData) {
          // Insert to sj_items
          await pool.query(
            "INSERT INTO sj_items (sj_doc_id, label_keluar_id, pn, nama_item, jumlah) VALUES (?, ?, ?, ?, ?)",
            [id, labelKeluarId, labelData.pn, labelData.nama_item, labelData.jumlah_roll]
          );
          
          // Update no_sj di label_keluar
          await pool.query(
            "UPDATE label_keluar SET no_sj = ? WHERE id = ?",
            [no_sj, labelKeluarId]
          );
        }
      }
    }
    
    res.json({ message: "Dokumen SJ berhasil diperbarui dan No SJ telah diupdate ke Label Keluar" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/documents/sj/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get label_keluar_ids to clear their no_sj
    const [items] = await pool.query(
      "SELECT label_keluar_id FROM sj_items WHERE sj_doc_id = ?",
      [id]
    );
    
    // Clear no_sj from label_keluar
    for (const item of items) {
      await pool.query(
        "UPDATE label_keluar SET no_sj = '' WHERE id = ?",
        [item.label_keluar_id]
      );
    }
    
    // Delete SJ doc (items will be deleted by CASCADE)
    await pool.query("DELETE FROM sj_docs WHERE id=?", [id]);
    res.json({ message: "Dokumen SJ dihapus" });
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

// Report endpoints
app.get("/api/reports/summary", async (req, res) => {
  try {
    const { start_date, end_date, period } = req.query;
    
    let dateFilter = "";
    let params = [];
    
    if (period === "today") {
      dateFilter = "DATE(tanggal) = CURDATE()";
    } else if (period === "this_week") {
      dateFilter = "YEARWEEK(tanggal, 1) = YEARWEEK(CURDATE(), 1)";
    } else if (period === "this_month") {
      dateFilter = "YEAR(tanggal) = YEAR(CURDATE()) AND MONTH(tanggal) = MONTH(CURDATE())";
    } else if (period === "this_year") {
      dateFilter = "YEAR(tanggal) = YEAR(CURDATE())";
    } else if (start_date && end_date) {
      dateFilter = "tanggal BETWEEN ? AND ?";
      params = [start_date, end_date];
    }
    
    const whereClause = dateFilter ? `WHERE ${dateFilter}` : "";
    
    // Get label masuk summary
    const [labelMasuk] = await pool.query(
      `SELECT COUNT(*) as total_transaksi, COALESCE(SUM(jumlah_roll), 0) as total_roll FROM label_masuk ${whereClause}`,
      params
    );
    
    // Get label keluar summary
    const [labelKeluar] = await pool.query(
      `SELECT COUNT(*) as total_transaksi, COALESCE(SUM(jumlah_roll), 0) as total_roll FROM label_keluar ${whereClause}`,
      params
    );
    
    // Get material stocks summary
    const [materialStocks] = await pool.query(
      `SELECT COUNT(*) as total_transaksi, COALESCE(SUM(jumlah_roll), 0) as total_roll FROM material_stocks ${whereClause}`,
      params
    );
    
    // Get LPS documents summary
    const [lpsCount] = await pool.query(
      `SELECT COUNT(*) as total FROM lps_docs ${whereClause}`,
      params
    );
    
    // Get SJ documents summary
    const [sjCount] = await pool.query(
      `SELECT COUNT(*) as total FROM sj_docs ${whereClause}`,
      params
    );
    
    res.json({
      label_masuk: {
        total_transaksi: labelMasuk[0].total_transaksi,
        total_roll: labelMasuk[0].total_roll
      },
      label_keluar: {
        total_transaksi: labelKeluar[0].total_transaksi,
        total_roll: labelKeluar[0].total_roll
      },
      material_stocks: {
        total_transaksi: materialStocks[0].total_transaksi,
        total_roll: materialStocks[0].total_roll
      },
      lps_documents: lpsCount[0].total,
      sj_documents: sjCount[0].total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/reports/transactions", async (req, res) => {
  try {
    const { start_date, end_date, period, type } = req.query;
    
    let dateFilter = "";
    let params = [];
    
    if (period === "today") {
      dateFilter = "DATE(tanggal) = CURDATE()";
    } else if (period === "this_week") {
      dateFilter = "YEARWEEK(tanggal, 1) = YEARWEEK(CURDATE(), 1)";
    } else if (period === "this_month") {
      dateFilter = "YEAR(tanggal) = YEAR(CURDATE()) AND MONTH(tanggal) = MONTH(CURDATE())";
    } else if (period === "this_year") {
      dateFilter = "YEAR(tanggal) = YEAR(CURDATE())";
    } else if (start_date && end_date) {
      dateFilter = "tanggal BETWEEN ? AND ?";
      params = [start_date, end_date];
    }
    
    const whereClause = dateFilter ? `WHERE ${dateFilter}` : "";
    
    let data = [];
    
    if (!type || type === "masuk") {
      const [masuk] = await pool.query(
        `SELECT id, tanggal, no_lps, pn, nama_item, ukuran, jumlah_roll, 'masuk' as type FROM label_masuk ${whereClause} ORDER BY tanggal DESC`,
        params
      );
      data = [...data, ...masuk];
    }
    
    if (!type || type === "keluar") {
      const [keluar] = await pool.query(
        `SELECT id, tanggal, no_sj, pn, nama_item, ukuran, jumlah_roll, customer, 'keluar' as type FROM label_keluar ${whereClause} ORDER BY tanggal DESC`,
        params
      );
      data = [...data, ...keluar];
    }
    
    // Sort by date descending
    data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/reports/by-item", async (req, res) => {
  try {
    const { start_date, end_date, period } = req.query;
    
    let dateFilter = "";
    let params = [];
    
    if (period === "today") {
      dateFilter = "DATE(tanggal) = CURDATE()";
    } else if (period === "this_week") {
      dateFilter = "YEARWEEK(tanggal, 1) = YEARWEEK(CURDATE(), 1)";
    } else if (period === "this_month") {
      dateFilter = "YEAR(tanggal) = YEAR(CURDATE()) AND MONTH(tanggal) = MONTH(CURDATE())";
    } else if (period === "this_year") {
      dateFilter = "YEAR(tanggal) = YEAR(CURDATE())";
    } else if (start_date && end_date) {
      dateFilter = "tanggal BETWEEN ? AND ?";
      params = [start_date, end_date];
    }
    
    const whereClause = dateFilter ? `WHERE ${dateFilter}` : "";
    
    // Get label masuk by item
    const [masukByItem] = await pool.query(
      `SELECT nama_item, pn, COUNT(*) as total_transaksi, SUM(jumlah_roll) as total_roll FROM label_masuk ${whereClause} GROUP BY nama_item, pn ORDER BY total_roll DESC`,
      params
    );
    
    // Get label keluar by item
    const [keluarByItem] = await pool.query(
      `SELECT nama_item, pn, COUNT(*) as total_transaksi, SUM(jumlah_roll) as total_roll FROM label_keluar ${whereClause} GROUP BY nama_item, pn ORDER BY total_roll DESC`,
      params
    );
    
    res.json({
      masuk: masukByItem,
      keluar: keluarByItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/reports/by-customer", async (req, res) => {
  try {
    const { start_date, end_date, period } = req.query;
    
    let dateFilter = "";
    let params = [];
    
    if (period === "today") {
      dateFilter = "DATE(tanggal) = CURDATE()";
    } else if (period === "this_week") {
      dateFilter = "YEARWEEK(tanggal, 1) = YEARWEEK(CURDATE(), 1)";
    } else if (period === "this_month") {
      dateFilter = "YEAR(tanggal) = YEAR(CURDATE()) AND MONTH(tanggal) = MONTH(CURDATE())";
    } else if (period === "this_year") {
      dateFilter = "YEAR(tanggal) = YEAR(CURDATE())";
    } else if (start_date && end_date) {
      dateFilter = "tanggal BETWEEN ? AND ?";
      params = [start_date, end_date];
    }
    
    const whereClause = dateFilter ? `WHERE ${dateFilter}` : "";
    
    const [byCustomer] = await pool.query(
      `SELECT customer, COUNT(*) as total_transaksi, SUM(jumlah_roll) as total_roll FROM label_keluar ${whereClause} GROUP BY customer ORDER BY total_roll DESC`,
      params
    );
    
    res.json(byCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on port ${PORT}`);
  console.log(`Socket.IO ready for realtime updates`);
});
