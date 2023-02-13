
const DBHelper = require('../Component/DB/DBHelper');
const {
    EcPayApi,
    SMSApi
} = require('../ExternalApi');

class Order {

    async CreatOrder(sessionId){
        var orderId = await DBHelper.CreatOrder({
            sessionId: sessionId
        });

        return orderId
    }

    async SetOrderData(sessionId, orderData, eInvoiceTypeData) {
        if(eInvoiceTypeData.CarruerNum)
            await EcPayApi.EInvoiceV3.CheckBarcode(eInvoiceTypeData.CarruerNum);

        orderData.EInvoice = eInvoiceTypeData;
        orderData.email = eInvoiceTypeData.email;

        var order = await DBHelper.GetAndUpdateOrderBySessionId(sessionId, orderData);

        if(!order?.MerchantTradeNo){
            var orderId = await DBHelper.CreatOrder(orderData);
            orderData.MerchantTradeNo = orderId;
        }        

        return orderData;
    }

    async SetOrderPhone(sessionId, phone){
        var order = await DBHelper.GetAndUpdateOrderBySessionId(sessionId, {
            phone
        });

        return order;
    }

    async SendSMS(sessionId) {
        var order = await DBHelper.GetOrder(sessionId);

        if(!order.phone)
            throw new Error("手機未設定");

        var text = process.env.SMS_TEXT;
        text = text.replaceAll("$ststus_url$", process.env.CHARGE_POINTS_STATUS_URL);
        text = text.replaceAll("$sessionId$", sessionId);

        await SMSApi.SendSMS(order.phone, text);
    }
}

module.exports = new Order();