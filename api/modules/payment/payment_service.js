import sql from '../../database/db.js';

const get_payment_products = async (payload) => {
  if (!payload.order_id) {
    throw new Error('Order tidak ditemukan!');
  }

  //Mengabil data dari join table order, order_items dan invoices
  const dataPayment = await sql`
    SELECT
        o.*,
        u.full_name AS customer_name,
        p.product_name,
        p.price
    FROM orders o
    JOIN public.users u ON o.user_id = u.id
    JOIN public.products p ON o.product_id = p.id
    WHERE o.order_id = ${payload.order_id}`;

  return dataPayment;
};

const service = {
  get_payment_products,
};

export default service;
