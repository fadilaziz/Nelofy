import service from './admin_service.js';
import checkoutService from '../checkout/checkout_services.js';
import { broadcastUpdate } from './admin_sse.js';
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

export const add_order_data = async (req, res) => {
  try {
    import('fs').then(fs => fs.appendFileSync('err_log.txt', '\n--- NEW REQ ---\nREQ BODY: ' + JSON.stringify(req.body) + '\n'));
    // 1. Capture and validate payload from req.body (user_id, product_id, qty, payment_method)
    let payload = await checkoutService.capture_payload_checkout(req.body);
    payload = await checkoutService.validation_payload_checkout(payload);
    
    // 2. Pricing and logic
    payload = await checkoutService.get_product_price(payload);
    payload = await checkoutService.calculate_discount(payload);
    
    // 3. Begin Transaction (klikqris generation)
    payload = await checkoutService.transaction(payload);
    
    // 4. Background tasks
    payload = await checkoutService.checkout_send_queue(payload);

    // 5. Notify dashboard clients
    broadcastUpdate('order', 'created');

    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Data order berhasil ditambahkan',
      data: payload,
    });
  } catch (error) {
    import('fs').then(fs => fs.appendFileSync('err_log.txt', '\nERROR:\n' + String(error.stack || error.message) + '\n'));
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
