import sql from '../../database/db.js';

export const get_products = async () => {
  try {
    const result = await sql`SELECT * FROM products`;

    return {
      code: 200,
      status: 'success',
      message: 'Product Found',
      data: result,
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};

export const get_order_notification = async (userId) => {
  try {
    const result = await sql`
        SELECT
            o.id AS order_id,
            o.total AS amount,
            i.no_invoice AS invoice_id,
            i.jatuh_tempo AS expires_at,
            o.created_at AS timestamp
        FROM orders o
        JOIN invoices i ON o.id = i.order_id
        WHERE o.status = 'pending' AND o.pelanggan_id = ${userId}
        ORDER BY o.created_at DESC
    `;

    return {
      code: 200,
      status: 'success',
      message: 'Order Found',
      data: result,
    };
  } catch (error) {
    return {
      code: 500,
      status: 'error',
      message: error.message,
    };
  }
};

const service = {
  get_products,
  get_order_notification,
};

export default service;
