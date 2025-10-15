const axios = require('axios');
const fs = require('fs');

const AUTHTOKEN = '8875'; //isi aja kalo perlu
const WAYBILL = '201034345270';

async function fetchWaybill(waybillNo, token) {
  const url = 'https://office.jtcargo.co.id/official/waybill/trackingCustomerByWaybillNo';

  try {
    const resp = await axios.post(url,
      {
        waybillNo: waybillNo,
        searchWaybillOrCustomerOrderId: "1"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authtoken': token,
          'Accept': 'application/json, text/plain, /',
          'Origin': 'https://www.jtcargo.id',
        },
        timeout: 20000
      }
    );

    
    console.log(resp.data); //mau liat detailnya ubah jadi resp.data.details
    return resp.data; //bagian ini juga sama kayak yang diatas
  } catch (err) {
    console.error('Error:', err.response ? err.response.status : err.message);
    if (err.response && err.response.data) console.error('Response body:', err.response.data);
    throw err;
  }
}

fetchWaybill(WAYBILL, AUTHTOKEN).catch(()=>process.exit(1));
