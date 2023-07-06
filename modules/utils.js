const injectModel = (req, res, next) => {
    if (req.path.includes('/api/')) {
        req.model = {};
    }
    return next();
};

const processErrorResponse = (error, req, res, next) => {
    let {model, model: {data: response}} = req;
    if (!error && model && response) {
      if (response.data && typeof response.data === 'string') {
        response.data = JSON.parse(response.data);
      }
      res.json(response);
      return;
    }
    if (error) {
        // console.error(error);
        res.status(500).json({
            error: error.message
        });
        return;
    }
    return next();
};

const processResponse = (req, res, next) => {
    let {model, model: {data: response}} = req;
    if (model && response) {
      if (response.data && typeof response.data === 'string') {
        response.data = JSON.parse(response.data);
      }
      res.json(response);
      return;
    }
    return next();
};

module.exports = {
	injectModel,
    processErrorResponse,
    processResponse
};