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

class Merchant {
    /**
     * 5.取得廠商驗證碼
     * @param {*} ConsumerInfo 
     * @param {*} OrderInfo 
     * @returns 
     */
    async GetTokenbyBindingCard(ConsumerInfo, OrderInfo, CustomField = "", OrderResultURL = "") {
        var data = {
            MerchantID: process.env.ECPAY_MERCHANT_ID,
            ConsumerInfo: {
                Email: "onetime@evoasis.com.tw",
                ...ConsumerInfo
            },
            OrderInfo: {
                MerchantTradeDate: moment.tz('Asia/Taipei').format("YYYY/MM/DD HH:mm:ss"),
                TotalAmount: process.env.BINDING_CARD_AMOUNT,
                TradeDesc: process.env.BINDING_CARD_DESC,
                ItemName: process.env.BINDING_CARD_ITEMNAME,
                ReturnURL: `${process.env.WEB_API_HOST}/EcPay/BindCardOrderReturnURL`,
                ...OrderInfo
            },
            OrderResultURL: OrderResultURL,
            CustomField: CustomField
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

        var resp = await axios.post("/Merchant/GetTokenbyBindingCard", body);

        var decryptData = DeCrypt(resp.data.Data);
        var decodeData = urldecode(decryptData);

        var {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            Token,
            TokenExpireDate
        } = JSON.parse(decodeData);

        return {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            Token,
            TokenExpireDate
        }
    }

    /**
     * 7.建立綁定信用卡交易
     * @param {*} bindCardPayToken 
     * @param {*} merchantMemberID 
     * @returns 
     */
    async CreateBindCard(bindCardPayToken, merchantMemberID) {
        var data = {
            MerchantID: process.env.ECPAY_MERCHANT_ID,
            BindCardPayToken: bindCardPayToken,
            MerchantMemberID: merchantMemberID
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

        var { data } = await axios.post("/Merchant/CreateBindCard", body);

        var decryptData = DeCrypt(data.Data);
        var decodeData = urldecode(decryptData);

        var {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            OrderInfo,
            ThreeDInfo
        } = JSON.parse(decodeData);
        var {
            MerchantTradeNo
        } = OrderInfo;
        var {
            ThreeDURL
        } = ThreeDInfo;

        return {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            OrderInfo: {
                MerchantTradeNo
            },
            ThreeDInfo: {
                ThreeDURL
            }
        }
    }

    /**
     * 8.將 ReturnUrl 回來的 Data 解碼
     * @param {*} responseBody 
     * @returns
     */
    async GetReturnResponse(responseBody) {
        var {
            MerchantID,
            TransCode,
            TransMsg,
            Data
        } = responseBody;

        var decryptData = DeCrypt(Data);
        var decodeData = urldecode(decryptData);
        var {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            MerchantMemberID,
            BindCardID,
            CardInfo,
            OrderInfo,
            CustomField
        } = JSON.parse(decodeData);
        var {
            Card6No,
            Card4No,
            CardValidYY,
            CardValidMM,
            AuthCode,
            Gwsr,
            ProcessDate,
            Amount,
            Eci,
            IssuingBank,
            IssuingBankCode
        } = CardInfo;
        var {
            MerchantTradeNo,
            TradeNo,
            PaymentDate,
            TradeAmt,
            PaymentType,
            TradeDate,
            ChargeFee,
            TradeStatus
        } = OrderInfo;
        return {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            MerchantMemberID,
            BindCardID,
            CardInfo: {
                Card6No,
                Card4No,
                CardValidYY,
                CardValidMM,
                AuthCode,
                Gwsr,
                ProcessDate,
                Amount,
                Eci,
                IssuingBank,
                IssuingBankCode
            },
            OrderInfo: {
                MerchantTradeNo,
                TradeNo,
                PaymentDate,
                TradeAmt,
                PaymentType,
                TradeDate,
                ChargeFee,
                TradeStatus
            },
            CustomField
        }
    }

    /**
     * 9.查詢會員綁定信用卡資料
     * @param {*} merchantMemberID 
     * @returns 
     */
    async GetMemberBindCard(merchantMemberID) {
        var data = {
            MerchantID: process.env.ECPAY_MERCHANT_ID,
            MerchantMemberID: merchantMemberID
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

        var { data } = await axios.post("/Merchant/GetMemberBindCard", body);

        var decryptData = DeCrypt(data.Data);
        var decodeData = urldecode(decryptData);

        var {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            MerchantMemberID,
            BindCardList
        } = JSON.parse(decodeData);
        var {
            Card6No,
            Card4No,
            CardValidYY,
            CardValidMM,
            BindCardID
        } = BindCardList

        return {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            MerchantMemberID,
            BindCardList: {
                Card6No,
                Card4No,
                CardValidYY,
                CardValidMM,
                BindCardID
            }
        };
    }

    /**
     * 10.刪除綁定信用卡
     * @param {*} bindCardID 
     * @returns 
     */
    async DeleteMemberBindCard(bindCardID) {
        var data = {
            MerchantID: process.env.ECPAY_MERCHANT_ID,
            BindCardID: bindCardID
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

        var { data } = await axios.post("/Merchant/DeleteMemberBindCard", body);

        var decryptData = DeCrypt(data.Data);
        var decodeData = urldecode(decryptData);

        var {
            RtnCode,
            RtnMsg
        } = JSON.parse(decodeData);

        return {
            RtnCode,
            RtnMsg
        };
    }

    /**
     * 11.幕後交易授權
     * @param {*} bindCardID 
     * @param {*} merchantTradeNo 
     * @param {*} totalAmount 
     * @param {*} merchantMemberID 
     * @returns 
     */
    async CreatePaymentWithCardID(bindCardID, merchantTradeNo, totalAmount, merchantMemberID, CustomField = "") {
        var data = {
            MerchantID: process.env.ECPAY_MERCHANT_ID,
            BindCardID: bindCardID,
            OrderInfo: {
                MerchantTradeDate: moment.tz('Asia/Taipei').format("YYYY/MM/DD HH:mm:ss"),
                MerchantTradeNo: merchantTradeNo,
                TotalAmount: totalAmount,
                ReturnURL: `${process.env.WEB_API_HOST}/EcPay/SettledOrderReturnURL`,
                TradeDesc: process.env.TRADE_DESC,
                ItemName: process.env.ITEM_NAME
            },
            ConsumerInfo: {
                MerchantMemberID: merchantMemberID,
            },
            CustomField: CustomField
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

        var { data } = await axios.post("/Merchant/CreatePaymentWithCardID", body);

        var decryptData = DeCrypt(data.Data);
        var decodeData = urldecode(decryptData);

        var {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            OrderInfo,
            CardInfo,
            CoBrandingInfo
        } = JSON.parse(decodeData);
        if(RtnCode != 1)
            return {
                RtnCode,
                RtnMsg
            }

        var {
            MerchantTradeNo,
            TradeNo,
            PaymentDate,
            TradeAmt,
            PaymentType,
            TradeDate,
            ChargeFee,
            TradeStatus
        } = OrderInfo;
        var {
            Card6No,
            Card4No,
            IssuingBank,
            IssuingBankCode,
            AuthCode,
            Gwsr,
            ProcessDate,
            Amount
        } = CardInfo;
        var {
            CoBrandingCode,
            Comment
        } = CoBrandingInfo;

        return {
            RtnCode,
            RtnMsg,
            PlatformID,
            MerchantID,
            OrderInfo: {
                MerchantTradeNo,
                TradeNo,
                PaymentDate,
                TradeAmt,
                PaymentType,
                TradeDate,
                ChargeFee,
                TradeStatus
            },
            CardInfo: {
                Card6No,
                Card4No,
                IssuingBank,
                IssuingBankCode,
                AuthCode,
                Gwsr,
                ProcessDate,
                Amount
            },
            CoBrandingInfo: {
                CoBrandingCode,
                Comment
            }
        };
    }


}

module.exports = Merchant;