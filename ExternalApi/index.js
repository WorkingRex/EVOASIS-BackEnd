var EvoasisApi = require('./EvoasisApi');
var SMSApi = require('./SMSApi');

// 匯出模組
module.exports = {
    EvoasisApi : new EvoasisApi(),
    EcPayApi: require('./EcPay'),
    SMSApi: new SMSApi()
};