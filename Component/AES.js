const CryptoJS = require('crypto-js')
const key = process.env.ECPAY_HASH_KEY;
const iv = process.env.ECPAY_HASH_IV;

let key2 = CryptoJS.enc.Utf8.parse(key) // key：必須16個字元
let iv2 = CryptoJS.enc.Utf8.parse(iv); // 偏移量：必須16個字元

module.exports = {
    EnCrypt: function encrypt(data) {
        let encrypted = CryptoJS.AES.encrypt(data, key2, {
            iv: iv2,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        // 返回的是base64格式的密文
        return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
    },
    DeCrypt: function decrypt(data) {
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
}