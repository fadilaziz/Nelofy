const crypto = require('crypto');
const sql = require('../database/db');

// Format Rupiah
exports.formatRupiah = (angka) => {
    // Mengkonversi angka menjadi string dan menambahkan .00 jika tidak ada desimal
    const numericValue = typeof angka === 'string' ? parseFloat(angka) : angka;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericValue || 0);
};

// Ganerate token sebanyak 40 karakter
exports.generateToken = () => {
    const token = crypto.randomBytes(40).toString('hex');
    return token;
};
