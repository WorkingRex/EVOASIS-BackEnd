const {
    create,
    AxiosInstance
} = require("axios");
/** @type {AxiosInstance} */
const axios = create({
    baseURL: process.env.EVOASIS_API_BASE_HOST,
    headers: {
        Authorization: process.env.EVOASIS_API_AUTHORIZATION_TOKEN
    }
});

class EvoasisApi {
    async GetChargePointsByQR(code) {
        if (!code)
            throw new Error("查無此槍");

        var resp = await axios.get(`/public-api/resources/charge-points/v1.0/?filter[evsePhysicalReference]=${code}`);
        var chargePoint = resp?.data?.data[0];

        if (!chargePoint)
            throw new Error("查無此槍");

        return chargePoint;
    }

    async GetTariffGroup(tgid) {
        var resp = await axios.get(`/public-api/resources/tariff-groups/v1.0/${tgid}`);

        return resp.data.data;
    }

    async GetTariff(tid) {
        var resp = await axios.get(`/public-api/resources/tariffs/v1.0/${tid}`);

        return resp.data.data;
    }

    async GetLocation(locationId) {
        var resp = await axios.get(`/public-api/resources/locations/v1.0/${locationId}`);

        return resp.data.data;
    }

    async StartChargePointCharge(chargePointId, networkId){
        var resp = await axios.post(`/public-api/actions/charge-point/v1.0/${chargePointId}/start/${networkId}`);

        var {
            success,
            sessionId
        } = resp.data;
        return {
            success,
            chargePointSessionId: sessionId
        }
    }

    async GetChargePointSession(sessionId) {
        var resp = await axios.get(`/public-api/resources/sessions/v1.0/${sessionId}`);

        var {
            id,
            userId,
            chargePointId,
            evseId,
            status,
            startedAt,
            stoppedAt,
            energy,
            powerKw,
            amount,
            tax,
            currency,
            paymentType,
            paymentMethodId,
            terminalId,
            paymentStatus,
            authorizationId,
            idTag,
            idTagLabel,
            extendingSessionId,
            reimbursementEligibility,
            tariffSnapshotId,
            electricityCost,
            externalSessionId,
            lastUpdatedAt
        } = resp.data.data;

        return {
            id,
            userId,
            chargePointId,
            evseId,
            status,
            startedAt,
            stoppedAt,
            energy,
            powerKw,
            amount,
            tax,
            currency,
            paymentType,
            paymentMethodId,
            terminalId,
            paymentStatus,
            authorizationId,
            idTag,
            idTagLabel,
            extendingSessionId,
            reimbursementEligibility,
            tariffSnapshotId,
            electricityCost,
            externalSessionId,
            lastUpdatedAt
        };
    }

    async StopChargePointCharge(chargePointId, sessionId) {
        var resp = await axios.post(`/public-api/actions/charge-point/v1.0/${chargePointId}/stop/${sessionId}`);

        var {
            success,
            message
        } = resp.data;

        if(!success)
            throw new Error(message);

        return {
            success,
            message
        };
    }
}

// 匯出模組
module.exports = EvoasisApi;