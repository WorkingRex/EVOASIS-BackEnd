const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const {
	v4: uuidv4
} = require("uuid");

const CookieName = 'access-key';

module.exports = {
	Config: session({
		secret: 'mySecret',
		store: new MongoStore({
			url:'mongodb+srv://ahuser:S%7B%3CnOK@evo.23ebd.mongodb.net/AhCharging?retryWrites=true&w=majority'
		}),
		name: CookieName, // optional
		saveUninitialized: false,
		resave: true,
		cookie: {
			maxAge: process.env.SESSION_COOKIE_MAXAGE_SEC * 1000,
			secure: false
		},
		genid: function (req) {
			return uuidv4();
		},
	}),
	CookieName
}