const {
	Request,
	Response,
	NextFunction
} = require('express')

var checkHeaderSessionId = (
	/** @type {Request<ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>}*/
	req,
	/** @type {Response<any, Record<string, any>, number>} */
	res,
	/** @type {NextFunction} */
	next) => {
    var sessionId = req.header('access-key');

    if(!sessionId){
        res.status(401).send("header access-key request");
        return;
    }
    
    next();
}

module.exports = {
    CheckHeaderSessionId: checkHeaderSessionId
}