// 引入套件
const express = require('express');
const router = express.Router();
const Evoasis = require('../Application/Evoasis');
const {
    v4: uuidv4
} = require("uuid");
const {
    CheckHeaderSessionId
} = require('../Middleware/HeaderMiddleware');


var notifyWebSocket = new Map();
function SendDataToWSs(chargePointSessionId, data) {
    var {
        status,
        startedAt,
        stoppedAt,
        energy,
        powerKw,
        amount
    } = data;
    try {
        var wsClients = notifyWebSocket.get(String(chargePointSessionId));
        wsClients.forEach(function (client) {
            try {
                client.send(JSON.stringify({
                    status,
                    startedAt,
                    stoppedAt,
                    energy,
                    powerKw,
                    amount
                }));
            } catch { }
        });
    }
    catch { }
}

setInterval(() => {
    if (!notifyWebSocket.size) return;
    notifyWebSocket.forEach(async (value, sessionId) => {
        try{
            var data = await Evoasis.GetChargePointStatus(sessionId);
            SendDataToWSs(sessionId, data);
        } catch {
            
        }
    });
}, parseInt(process.env.CHARGE_POINTS_STATUS_UPDATE_SEC) * 1000)

router.get('/:QRcode', async (req, res, next) => {
    try {
        var qrCode = req.params.QRcode;
        var result = await Evoasis.GetChargePoint(qrCode);
        result = {
            ...result,
            sessionId: req.sessionID
        };
        req.session.OrderData = result;
        res.send(result);
    } catch (error) {
        next(error);
    }
})

router.get('/', async (req, res, next) => {
    var data = req.session.OrderData;
    if (!data) {
        res.status(400).send();
        return;
    }
    res.send(data);
})

router.post('/Start', CheckHeaderSessionId, async (req, res, next) => {
    try {
        var sessionId = req.sessionID;
        var {
            success,
            chargePointSessionId
        } = await Evoasis.StartChargePointCharge(sessionId);

        req.session.OrderData.ChargePointSessionId = chargePointSessionId;

        res.send({
            success,
            chargePointSessionId
        });
    } catch (error) {
        next(error);
    }
})

router.post('/Stop', CheckHeaderSessionId, async (req, res, next) => {
    try {
        var sessionId = req.sessionID;
        var {
            success
        } = await Evoasis.StopChargePointCharge(sessionId);

        res.send({
            success
        });
    } catch (error) {
        // error.message = "error"
        next(error);
    }
})

router.ws('/Status', (ws, req) => {
    var sessionId = req.query.chargePointSessionId;

    if (!notifyWebSocket.has(sessionId)) {
        notifyWebSocket.set(sessionId, new Map());
    }
    var webSocketKey = uuidv4();
    notifyWebSocket.get(sessionId).set(webSocketKey, ws);

    ws.on("close", function () {
        notifyWebSocket
            .get(sessionId)
            .delete(webSocketKey);
        if (!notifyWebSocket.get(sessionId).size)
            notifyWebSocket.delete(sessionId);
    })
})

router.post('/Notify', async (req, res, next) => {
    var {
        notification,
        chargePointId,
        evseId,
        action,
        sessionId,
        idTag,
        externalSessionId,
        startedAtTimestamp,
        stoppedAtTimestamp,
        energyConsumed,
        lastUpdatedAt,
    } = req.body;

    try {
        SendDataToWSs(sessionId, {
            status: action,
            startedAt: startedAtTimestamp,
            stoppedAt: stoppedAtTimestamp
        });

        var data = await Evoasis.GetChargePointStatus(sessionId);
        SendDataToWSs(sessionId, data);

        res.send();
    }
    catch (error) {
        next(error);
    }
})

// 匯出模組
module.exports = router;