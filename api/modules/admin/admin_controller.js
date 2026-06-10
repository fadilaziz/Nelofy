import service from './admin_service.js';
import { addSseClient, removeSseClient, getSseClientCount } from './admin_sse.js';

// Ambil data Admin
export const get_admin_data = async (req, res) => {
  try {
    const id_admin = req.userId || 105;
    const result = await service.get_admin_data(id_admin);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

// Ambil semua data user
export const get_all_user_data = async (req, res) => {
  try {
    const result = await service.get_all_user_data();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

// Menambahkan data user
export const add_user_data = async (req, res) => {
  try {
    const result = await service.add_user_data(req.body);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

// Mengubah data user
export const update_user_data = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.update_user_data(id, req.body);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

// Menghapus data user
export const delete_user_data = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.delete_user_data(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

// Ambil semua data order
export const get_all_orders = async (req, res) => {
  try {
    const result = await service.get_all_orders();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

// Menambahkan data order
export const add_order_data = async (req, res) => {
  try {
    console.log('ini data order', req.body);
    const result = await service.add_order_data(req.body);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

// Mengubah data order
export const update_order_data = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.update_order_data(id, req.body);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

// Menghapus data order
export const delete_order_data = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.delete_order_data(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

// Ambil list products
export const get_products = async (req, res) => {
  try {
    const result = await service.get_products();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

// SSE stream — realtime dashboard updates
export const sse_stream = (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();

  // Kirim event 'connected' awal
  res.write(`event: connected\ndata: ${JSON.stringify({ clients: getSseClientCount() + 1 })}\n\n`);

  // Tambahkan ke pool client
  addSseClient(res);

  // Heartbeat setiap 25 detik agar koneksi tidak di-close oleh proxy/browser
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  // Cleanup saat client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    removeSseClient(res);
  });
};
