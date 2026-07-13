import service from './payment_service';

export const get_payment_products = async (req, res) => {
  try {
    const data = await service.get_payment_products(req.body);
    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Data Berhasil Diambil',
      data: data,
    });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({
      code: 500,
      status: 'error',
      message: error.message,
    });
  }
};

//QRIS Payment
// exports.payment_qris = async (req, res) => {
//     try {
//         const dataPayment = await service.payment_qris(req.body);
//         res.status(200).json({
//             code: 200,
//             status: "success",
//             message: "Payment Berhasil",
//             data: dataPayment
//         });
//     } catch (error) {
//         res.status(500).json({
//             code: 500,
//             status: "error",
//             message: error.message
//         });
//     }
// }
