// 引入套件
const express = require('express');
const router = express.Router();
const Order = require('../Application/Order');
const {
    CheckHeaderSessionId
} = require('../Middleware/HeaderMiddleware');

router.get('/', CheckHeaderSessionId, async (req, res, next) => {
    var data = req.session.OrderData;
    if (!data) {
        res.status(400).send();
        return;
    }
    res.send(data);
})

router.post('/Set', CheckHeaderSessionId, async (req, res, next) => {
    try {
        var {
            EInvoiceType,
            CarruerNum,
            email,
            CompanyTitle,
            CustomerIdentifier
        } = req.body;

        var orderData = req.session.OrderData;
        if (!orderData) {
            res.status(400).send();
            return;
        }

        var order = await Order.SetOrderData(req.sessionID, orderData, {
            EInvoiceType,
            CarruerNum,
            email,
            CompanyTitle,
            CustomerIdentifier
        });

        req.session.OrderData = order;

        res.send(order);
    } catch (error) {
        next(error);
    }
})

router.post('/SetNotifyPhone', CheckHeaderSessionId, async (req, res, next) => {
    try {
        var {
            phone
        } = req.body;

        if (!req.sessionID) throw new Error("訂單未建立")

        await Order.SetOrderPhone(req.sessionID, phone);

        req.session.OrderData.phone = phone;

        res.send("OK");
    } catch (error) {
        next(error);
    }
})

router.post('/SendSMS', CheckHeaderSessionId, async (req, res, next) => {
    try {
        if (!req.sessionID) throw new Error("訂單未建立")

        await Order.SendSMS(req.sessionID);

        res.send(`OK`);
    } catch (error) {
        next(error);
    }
})

module.exports = router;