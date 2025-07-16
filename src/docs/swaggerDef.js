require("dotenv").config()
const swaggerJSDoc = require('swagger-jsdoc');
const port = process.env.APP_PORT || 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sharelter API',
      version: '1.0.0',
      description: 'API documentation for Sharelter',
    },
    servers: [
      {
        url: `http://localhost:${port}/api/v1`,
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/docs/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
