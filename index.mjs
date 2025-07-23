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

// 一般簡訊
async function sendSMS(token, sendtime) {
  const res = await axios.post(
    `${SiteUrl}/${custcode}/sendsms`,
    {
      uid, // must be set
      pwd,
      // token, // must be set
      // subject: '測試主旨',
      msg: '安安你好！這是 evry8d 測試簡訊 from Jeff Lai', // must be set
      mobiles: process.env.mobile, // must be set
      sendtime, // 預設為空字串，立即發送；給值則為排程發送，格式為 yyyyMMddHHmmss
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

// 參數簡訊
async function sendParamSMS(token, sendtime) {
  const res = await axios.post(
    `${SiteUrl}/${custcode}/sendparam_sms`,
    {
      uid,
      pwd,
      // token,
      // subject: '參數簡訊測試',
      paramsContent: '親愛的%field1%您好，您的訂單編號為%field2%', // 參數依序代入 %field%
      // paramsContent: '測試沒有參數的參數簡訊',
      // 發送內容沒有 %field% 變數時，則與一般簡訊相同，此時需完全移除參數 (非設定為空字串)
      retrytime: '1440',
      recipientdatalist: [
        {
          mobile: process.env.mobile,
          sendtime, // 預設為空字串，立即發送；給值則為排程發送，格式為 yyyyMMddHHmmss
          params: '小明,ABC123456', // 最多代入 5 個參數，
          // mr: 'test-01',
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

// 取消排程發送的簡訊
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

// 查詢簡訊發送狀態
async function getSMSStatus(token, batchid) {
  const res = await axios.post(
    `${SiteUrl}/${custcode}/getdrstatus`,
    {
      uid,
      token,
      batchid,
      type: 'SMS',
      // pageno: '1',
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
// const sendtime = process.argv[3] || ''; // 預設為空字串，立即發送；給值則為排程發送，格式為 yyyyMMddHHmmss
const bid = process.argv[3];

(async () => {
  try {
    // 1. 取得 token
    const token = await getToken();
    if (!token) throw new Error('無法取得 token');

    // 2. 發送簡訊或查詢狀態
    // 2.1 一般簡訊
    if (action === 'send') {
      const batchid = await sendSMS(token);
      console.log('batchid: ', batchid);
      return;
    }

    // 2.2 排程一般簡訊
    if (action === 'schedule') {
      if (!sendtime) throw new Error('請輸入 sendtime, 格式為 yyyyMMddHHmmss');
      const batchid = await sendSMS(token, sendtime);
      console.log('排程發送 batchid: ', batchid);
      return;
    }

    // 2.3 參數簡訊
    if (action === 'param') {
      const batchid = await sendParamSMS(token, sendtime);
      console.log('參數簡訊 batchid: ', batchid);
      return;
    }

    // 2.4 取消排程發送的簡訊
    if (action === 'cancel') {
      if (!param) throw new Error('請提供要取消的 batchid');
      await cancelSchedule(token, param);
      return;
    }

    // 2.5 查詢簡訊發送狀態
    if (action === 'status') {
      if (!bid) throw new Error('請提供 batchid');
      await getSMSStatus(token, bid);
      return;
    }

    console.log(`
      請執行想測試的項目:
        send /
        schedule sendtime /
        param (sendtime)/
        status [batchid] /
        cancel [batchid] /
      `);
  } catch (err) {
    console.error('執行時發生錯誤：', err.message);
  }
})();
