const {
    create,
    AxiosInstance
} = require("axios");
/** @type {AxiosInstance} */
const axios = create({
    baseURL: process.env.ECPAY_URL_BASE_URL
});
const moment = require('moment-timezone');
const urlencode = require('urlencode');
const urldecode = require('urldecode');
const {
    EnCrypt,
    DeCrypt
} = require('../../Component/AES');

class CreditDetail {

    /**
     * 12.查詢信用卡單筆明細紀錄
     * @param {*} merchantTradeNo 
     * @returns 
     */
    async QueryTrade(merchantTradeNo){
        var data = {
            MerchantID: process.env.ECPAY_MERCHANT_ID,
            MerchantTradeNo: merchantTradeNo
        }
        var body = {
            MerchantID: process.env.ECPAY_MERCHANT_ID,
            RqHeader: {
                Timestamp: Number(moment().format('X'))
            },
            Data: null
        };

        var urlencodestr = urlencode(JSON.stringify(data));
        var encs = EnCrypt(urlencodestr);
        body.Data = encs;

        var resp = await axios.post("/CreditDetail/QueryTrade", body);

        var decryptData = DeCrypt(resp.data.Data);
        var decodeData = urldecode(decryptData);

        var {
            RtnMsg,
            RtnValue,
            TradeID,
            Amount,
            ClsAmt,
            AuthTime,
            Status,
            CloseData
        } = JSON.parse(decodeData);
        var {
            Status,
            Amount,
            DateTime
        } = CloseData;

        return {
            RtnMsg,
            RtnValue,
            TradeID,
            Amount,
            ClsAmt,
            AuthTime,
            Status,
            CloseData: {
                Status,
                Amount,
                DateTime
            } 
        };
    }
}

module.exports = CreditDetail;