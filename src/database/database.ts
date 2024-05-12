import { DataSource } from "typeorm";
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: process.env.TYPE as any,
    host: process.env.HOST,
    port: process.env.PORT as any,
    username: process.env.USERMYSQL,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    logging: true,
    synchronize: false,
    entities:[
        process.env.NODE_ENV === "dev" ? "src/database/entities/*.ts" : "dist/database/entities/*.js"
    ],
    migrations:[
        process.env.NODE_ENV === "dev" ? "src/database/migrations/*.ts" : "dist/database/migrations/*.js"
    ]
})