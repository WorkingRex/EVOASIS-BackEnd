var Merchant = require('./Merchant');
var CreditDetail = require('./CreditDetail');
var Credit = require('./Credit');
var EInvoice = require('./EInvoice');
var EInvoiceV3 = require('./EInvoiceV3');

module.exports = {
    Merchant: new Merchant(),
    CreditDetail: new CreditDetail(),
    Credit: new Credit(),
    EInvoice: new EInvoice(),
    EInvoiceV3: new EInvoiceV3()
};