const {
    EcPayApi
} = require('../ExternalApi');
const DBHelper = require('../Component/DB/DBHelper');

async function CreateInvoiceFunc(orderData) {
    var amount = orderData.SettledOrder.TradeAmt;
    var data = {
        CustomerPhone: orderData.phone,
        CustomerEmail: orderData.EInvoice.email,
        CarrierType: "",
        TaxType: 1,
        SalesAmount: amount,
        Items: [
            {
                ItemName: process.env.ECPAY_EINVOICE_ITEM_NAME,
                ItemCount: 1,
                ItemWord: process.env.ECPAY_EINVOICE_ITEM_UNIT,
                ItemPrice: amount,
                ItemAmount: amount
            }
        ],
        InvType: "07",
        vat: 1
    }
    switch(orderData.EInvoice.EInvoiceType){
        case 0: // 捲贈
            data = {
                ...data,
                Print: 0,
                Donation: 1,
                LoveCode: process.env.ECPAY_EINVOICE_LOVE_CODE
            };
            break;
        case 1: // 手機載具
            data = {
                ...data,
                Print: 1,
                Donation: 0,
                CarrierType: 3,
                CarrierNum: orderData.EInvoice.CarruerNum
            };
            break;
        case 2: // 統一編號
            data = {
                ...data,
                CustomerIdentifier: orderData.EInvoice.CustomerIdentifier,
                CustomerName: orderData.EInvoice.CompanyTitle,
                CustomerAddr: orderData.EInvoice.email,
                Print: 1,
                Donation: 0
            };
            break;
    }

    var result = await EcPayApi.EInvoiceV3.CreateIssue(data, orderData.SettledOrder.MerchantTradeNo);

    await DBHelper.GetAndUpdateOrderBySessionId(orderData.sessionId, {
        EInvoice: {
            ...orderData.EInvoice,
            InvoiceNo: result.InvoiceNo,
            InvoiceDate: result.InvoiceDate
        },
        BindCardOrder: {
            ...orderData.BindCardOrder,
            BindCardID: null
        }
    })

    return result;
}

class EcPay {
    /**
     * 取得廠商驗證碼
     */
    async GetTokenbyBindingCard(sessionId, orderId) {
        var ConsumerInfo = {
            MerchantMemberID: sessionId
        }
        var OrderInfo = {
            MerchantTradeNo: orderId,
            TotalAmount: 50,
            TradeDesc: "充電完畢將刷退餘額",
            ItemName: "非會員充電預刷金50元",
        }

        var {
            RtnCode,
            RtnMsg,
            Token,
            TokenExpireDate,
        } = await EcPayApi.Merchant.GetTokenbyBindingCard(ConsumerInfo, OrderInfo, sessionId, `${process.env.ECPAY_ORDER_RESULT_URL}`.replaceAll("$sessionId$", sessionId));

        if (RtnCode != 1)
            throw new Error(RtnMsg);

        return {
            orderId,
            RtnCode,
            RtnMsg,
            Token,
            TokenExpireDate
        };
    }

    /**
     * 建立綁定信用卡交易
     */
    async CreateBindCard(sessionId, bindCardPayToken) {
        var {
            RtnCode,
            RtnMsg,
            OrderInfo,
            ThreeDInfo
        } = await EcPayApi.Merchant.CreateBindCard(bindCardPayToken, sessionId);

        if (RtnCode != 1)
            throw new Error(RtnMsg);

        return {
            RtnCode,
            RtnMsg,
            ThreeDInfo
        }
    }

    /**
     * 綁卡結果通知
     * 綁定後[放棄]
     */
    async SaveBindCardResult(body) {
        var data = await EcPayApi.Merchant.GetReturnResponse(body);

        var {
            BindCardID,
            CardInfo,
            OrderInfo,
            CustomField
        } = data;
        var {
            Card6No,
            Card4No
        } = CardInfo;
        var {
            MerchantTradeNo,
            TradeNo,
            PaymentDate,
            TradeAmt,
            PaymentType,
            TradeDate,
            TradeStatus
        } = OrderInfo;

        await DBHelper.GetAndUpdateOrderBySessionId(CustomField, {
            BindCardOrder:{
                MerchantTradeNo,
                Card4No,
                Card6No,
                PaymentDate,
                PaymentType,
                TradeAmt,
                TradeDate,
                TradeNo,
                TradeStatus,
                BindCardID,
                CustomField
            }
        })

        // 記錄完就直接退款
        await EcPayApi.Credit.DoAction(MerchantTradeNo, TradeNo, "N", process.env.BINDING_CARD_AMOUNT);
    }

    /**
     * 最後結算金額
     * @param {*} body 
     */
    async SaveSettledResult(body){
        var data = await EcPayApi.Merchant.GetReturnResponse(body);

        var {
            BindCardID,
            CardInfo,
            OrderInfo,
            CustomField
        } = data;
        var {
            Card6No,
            Card4No
        } = CardInfo;
        var {
            MerchantTradeNo,
            TradeNo,
            PaymentDate,
            TradeAmt,
            PaymentType,
            TradeDate,
            TradeStatus
        } = OrderInfo;

        var orderData = await DBHelper.GetAndUpdateOrderBySessionId(CustomField, {
            SettledOrder: {
                MerchantTradeNo,
                Card4No,
                Card6No,
                PaymentDate,
                PaymentType,
                TradeAmt,
                TradeDate,
                TradeNo,
                TradeStatus,
                BindCardID,
                CustomField
            }
        });

        await CreateInvoiceFunc(orderData);
    }

    async CreateInvoice(orderData){
        await CreateInvoiceFunc(orderData);
    }
}

module.exports = new EcPay();