"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
require("dotenv/config");
exports.AppDataSource = new typeorm_1.DataSource({
    type: process.env.TYPE,
    host: process.env.HOST,
    port: process.env.PORT,
    username: process.env.USERMYSQL,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    logging: true,
    synchronize: false,
    entities: [
        process.env.NODE_ENV === "dev" ? "src/database/entities/*.ts" : "dist/database/entities/*.js"
    ],
    migrations: [
        process.env.NODE_ENV === "dev" ? "src/database/migrations/*.ts" : "dist/database/migrations/*.js"
    ]
});
