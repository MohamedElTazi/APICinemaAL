import express from "express";
import { initRoutes } from "./handlers/routes/routes";
import { AppDataSource } from "./database/database";
import 'dotenv/config';
import { swaggerDocs } from "./swagger/swagger";
import "reflect-metadata"

const main = async () => {
    const app = express()
    const port = 3000

    try {

        await AppDataSource.initialize()
        console.error("well connected to database")
    } catch (error) {
        console.log(error)
        console.error("Cannot contact database")
        process.exit(1)
    }

    app.use(express.json())
    
    swaggerDocs(app, port)

    initRoutes(app)
    app.listen(port, () => {
        console.log(`Server running on https://apicinemaal.onrender.com/docs/`)
    })
}

main()