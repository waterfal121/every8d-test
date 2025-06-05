// 測試發送 Every8d SMS 的功能

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// 基本資訊
const SiteUrl = 'https://e8dapi.e8d.tw';
const custcode = 'e8d';
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
// let tokenCache = {
//   token: null,
//   timestamp: null,
// };
// async function getToken() {
//   const now = Date.now();
//   const validFor = 10 * 60 * 1000; // 10 分鐘

//   // 若 token 尚有效，直接使用快取
//   if (tokenCache.token && now - tokenCache.timestamp < validFor) {
//     console.log('get token from cache');
//     return tokenCache.token;
//   }

//   // 否則重新取得
//   const res = await axios.post(
//     `${SiteUrl}/${custcode}/getoken`,
//     { uid, pwd },
//     { headers: { 'Content-Type': 'application/json' } }
//   );
//   const newToken = res?.data?.data?.token;
//   console.log('get new token');

//   // 更新快取
//   if (newToken) {
//     tokenCache.token = newToken;
//     tokenCache.timestamp = now;
//   }

//   return newToken;
// }

async function sendSMS(token, sendtime = '') {
  const res = await axios.post(
    `${SiteUrl}/${custcode}/sendsms`,
    {
      uid, // must be set
      // pwd,
      token, // must be set
      subject: '測試主旨',
      msg: '安安你好！這是 evry8d 測試簡訊 from Jeff Lai', // must be set
      mobiles: '+886975031751', // must be set
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

async function sendParamSMS(token) {
  const res = await axios.post(
    `${SiteUrl}/${custcode}/sendparam_sms`,
    {
      uid,
      token,
      subject: '參數簡訊測試',
      paramsContent: '親愛的%field1%您好，您的訂單編號為%field2%',
      retrytime: '1440',
      recipientdatalist: [
        {
          mobile: '+886975031751',
          sendtime: '',
          params: '阿儒,ABC123456',
          mr: 'test-01',
        },
      ],
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  console.log('參數簡訊發送結果：', res.data);
  return res?.data?.data?.batchid;
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
    // 1. 取得 token
    const token = await getToken();
    if (!token) throw new Error('無法取得 token');

    // 2. 發送簡訊或查詢狀態
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
    } else if (action === 'param') {
      const batchid = await sendParamSMS(token);
      console.log('參數簡訊 batchid：', batchid);
    } else if (action === 'cancel') {
      if (!param) throw new Error('請提供要取消的 batchid');
      await cancelSchedule(token, param);
    } else {
      console.log(
        '請指定動作：send、status [batchid]、schedule、cancel [batchid]、param'
      );
    }
  } catch (err) {
    console.error('執行時發生錯誤：', err.message);
  }
})();
