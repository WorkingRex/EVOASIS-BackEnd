const {
    EvoasisApi,
    EcPayApi
} = require('../ExternalApi');
const DBHelper = require('../Component/DB/DBHelper');

class Evoasis {

    async GetChargePoint(QRcode) {
        var result = {};

        var chargePoint = await EvoasisApi.GetChargePointsByQR(QRcode);

        var evse = chargePoint.evses.find((evse) => {
            return evse.physicalReference == QRcode
        });
        var tgid = evse.tariffGroupId
        var connector = evse.connectors[0].type
        var networkId = evse.networkId

        result = {
            chargePointId: chargePoint.id,
            connector: connector,
            networkId: networkId,
            physicalReference: evse.physicalReference
        }

        var tariffGroup = await EvoasisApi.GetTariffGroup(tgid);
        var tid = tariffGroup.tariffIds[0]

        var tariff = await EvoasisApi.GetTariff(tid);   

        var location = await EvoasisApi.GetLocation(chargePoint.locationId);
        
        return {
			physicalReference: evse.physicalReference,
            chargePoint: {
                id: chargePoint.id,
                networkStatus: chargePoint.networkStatus,
                hardwareStatus: chargePoint.hardwareStatus,
                networkProtocol: chargePoint.networkProtocol,
                evse: {
                    networkId: evse.networkId,
                    currentType: evse.currentType,
                    maxPower: evse.maxPower,
                    maxVoltage: evse.maxVoltage,
                    connector,
                    status: evse.status,
                    hardwareStatus: evse.hardwareStatus
                }
            },
            tariff: {
                pricing: {
                    pricePerKwh: Number(tariff.pricing.pricePerKwh)
                }
            },
            location: {
                image: location.location_image.original,
                detailed_description: location.detailed_description,
                name: location.name['zh-TW']
            }
        };
    }

    async StartChargePointCharge(sessionId){
        var {
            chargePoint
        } = await DBHelper.GetOrder(sessionId);

        var {
            success,
            chargePointSessionId
        } = await EvoasisApi.StartChargePointCharge(chargePoint.id, chargePoint.evse.networkId);

        await DBHelper.GetAndUpdateOrderBySessionId(sessionId, {
            ChargePointSessionId: chargePointSessionId
        })

        return {
            success,
            chargePointSessionId            
        };
    }
    
    async StopChargePointCharge(sessionId){
        var {
            chargePoint, 
            ChargePointSessionId,
            BindCardOrder
        } = await DBHelper.GetOrder(sessionId);

        var {
            success,
            message
        } = await EvoasisApi.StopChargePointCharge(chargePoint.id, ChargePointSessionId);

        var {
            amount
        } = await this.GetChargePointStatus(ChargePointSessionId);

        var MerchantTradeNo = await DBHelper.GetOrderId();
        var order = await EcPayApi.Merchant.CreatePaymentWithCardID(BindCardOrder.BindCardID, MerchantTradeNo, amount, sessionId, sessionId);

        return {
            success
        }
    }

    async GetChargePointStatus(chargePointSessionId){
        var {
            status,
            startedAt,
            stoppedAt,
            energy,
            powerKw,
            amount
        } = await EvoasisApi.GetChargePointSession(chargePointSessionId);
        
        return {
            status,
            startedAt,
            stoppedAt,
            energy,
            powerKw,
            amount
        };
    }
}


// 匯出模組
module.exports = new Evoasis();