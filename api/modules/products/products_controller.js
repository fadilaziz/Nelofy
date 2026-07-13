const service = require('./products_service')

//Get all data product 
exports.get_products = async (req,res) => {
    const data = await service.get_products();
    res.status(data.code).json(data);
}

//Ambil data order untuk notifikasi
exports.get_order_notification = async (req,res) => {
    const data = await service.get_order_notification(req.userId);
    res.status(data.code).json(data);
}