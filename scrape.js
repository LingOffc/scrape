const axios = require('axios');
const fs = require('fs');

const AUTHTOKEN = '8875'; // isi token kalau memang dibutuhkan (kadang tidak perlu)
const WAYBILL = '201034345270';

async function fetchWaybill(waybillNo, token) {
  const url = 'https://office.jtcargo.co.id/official/waybill/trackingCustomerByWaybillNo';

  // headers standar browser
  const commonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Origin': 'https://www.jtcargo.id',
    'Referer': 'https://www.jtcargo.id/',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive'
  };

  try {
    // 🔹 Coba request dengan token (kalau ada)
    const headersWithToken = token ? { ...commonHeaders, 'Authtoken': token } : commonHeaders;

    const resp = await axios.post(
      url,
      {
        waybillNo: waybillNo,
        searchWaybillOrCustomerOrderId: "1"
      },
      {
        headers: headersWithToken,
        timeout: 20000
      }
    );

    console.log("✅ Request sukses!");
    console.log(JSON.stringify(resp.data, null, 2));

    // simpan hasil ke file JSON
    fs.writeFileSync('tracking_result.json', JSON.stringify(resp.data, null, 2));
    console.log("📁 Hasil disimpan ke tracking_result.json");

    return resp.data;
  } catch (err) {
    console.error('❌ Error:', err.response ? err.response.status : err.message);

    if (err.response) {
      console.error('Response body:', err.response.data);

      // 🔸 Kalau error 406, coba ulang tanpa token
      if (err.response.status === 406 && token) {
        console.log("⚠️  Error 406, mencoba ulang tanpa Authtoken...");
        return fetchWaybill(waybillNo, null);
      }
    } else {
      console.error('Tidak ada respon dari server.');
    }

    throw err;
  }
}

fetchWaybill(WAYBILL, AUTHTOKEN)
  .then(() => console.log("Selesai."))
  .catch(() => process.exit(1));
