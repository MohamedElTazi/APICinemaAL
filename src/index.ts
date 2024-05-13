import express from "express";
import { initRoutes } from "./handlers/routes/routes";
import { AppDataSource } from "./database/database";
import 'dotenv/config';
import { swaggerDocs } from "./swagger/swagger";
import "reflect-metadata"
import { Salle } from "./database/entities/salle";

const main = async () => {
    const app = express()
    const port = 3000

    try {

        await AppDataSource.initialize()
        console.error("well connected to database")
        const salleRepo = AppDataSource.getRepository(Salle)
        const nbSalle = await salleRepo.count()
        if(nbSalle<10){
            console.error("You need to add at least 10 salles to the database")
            process.exit(1)
        }
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