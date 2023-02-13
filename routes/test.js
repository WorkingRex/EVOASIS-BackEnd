// 引入套件
const express = require('express')
const router = express.Router()
const { dirname } = require('path');
const { SMSApi } = require('../ExternalApi');

/********************************************************************
* GET http://localhost:3000/
********************************************************************/
router.get('/', (req, res) => {
	var path = `${dirname(require.main.path)}/EVOASIS-BackEnd/view/index.html`;
	console.log(path);
	res.sendFile(path);
})

router.post('/sms', async (req, res) => {
	var {
		phone,
		text
	} = req.body;

	await SMSApi.SendSMS(phone, text)

	res.send(`${phone} ${text}`);
})

// 匯出模組
module.exports = router 