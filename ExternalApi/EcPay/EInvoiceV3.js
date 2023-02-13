const {
    create,
    AxiosInstance
} = require("axios");
/** @type {AxiosInstance} */
const axios = create({
    baseURL: process.env.ECPAY_EINVOICE_BASE_URL
});
const crypto = require('crypto')
const moment = require('moment');
const urlencode = require('urlencode');
const urldecode = require('urldecode');

const CryptoJS = require('crypto-js')
const key = process.env.ECPAY_EINVOICE_HASH_KEY;
const iv = process.env.ECPAY_EINVOICE_HASH_IV;

let key2 = CryptoJS.enc.Utf8.parse(key) // key：必須16個字元
let iv2 = CryptoJS.enc.Utf8.parse(iv); // 偏移量：必須16個字元

var EnCrypt = function encrypt(data) {
    let encrypted = CryptoJS.AES.encrypt(data, key2, {
        iv: iv2,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    // 返回的是base64格式的密文
    return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
}
var DeCrypt = function decrypt(data) {
    //let encryptedHexStr = CryptoJS.enc.Base64.parse(data);
    //let srcs = CryptoJS.enc.Base64.stringify(data);
    let decrypted = CryptoJS.AES.decrypt(data, key2, {
        iv: iv2,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    let decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}

class EInvoiceV3 {

    async CheckBarcode(barCode) {
        var data = {
            MerchantID: process.env.ECPAY_EINVOICE_MERCHANT_ID,
            BarCode: barCode
        }
        var body = {
            MerchantID: process.env.ECPAY_EINVOICE_MERCHANT_ID,
            RqHeader: {
                Timestamp: Number(moment().format('X'))
            },
            Data: null
        };

        var urlencodestr = urlencode(JSON.stringify(data));
        var encs = EnCrypt(urlencodestr);
        body.Data = encs;

        var resp = await axios.post(`/B2CInvoice/CheckBarcode`, body);

        var decryptData = DeCrypt(resp.data.Data);
        var decodeData = urldecode(decryptData);

        var {
            RtnCode,
            RtnMsg,
            IsExist
        } = JSON.parse(decodeData);

        return {
            RtnCode,
            RtnMsg,
            IsExist
        };
    }

    async CheckLoveCode(loveCode) {
        var data = {
            MerchantID: process.env.ECPAY_EINVOICE_MERCHANT_ID,
            LoveCode: loveCode
        }
        var body = {
            MerchantID: process.env.ECPAY_EINVOICE_MERCHANT_ID,
            RqHeader: {
                Timestamp: Number(moment().format('X'))
            },
            Data: null
        };

        var urlencodestr = urlencode(JSON.stringify(data));
        var encs = EnCrypt(urlencodestr);
        body.Data = encs;

        var resp = await axios.post(`/B2CInvoice/CheckLoveCode`, body);

        var decryptData = DeCrypt(resp.data.Data);
        var decodeData = urldecode(decryptData);

        var {
            RtnCode,
            RtnMsg,
            IsExist
        } = JSON.parse(decodeData);

        return {
            RtnCode,
            RtnMsg,
            IsExist
        };
    }

    async CreateIssue(issueData, OrderId) {
        var data = {
            ...issueData,
            MerchantID: process.env.ECPAY_EINVOICE_MERCHANT_ID,
            RelateNumber: OrderId,
            TaxType: 1,
            InvType: "07",
            vat: 1
        }
        var body = {
            MerchantID: process.env.ECPAY_EINVOICE_MERCHANT_ID,
            RqHeader: {
                Timestamp: Number(moment().format('X'))
            },
            Data: null
        };

        var urlencodestr = urlencode(JSON.stringify(data));
        var encs = EnCrypt(urlencodestr);
        body.Data = encs;

        var resp = await axios.post(`/B2CInvoice/Issue`, body);

        var decryptData = DeCrypt(resp.data.Data);
        var decodeData = urldecode(decryptData);

        var {
            RtnCode,
            RtnMsg,
            InvoiceNo,
            InvoiceDate,
            RandomNumber
        } = JSON.parse(decodeData);

        return {
            RtnCode,
            RtnMsg,
            InvoiceNo,
            InvoiceDate,
            RandomNumber
        };
    }
}

module.exports = EInvoiceV3;    