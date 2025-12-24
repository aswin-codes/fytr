const express = require('express');
const morgan = require('morgan');
const logger = require('./utils/logger');
const router = require('./routes/index');
const cors = require('cors');


const { swaggerUi, specs } = require('./config/swagger');

const app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: logger.stream }));
app.use(express.json());
app.use(cors());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (req, res) => {
    res.send("Hello kWorld!");
});

app.use('/api', router);

module.exports = app;
