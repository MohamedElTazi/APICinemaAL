import { DataSource } from "typeorm";


export const AppDataSource = new DataSource({
    type: "mysql",
    host: "127.0.0.1",
    port: 3306,
    username: "user_cinema",
    password: "azerty",
    database: "CinemaNode",
    logging: true,
    synchronize: false,
    entities:[
        process.env.NODE_ENV === "dev" ? "src/database/entities/*.ts" : "dist/database/entities/*.js"
    ],
    migrations:[
        process.env.NODE_ENV === "dev" ? "src/database/migrations/*.ts" : "dist/database/migrations/*.js"
    ]
})