import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { TicketShowtimeAccesses } from "../../database/entities/ticketShowtimeAccesses";
import { createAccessTicketShowTimeAccessesValidation } from "../validators/ticketShowtimeAccesses-validator";


export const ticketShowtimeAccessessHandler = (app: express.Express) => {

    app.post("/ticket_showtime_accessess", async (req: Request, res: Response) => {
        try {
            // Validez les données de la requête
            const validation = createAccessTicketShowTimeAccessesValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }

            // Récupérez les données validées
            const ticketShowtimeAccessRequest = validation.value;
            const ticketShowtimeAccessRepo = AppDataSource.getRepository(TicketShowtimeAccesses);

            // Créez une nouvelle instance de TicketShowtimeAccesses à partir des données de la requête
            const newTicketShowtimeAccess = ticketShowtimeAccessRepo.create(ticketShowtimeAccessRequest);

            // Sauvegardez l'instance dans la base de données
            const savedTicketShowtimeAccess = await ticketShowtimeAccessRepo.save(newTicketShowtimeAccess);

            // Envoyez la réponse avec le nouvel accès de ticket pour une séance créé
            res.status(201).send(savedTicketShowtimeAccess);
        } catch (error) {
            // Gérer les erreurs
            console.error("Error creating ticket showtime access:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    });
}