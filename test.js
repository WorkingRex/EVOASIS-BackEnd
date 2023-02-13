const {
    create,
    AxiosInstance
} = require("axios");
/** @type {AxiosInstance} */
require('dotenv').config();
const {
    EInvoiceV3
} = require('./ExternalApi/EcPay');

var data = {
    TimeStamp: 1489735068,
    MerchantID: "2000132",
    RelateNumber: "1234567890E",
    // CustomerIdentifier: 53538851,
    CustomerName: "%e7%b6%a0%e7%95%8c%e7%a7%91%e6%8a%80%e9%9b%bb%e5%ad%90%e6%94%af%e4%bb%98%e8%82%a1%e4%bb%bd%e6%9c%89%e9%99%90%e5%85%ac%e5%8f%b8",
    CustomerAddr: "%e8%87%ba%e5%8c%97%e5%b8%82%e5%8d%97%e6%b8%af%e5%8d%80%e4%b8%89%e9%87%8d%e8%b7%af19-2%e8%99%9f56%e6%a8%93-2+(D%e6%a3%9f)",
    // CustomerPhone: "0912345678",
    CustomerEmail: "abc%40ecpay.com.tw",
    // ClearanceMark: 2,
    Print: 0,
    Donation: 1,
    LoveCode: 168001,
    // CarruerNum: 12345678,
    TaxType: 1,
    SalesAmount: 100,
    // ItemName: "%E5%90%8D%E7%A8%B11%7C%E5%90%8D%E7%A8%B12%7C%E5%90%8D%E7%A8%B13",
    ItemCount: "1",
    // ItemWord: "%E5%96%AE%E4%BD%8D1%7C%E5%96%AE%E4%BD%8D2%7C%E5%96%AE%E4%BD%8D3",
    ItemPrice: "100",
    // ItemTaxType: "1",
    ItemAmount: "100",
    // ItemRemark: "%e5%82%99%e8%a8%bb1%7c%e5%82%99%e8%a8%bb2%7c%e5%82%99%e8%a8%bb3",
    InvType: "07",
    // vat: 1
}

EInvoiceV3.CheckLoveCode("159")
.then((resp) => {
    console.log(resp);
})
.catch((e) => {
    console.log(e)
})
.finally(() => {
    process.exit();
});

// EInvoice.CreateInvoice({
//     RelateNumber: "123456789E",
//     CustomerName: "綠界科技股份有限公司",
//     CustomerAddr: "臺北市南港區三重路19-2號6樓-2(D棟)",
//     CustomerEmail: "abc%40ecpay.com.tw",
//     Donation: 1,
//     InvType: "07",
//     ItemAmount: 100,
//     ItemCount: 1,
//     ItemPrice: 100,
//     LoveCode: 168001,
//     Print: 0,
//     SalesAmount: 100,
//     TaxType: 1,
//     ItemName: "名稱 1",
//     ItemWord: "單位 1"
// })
// .then((resp) => {
//     console.log(resp);
// })
// .catch((e) => {
//     console.log(e)
// })
// .finally(() => {
//     process.exit();
// });

// SendRequest(`/Invoice/Issue`, {
//     TimeStamp: 1489735068,
//     MerchantID: "2000132",
//     RelateNumber: "1234567890E",
//     // CustomerIdentifier: 53538851,
//     CustomerName: "%e7%b6%a0%e7%95%8c%e7%a7%91%e6%8a%80%e9%9b%bb%e5%ad%90%e6%94%af%e4%bb%98%e8%82%a1%e4%bb%bd%e6%9c%89%e9%99%90%e5%85%ac%e5%8f%b8",
//     CustomerAddr: "%e8%87%ba%e5%8c%97%e5%b8%82%e5%8d%97%e6%b8%af%e5%8d%80%e4%b8%89%e9%87%8d%e8%b7%af19-2%e8%99%9f56%e6%a8%93-2+(D%e6%a3%9f)",
//     // CustomerPhone: "0912345678",
//     CustomerEmail: "abc%40ecpay.com.tw",
//     // ClearanceMark: 2,
//     Print: 0,
//     Donation: 1,
//     LoveCode: 168001,
//     // CarruerNum: 12345678,
//     TaxType: 1,
//     SalesAmount: 100,
//     // ItemName: "%E5%90%8D%E7%A8%B11%7C%E5%90%8D%E7%A8%B12%7C%E5%90%8D%E7%A8%B13",
//     ItemCount: "1",
//     // ItemWord: "%E5%96%AE%E4%BD%8D1%7C%E5%96%AE%E4%BD%8D2%7C%E5%96%AE%E4%BD%8D3",
//     ItemPrice: "100",
//     // ItemTaxType: "1",
//     ItemAmount: "100",
//     // ItemRemark: "%e5%82%99%e8%a8%bb1%7c%e5%82%99%e8%a8%bb2%7c%e5%82%99%e8%a8%bb3",
//     InvType: "07",
//     // vat: 1
// })
// .then((d) => {
//     console.log(d);
// }).catch((e) => {
//     console.log(e)
// }).finally(() => {
//     process.exit();
// }); 