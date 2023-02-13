const {
	Request,
	Response,
	NextFunction
} = require('express')

module.exports = function (
	/** @type {Request<ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>}*/
	req,
	/** @type {Response<any, Record<string, any>, number>} */
	res,
	/** @type {NextFunction} */
	next) {
	var sessionId = req.header('access-key');

	if (sessionId && sessionId != null) {
		//try to load a sessionId
		req.sessionStore.get(sessionId, function (err, sess) {
			if (!err) {
				req.sessionID = sessionId;
				req.sessionStore.createSession(req, sess);
				next();
			}
			else {
				req.session.regenerate(function (err) {
					next();
				});
			}
		});

	}
	else {
		// req.session.regenerate(function (err) {
		// 	next();
		// });
		next();
	}
}