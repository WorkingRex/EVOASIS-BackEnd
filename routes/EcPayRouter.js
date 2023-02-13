// 引入套件
const express = require('express');
const router = express.Router();
const EcPay = require('../Application/EcPay');
const Order = require('../Application/Order');
const {
    CheckHeaderSessionId
} = require('../Middleware/HeaderMiddleware');
const DBHelper = require('../Component/DB/DBHelper');

router.get('/GetTokenbyBindingCard', CheckHeaderSessionId, async (req, res, next) => {
    try {
        
        var MerchantTradeNo = await Order.CreatOrder(req.sessionID);

        var result = await EcPay.GetTokenbyBindingCard(req.sessionID, MerchantTradeNo);

        req.session.OrderData = {
            ...req.session.OrderData,
            MerchantTradeNo: MerchantTradeNo
        }

        res.send(result);   
    } catch (error) {
        next(error);
    }
})

router.post('/CreateBindCard', CheckHeaderSessionId, async (req, res, next) => {
    try {
        var sessionId = req.sessionID;
        var {
            BindCardPayToken
        } = req.body;

        var result = await EcPay.CreateBindCard(sessionId, BindCardPayToken);

        res.send(result);
    } catch (err) {
        next(err);
    }
})

router.post('/BindCardOrderReturnURL', async (req, res, next) => {
    try {
        await EcPay.SaveBindCardResult(req.body);
        res.send("1|OK");
    } catch (err) {
        next(err);
    }
})

router.post('/SettledOrderReturnURL', async (req, res, next) => {
    try {
        await EcPay.SaveSettledResult(req.body);
        res.send("1|OK");
    } catch (err) {
        next(err);
    }
})

// router.post('/test', async (req, res, next) => {
//     try {
//         var orderData = await DBHelper.GetOrder("6ef50dc8-edec-40d4-8d92-d8e9cf774062");
//         var result = await EcPay.CreateInvoice(orderData);

//         res.send(result)
//     } catch(err) {
//         next(err)   
//     }
// })

module.exports = router;