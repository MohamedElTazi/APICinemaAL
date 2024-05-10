"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "user_cinema",
    password: "azerty",
    database: "CinemaNode",
    logging: true,
    synchronize: false,
    entities: [
        "dist/database/entities/*.js"
    ],
    migrations: [
        "dist/database/migrations/*.js"
    ]
});
