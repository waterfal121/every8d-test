// 測試發送 Every8d 一般簡訊
// 依據 API 規格書 v3.0：使用 router 為 `/sendsms`，方法 POST，Content-Type 為 application/json

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// 基本資訊
const SiteUrl = 'https://e8dapi.e8d.tw';
const custcode = 'e8d'; //
const uid = process.env.uid;
const pwd = process.env.pwd;

async function getToken() {
  const res = await axios.post(
    `${SiteUrl}/${custcode}/getoken`,
    {
      uid,
      pwd,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return res?.data?.data?.token || null;
}

async function sendSMS(token, sendtime = '') {
  const res = await axios.post(
    `${SiteUrl}/${custcode}/sendsms`,
    {
      uid,
      token,
      subject: '測試主旨',
      msg: '安安你好！這是 evry8d 測試簡訊 from Jeff Lai',
      mobiles: '+886975031751',
      sendtime,
      retrytime: '1440',
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  const batchid = res?.data?.data?.batchid;
  console.log('SMS Response:', res.data);
  return batchid;
}

async function cancelSchedule(token, batchid) {
  const res = await axios.post(
    `${SiteUrl}/${custcode}/cancelbooking`,
    {
      uid,
      token,
      batchid,
      type: 'SMS',
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  console.log('取消排程結果：', res.data);
}

async function getSMSStatus(token, batchid) {
  const res = await axios.post(
    `${SiteUrl}/${custcode}/getdrstatus`,
    {
      uid,
      token,
      batchid,
      type: 'SMS',
      pageno: '1',
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  console.log('查詢發送狀態回應：', res.data);
  console.log(res.data.data);
}

// CLI 執行區塊
const action = process.argv[2];
const param = process.argv[3];

(async () => {
  try {
    const token = await getToken();
    if (!token) throw new Error('無法取得 token');

    if (action === 'send') {
      const batchid = await sendSMS(token);
      console.log('Batch ID:', batchid);
    } else if (action === 'status') {
      if (!param) throw new Error('請提供 batchid');
      await getSMSStatus(token, param);
    } else if (action === 'schedule') {
      const scheduleTime = '20250529173000'; // yyyyMMddHHmmss
      const batchid = await sendSMS(token, scheduleTime);
      console.log('排程發送 batchid：', batchid);
    } else if (action === 'cancel') {
      if (!param) throw new Error('請提供要取消的 batchid');
      await cancelSchedule(token, param);
    } else {
      console.log('請指定動作：send 或 status [batchid]');
    }
  } catch (err) {
    console.error('執行時發生錯誤：', err.message);
  }
})();
