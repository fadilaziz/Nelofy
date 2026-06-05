import sql from '../../database/db';
import { send_email } from './send_email.js';

// Send Email
export const send_email_worker = async () => {
  //Ambil data queue yang statusnya pending dan type email
  const data_email = await sql`
    SELECT message,destination,subject
    FROM queue
    WHERE type = 'email' AND status = 'pending'`;

  //Jika data email tidak ada, maka return
  if (data_email.length === 0) {
    return;
  }

  //Cek apakah semua pesan email berhasil terkirim
  const data_email2 = await sql`
    SELECT type,status
    FROM queue
    WHERE type = 'email'`;

  if (data_email2.length === 0) {
    return; //berhenti jika semua pesan berhasil terkirim
  }

  //Data yang dibutuhkan untuk mengirim pesan email
  const email_subject = data_email[0].subject;
  const email_message = data_email[0].message;
  const email_destination = data_email[0].destination;

  //Data yang dibutuhkan untuk mengirim pesan email
  const data = {
    subject: email_subject,
    message: email_message,
    destination: email_destination,
  };

  //Kirim email
  // const email = require('./send_email');
  await send_email(data);

  //Update status email
  await sql`
    UPDATE queue
    SET status = 'success'
    WHERE type = 'email' AND status = 'pending'`;
};
