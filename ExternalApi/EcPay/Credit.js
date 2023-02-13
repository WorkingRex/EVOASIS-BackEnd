const {
    create,
    AxiosInstance
} = require("axios");
/** @type {AxiosInstance} */
const axios = create({
    baseURL: process.env.ECPAY_URL_BASE_URL
});
const moment = require('moment');
const urlencode = require('urlencode');
const urldecode = require('urldecode');
const {
    EnCrypt,
    DeCrypt
} = require('../../Component/AES');


class Credit {

    /**
     * 13.信用卡請退款功能
     * @param {*} merchantTradeNo 特店交易編號
     * @param {*} tradeNo 綠界交易編號
     * @param {"C"|"R"|"E"|"N"} action 執行方式 C:"關帳", R:"退刷", E:"取消", N:"放棄"
     * @param {*} totalAmount 金額
     * @returns 
     */
    async DoAction(merchantTradeNo, tradeNo, action, totalAmount){
        var data = {
            MerchantID: process.env.ECPAY_MERCHANT_ID,
            MerchantTradeNo: merchantTradeNo,
            TradeNo: tradeNo,
            Action: action,
            TotalAmount: totalAmount
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

        var { data } = await axios.post("/Credit/DoAction", body);

        var decryptData = DeCrypt(data.Data);
        var decodeData = urldecode(decryptData);

        var {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            MerchantTradeNo,
            TradeNo
        } = JSON.parse(decodeData);

        return {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            MerchantTradeNo,
            TradeNo
        };
    }
}

module.exports = Credit;