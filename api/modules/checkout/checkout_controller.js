import service from './checkout_services';
import axios from 'axios';

export const checkout_products = async (req, res) => {
  try {
    //Masukan id user dari token
    req.body.user_id = req.userId;
    //Capture payload
    let payload = await service.capture_payload_checkout(req.body);
    //Validasi payload
    payload = await service.validation_payload_checkout(payload);
    //Ambil harga product
    payload = await service.get_product_price(payload);
    //Kalkulasi Diskon
    payload = await service.calculate_discount(payload);
    //Begin Transaction
    payload = await service.transaction(payload);
    //Menyimpan data queue whatsapp dan email
    payload = await service.checkout_send_queue(payload);

    //Response
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Checkout Berhasil',
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

//Callback QRIS
export const callback_qris = async (req, res) => {
  //Update status order menjadi success saat menerima data callback
  let update_status = await service.update_status_order(req.body);
  //Kirim pesan whatsapp
  update_status = await service.order_success_send_message(req.body);
  res.status(200).json({
    code: 200,
    status: 'success',
    message: 'Order Berhasil Dibayar',
    data: req.body,
  });
};
