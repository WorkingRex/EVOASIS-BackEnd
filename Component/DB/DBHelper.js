
const { MongoClient, Db, Collection, Document } = require('mongodb');
const dbClient = new MongoClient(process.env.MONGO_DB_CONNECTTION_STRING);

async function GetNextSequence(name) {
    await dbClient.connect();
    const db = dbClient.db(process.env.MONGO_DB_DEFAULT_DB);
    const collection = db.collection('Counters');

    var ret = await collection.findOneAndUpdate(
        {
            _id: name
        },
        {
            $inc: {
                seq: 1
            }
        });

    return ret.value.seq;
}

//#region Order Init
async function InitialOrderSN(
    /** @type {Db} */
    db) {
    const collection = db.collection('Counters');
    await collection.replaceOne({
        _id: "OrderSN"
    }, {
        _id: "OrderSN",
        seq: 1
    }, { upsert: true })
}
async function InitOrder(
    /** @type {Db} */
    db) {
    const collection = db.collection('Orders');

    await collection.deleteMany({});
}
//#endregion

class DBHelper {

    async Init() {
        await dbClient.connect();
        const db = dbClient.db(process.env.MONGO_DB_DEFAULT_DB);

        await InitialOrderSN(db);
        await InitOrder(db);

        await dbClient.close();
    }

    async CollectionDo(
        /** @type {Promise<(collection: Collection<Document>) => void>} */
        action
    ) {
        await dbClient.connect();
        const db = dbClient.db(process.env.MONGO_DB_DEFAULT_DB);
        const collection = db.collection('Sessions');

        await action(collection);

        await dbClient.close();
    }

    async GetOrderId(){
        var sn = await GetNextSequence("OrderSN");

        var padded = String(sn).padStart(17, "0");
        var id = "EVO" + padded;

        return id;
    }

    async CreatOrder(orderData) {
        await dbClient.connect();
        const db = dbClient.db(process.env.MONGO_DB_DEFAULT_DB);
        const collection = db.collection('Orders');

        var id = await this.GetOrderId()

        var result = await collection.insertOne({
            ...orderData,
            _id: id,
            MerchantTradeNo: id
        });

        await dbClient.close();

        return result.insertedId;
    }

    async GetOrder(sessionId) {
        await dbClient.connect();
        const db = dbClient.db(process.env.MONGO_DB_DEFAULT_DB);
        const collection = db.collection('Orders');

        try {
            var order = await collection.findOne({
                sessionId
            });
        }
        catch (e) {
            return null;
        }
        finally {
            await dbClient.close();
        }

        return order;
    }

    async GetAndUpdateOrderBySessionId(sessionId, orderData = {}) {
        await dbClient.connect();
        const db = dbClient.db(process.env.MONGO_DB_DEFAULT_DB);
        const collection = db.collection('Orders');

        try {
            var order = await collection.findOneAndUpdate({
                sessionId: sessionId
            }, {
                $set: orderData
            }, {
                returnNewDocument: true
            });
        }
        catch (e) {
            return null
        }
        finally {
            await dbClient.close();
        }

        return order?.value;
    }
}

module.exports = new DBHelper();