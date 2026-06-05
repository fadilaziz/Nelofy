import { send_email_worker } from '../modules/email/email_service.js';
import { send_wa } from '../modules/whatsapp/whatsapp_services.js';

//worker
export const worker10s = async () => {
  try {
    setInterval(() => {
      send_email_worker();
      send_wa();
    }, 10000);
  } catch (e) {
    console.log(e.stack);
    data.code = 500;
    data.status = 'failed';
    data.message = 'failed to send queue';
  }
};
