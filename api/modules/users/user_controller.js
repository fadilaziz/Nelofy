import service from './user_services';

//Mengambil data user paling baru
export const get_current_user = async (req, res) => {
  try {
    const data = await service.get_current_user(req.userId);
    return res.status(200).json({
      code: 200,
      status: 'Success',
      message: 'User Found',
      data: data,
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      status: 'error',
      message: error.message,
    });
  }
};

//Mengambil data transaksi paling baru
export const get_transaction = async (req, res) => {
  try {
    const data = await service.get_transaction(req.userId);
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Transaction Found',
      data: data,
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      status: 'error',
      message: error.message,
    });
  }
};

//Mengambil data pembelian Berhasil
export const get_purchases = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await service.get_purchase(userId);
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Successful Purchases Found',
      data: data,
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      status: 'error',
      message: error.message,
    });
  }
};

//Mengambil semua data order dari
export const get_order = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await service.get_order(userId);
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Order Found',
      data: data,
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      status: 'error',
      message: error.message,
    });
  }
};
