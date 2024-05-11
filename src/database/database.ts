
import { DataSource } from "typeorm";


export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "CinemaNode",
    logging: true,
    synchronize: false,
    entities:[
        "src/database/entities/*.ts"
    ],
    migrations:[
        process.env.NODE_ENV === "dev" ? "src/database/migrations/*.ts" : "dist/database/migrations/*.js"
    ]

    
})