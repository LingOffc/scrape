const axios = require('axios');
const fs = require('fs');

const AUTHTOKEN = ''; // kosongkan dulu, biasanya endpoint ini TIDAK butuh token
const WAYBILL = '201034345270';

async function fetchWaybill(waybillNo, token) {
  const url = 'https://office.jtcargo.co.id/official/waybill/trackingCustomerByWaybillNo';

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/javascript, /; q=0.01',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Origin': 'https://www.jtcargo.id',
    'Referer': 'https://www.jtcargo.id/',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Connection': 'keep-alive',
  };

  // beberapa endpoint JT Cargo tidak butuh Authtoken, tapi kalau memang perlu, tambahkan di sini
  if (token) headers['Authtoken'] = token;

  try {
    const response = await axios.post(
      url,
      {
        waybillNo: waybillNo,
        searchWaybillOrCustomerOrderId: '1',
      },
      { headers }
    );

    const data = response.data?.data?.[0];
    if (!data) {
      console.log('❌ Tidak ada data ditemukan untuk resi ini.');
      return;
    }

    fs.writeFileSync('tracking_raw.json', JSON.stringify(data, null, 2));

    const details = data.details.sort((a, b) => new Date(a.scanTime) - new Date(b.scanTime));

    const translate = (text) => {
      const dict = {
        '快件揽收': 'Paket telah dijemput kurir',
        '发件扫描': 'Paket dikirim ke tujuan berikutnya',
        '中心到件': 'Paket tiba di gudang transit',
        '到件扫描': 'Paket tiba di cabang tujuan',
        '出仓扫描': 'Paket sedang dikirim oleh kurir',
        '快件签收': 'Paket telah diterima',
        '已签收': 'Telah diterima',
        '派件中': 'Sedang dikirim',
        '运送中': 'Dalam perjalanan',
        '已揽件': 'Telah dijemput',
      };
      return dict[text] || text;
    };

    console.log('==============================================');
    console.log(`📦 Nomor Resi   : ${data.keyword}`);
    console.log(`🏠 Asal         : ${data.senderCityName || '-'} `);
    console.log(`🎯 Tujuan       : ${data.receiverCityName || '-'} `);
    console.log(`🚛 Layanan      : ${data.expressTypeName || '-'} `);
    console.log(`⚖  Berat       : ${data.packageTotalWeight || '-'} kg`);
    console.log('==============================================\n');

    console.log('📍 Riwayat Perjalanan Paket:\n');
    details.forEach((d) => {
      const waktu = new Date(d.scanTime).toLocaleString('id-ID');
      const status = translate(d.scanTypeName);
      console.log(`🕒 ${waktu}`);
      console.log(`   📍 ${d.scanNetworkCity} — ${d.scanNetworkName}`);
      console.log(`   🚚 ${status}`);
      if (d.remark1) console.log(`   📝 Catatan: ${d.remark1}`);
      console.log('----------------------------------------------');
    });

    const terakhir = details[details.length - 1];
    console.log(`\n✅ Status Akhir: ${translate(terakhir.scanTypeName)} (${terakhir.scanNetworkCity})`);
    console.log('==============================================');

  } catch (err) {
    console.error('❌ Gagal mengambil data:', err.response?.status || err.message);
    if (err.response?.data) {
      console.log('📩 Response body:', err.response.data);
    }
  }
}

const DELAY_MS = 5 * 60 * 1000; // 5 menit
console.log(`🚀 Auto loop dimulai (interval: ${DELAY_MS / 1000} detik)...`);
fetchWaybill(WAYBILL, AUTHTOKEN);

setInterval(() => {
  console.log(`\n🔁 Mengecek ulang pada ${new Date().toLocaleTimeString()}...\n`);
  fetchWaybill(WAYBILL, AUTHTOKEN);
}, DELAY_MS);
