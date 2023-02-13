const {
    create,
    AxiosInstance
} = require("axios");
/** @type {AxiosInstance} */
const axios = create({
    baseURL: process.env.MITAKE_API_BASE_HOST
});

class SMSApi {
    async SendSMS(phone, text) {
        var un = process.env.MITAKE_USERNAME,
            pw = process.env.MITAKE_PASSWORD;
        text = encodeURIComponent(text)
        await axios.get(`/api/mtk/SmSend?username=${un}&password=${pw}&dstaddr=${phone}&CharsetURL=UTF-8&smbody=${text}`);
    }
}

module.exports = SMSApi