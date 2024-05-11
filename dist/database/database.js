"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "51.159.11.135",
    port: 23092,
    username: "user_cinema",
    password: "CinemaNode*94",
    database: "CinemaNode",
    logging: true,
    synchronize: false,
    entities: [
        process.env.NODE_ENV === "dev" ? "src/database/entities/*.ts" : "dist/database/entities/*.js"
    ],
    migrations: [
        process.env.NODE_ENV === "dev" ? "src/database/migrations/*.ts" : "dist/database/migrations/*.js"
    ]
});
