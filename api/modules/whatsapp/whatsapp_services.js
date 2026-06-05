import axios from 'axios';
import sql from '../../database/db';

//hit api woowa send message
// export const capture_payload_send_wa = async (data) => {
// console.log("ini payload wa",data);
// // data = {
// //     ...data,
// //     code: 200,
// //     status: "success",
// //     message: "success",
// //     data: {}
// // };
// // return data;
// }

// exports.validasi_payload_send_wa = async (data) => {

//     if (data.no_wa == '') {
//         data.message = 'no_wa is required';
//         data.status = 'failed';
//         data.code = 400;
//     }
//     if (data.data.pesan == '') {
//         data.message = 'pesan is required';
//         data.status = 'failed';
//         data.code = 400;
//     }

//     return data;
// }

export const hit_api_woowa_send_wa = async (data) => {
  try {
    const baseUrl = process.env.ENDPOINT_URL;
    const apiKey = process.env.WHATSAPP_API_KEY;

    const payload = {
      phone_no: data.destination,
      key: apiKey,
      message: data.message,
    };

    const response = await axios.post(`${baseUrl}/send_message`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    data.message = response?.data?.results?.message;
    data.code = 200;
    data.status = 'success';
  } catch (error) {
    data.message = 'failed';
    data.status = 'failed';
    data.code = 400;
  }

  return data;
};

//Send whatsapp
export const send_wa = async () => {
  const data = {};
  try {
    //Ambil data worker dari tb queue
    let rows = await sql`
        SELECT message,destination
        FROM queue
        WHERE type = 'whatsapp'
        AND status = 'pending'`;

    //Ambil data type dan status untuk validasi yang di ambil dari yang terbaru
    let rows2 = await sql`
        SELECT type,status
        FROM queue
        WHERE type = 'whatsapp'
        ORDER BY id DESC
        LIMIT 1`;

    //Cek apakah semua pesan whatsapp berhasil terkirim
    if (rows2[0].status == 'success') {
      return; //berhenti jika semua pesan berhasil terkirim
    }

    //Data yang dibutuhkan untuk mengirim pesan whatsapp
    data.message = rows[0].message;
    data.destination = rows[0].destination;

    //Kirim ke whatsapp
    await hit_api_woowa_send_wa(data);

    //Update status queue ke status sukses
    await sql`UPDATE queue SET status='success' WHERE type = 'whatsapp' AND status = 'pending';`;

    data.message = 'success to send wa';
    data.status = 'success';
    data.code = 200;
  } catch (e) {
    console.log(e.stack);
    data.message = 'failed to send wa';
    data.status = 'failed';
    data.code = 400;
  }
  return data;
};
