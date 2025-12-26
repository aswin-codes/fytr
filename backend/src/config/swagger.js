const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path"); // Import the path module

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FYTR API Documentation",
      version: "1.0.0",
      description: "API documentation for the FYTR backend service",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://backendfytr.vercel.app",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")], // Use path.join for a more robust path
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
