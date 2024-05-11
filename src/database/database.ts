import { DataSource } from "typeorm";


export const AppDataSource = new DataSource({
    type: "mysql",
    host: "51.159.11.135",
    port: 23092,
    username: "user_cinema",
    password: "CinemaNode*94",
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