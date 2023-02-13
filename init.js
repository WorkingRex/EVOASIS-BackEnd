
require('dotenv').config();
const DBHelper = require('./Component/DB/DBHelper');

DBHelper.Init()
.finally(() => {
    process.exit();
});

