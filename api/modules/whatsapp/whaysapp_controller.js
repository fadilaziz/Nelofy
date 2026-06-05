const services = require('../checkout/checkout_services');

exports.send_message = async (req, res) => {
    data = await services.capture_payload_send_wa(data);
    // data = await service.validasi_payload_send_wa(data);
    // data = await service.hit_api_woowa_send_wa(data);
    // res.status(data.code).json(data);
};