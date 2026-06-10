/**
 * admin_sse.js
 * Server-Sent Events helper untuk admin dashboard realtime updates.
 *
 * Menyimpan daftar SSE client yang aktif dan menyediakan
 * fungsi broadcastUpdate() yang dipanggil setelah operasi CRUD berhasil.
 */

// Set yang menyimpan semua response object dari client SSE yang terhubung
const sseClients = new Set();

/**
 * Tambahkan client SSE baru ke dalam pool.
 * Dipanggil oleh controller saat koneksi SSE dibuka.
 * @param {import('express').Response} res
 */
export function addSseClient(res) {
  sseClients.add(res);
}

/**
 * Hapus client SSE dari pool.
 * Dipanggil saat koneksi ditutup / client disconnect.
 * @param {import('express').Response} res
 */
export function removeSseClient(res) {
  sseClients.delete(res);
}

/**
 * Kirim update ke semua SSE client yang sedang terhubung.
 * @param {'order' | 'user' | 'all'} type - jenis data yang berubah
 * @param {string} [action] - opsional: 'created' | 'updated' | 'deleted'
 */
export function broadcastUpdate(type, action = 'updated') {
  const payload = JSON.stringify({ type, action, timestamp: Date.now() });
  const message = `event: ${type}\ndata: ${payload}\n\n`;

  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      // Client sudah disconnect, hapus dari pool
      sseClients.delete(client);
    }
  }
}

/**
 * Jumlah client SSE yang saat ini aktif (untuk debugging).
 */
export function getSseClientCount() {
  return sseClients.size;
}
