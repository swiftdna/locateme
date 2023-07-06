const express = require('express');
const router = express.Router();
const {injectModel, processErrorResponse, processResponse} = require('./modules/utils');
const {enrichAddresses, cacheAddresses} = require('./modules/Address');

router.post('/enrich', injectModel, enrichAddresses, cacheAddresses, processResponse, processErrorResponse);

router.get('/', (req, res) => {
	res.json({success: true, message: 'Welcome to API page!'});
});

module.exports = router;