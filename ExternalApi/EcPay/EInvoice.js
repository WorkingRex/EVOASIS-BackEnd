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
const {
    FilterUndefined
} = require('../../Component/Extensions');

function UrlEncode(str) {
    str = encodeURIComponent(str);
    str = str
        .replaceAll(" ", "%20")
        .replaceAll("%20", "+")
        .replaceAll("%2D", "-")
        .replaceAll("%5F", "_")
        .replaceAll("%2E", ".")
        .replaceAll("%21", "!")
        .replaceAll("%2A", "*")
        .replaceAll("%28", "(")
        .replaceAll("%29", ")")
        
        .replaceAll("%20", "+")
        .replaceAll("%2d", "-")
        .replaceAll("%5f", "_")
        .replaceAll("%2e", ".")
        .replaceAll("%21", "!")
        .replaceAll("%2a", "*")
        .replaceAll("%28", "(")
        .replaceAll("%29", ")");

    return str;
}

function CreateCheckMacValue(data) {
    // 將傳遞參數依照第一個英文字母，由 A 到 Z 的順序來排序(遇到第一個英名字母相同時，以
    // 第二個英名字母來比較，以此類推)，並且以&方式將所有參數串連。
    var CheckMacValue = Object.keys(data)
        .sort()
        .map((key) => {
            return `${key}=${data[key]}`
        })
        .join('&');

    // 參數最前面加上 HashKey、最後面加上 HashIV
    CheckMacValue = `HashKey=${process.env.ECPAY_EINVOICE_HASH_KEY}&${CheckMacValue}&HashIV=${process.env.ECPAY_EINVOICE_HASH_IV}`;

    // 將整串字串進行 URL encode
    CheckMacValue = UrlEncode(CheckMacValue);

    // 轉為小寫
    CheckMacValue = CheckMacValue.toLowerCase();

    const hash = crypto.createHash('md5')
    hash.update(CheckMacValue)

    CheckMacValue = hash.digest('hex');
    CheckMacValue = CheckMacValue.toLocaleUpperCase();

    return CheckMacValue;
}

class EInvoice {

    async SendRequest(url, data) {
        data.CheckMacValue = CreateCheckMacValue(data) + "a";
        return await axios.post(url, data);
    }

    async CreateInvoice(data) {
        var bodyData = {
            ...data,
            TimeStamp: Number(moment().format('X')),
            MerchantID: process.env.ECPAY_EINVOICE_MERCHANT_ID
        }

        if (bodyData.CustomerName) bodyData.CustomerName = UrlEncode(bodyData.CustomerName);
        if (bodyData.CustomerAddr) bodyData.CustomerAddr = UrlEncode(bodyData.CustomerAddr);
        if (bodyData.CustomerEmail) bodyData.CustomerEmail = UrlEncode(bodyData.CustomerEmail);
        if (bodyData.InvoiceRemark) bodyData.InvoiceRemark = UrlEncode(bodyData.InvoiceRemark);
        if (bodyData.ItemName) bodyData.ItemName = UrlEncode(bodyData.ItemName);
        if (bodyData.ItemWord) bodyData.ItemWord = UrlEncode(bodyData.ItemWord);
        if (bodyData.ItemRemark) bodyData.ItemRemark = UrlEncode(bodyData.ItemRemark);

        var macValueData = Object.assign({}, bodyData);
        delete macValueData.InvoiceRemark;
        delete macValueData.ItemName;
        delete macValueData.ItemCount;
        delete macValueData.ItemWord;
        delete macValueData.ItemRemark;
        bodyData.CheckMacValue = CreateCheckMacValue(macValueData);

        var req = await axios.post(`/Invoice/Issue`, bodyData);
        return req;
    }

    async CheckMobileBarCode(barCode) {
        var body = {
            TimeStamp: Number(moment().format('X')),
            MerchantID: process.env.ECPAY_EINVOICE_MERCHANT_ID,
            BarCode: barCode,
        }
        body.CheckMacValue = CreateCheckMacValue(body);

        var req = await axios.post(`/Query/CheckMobileBarCode`, body);
        return req;
    }
}

module.exports = EInvoice;