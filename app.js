// Run: nodemon app.js / node app.js

// 引入套件
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
var cors = require('cors');

// 使用 express 與設定 port 為 3000
var expressWs = require('express-ws')(express());
var app = expressWs.app;
// const app = express()
const port = process.env.PORT || 3000

app.use(cors({
	origin: [
		'https://charge.evoasis.com.tw',
		'https://api.charge.evoasis.com.tw',
		'http://localhost:3000',
	],
	methods: 'GET,POST',
	// allowedHeaders: ['Content-Type', 'Set-Cookie', 'Access-Control-Allow-Origin'],
}))

app.use(express.static(__dirname));

const {
	Config: SessionConfig
} = require('./Initialization/Session')
app.use(SessionConfig);

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(require('./Middleware/SessionMiddleware'));

// home 路由
app.use('/test', require('./routes/test'))
app.use('/ChargePoint', require('./routes/ChargePointRouter'))
app.use('/EcPay', require('./routes/EcPayRouter'));
app.use('/Order', require('./routes/OrderRouter'));

app.use((err, req, res, next) => {
	err.statusCode = err.statusCode || 500  // if no statusCode is defined, then use HTTP500
	err.status = err.status || 'error'

	// return error status and message to the requester
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
	});
});

// 啟動伺服器
app.listen(port, () => {
	console.log(`app listening on port ${port}!`)
})

module.exports = app