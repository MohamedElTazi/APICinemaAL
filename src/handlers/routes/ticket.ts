import express from 'express';
import { Request, Response } from 'express';
import { listTicketValidation,createTicketValidation } from "../validators/ticket-validator";
import { generateValidationErrorMessage } from '../validators/generate-validation-message';
import { AppDataSource } from '../../database/database';
import { Ticket } from "../../database/entities/ticket";
import { TicketUsecase } from '../../domain/ticket-usecase';
export const TicketHandler = (app: express.Express) => {

    app.get("/tickets", async (req: Request, res: Response) => {
        try {
            // Validation de la requête
            const validation = listTicketValidation.validate(req.query);

            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }

            // Diagnostic : affiche les valeurs des variables
            console.log('Requête valide:', req.query);
            
            const listMovieRequest = validation.value;
            let limit = 20;
            if (listMovieRequest.limit) {
                limit = listMovieRequest.limit;
                console.log('Limite:', limit);
            }
            const page = listMovieRequest.page ?? 1;
            console.log('Page:', page);

            // Création de l'instance de TicketUsecase
            const ticketUsecase = new TicketUsecase(AppDataSource);
            console.log('TicketUsecase créé.');

            // Appel de la méthode listTickets
            const listTickets = await ticketUsecase.listTickets({ ...listMovieRequest, page, limit });
            console.log('ListTickets récupéré:', listTickets);
            
            // Envoi de la réponse
            res.status(200).send(listTickets);

        } catch (error) {
            // Gestion des erreurs
            console.log('Erreur lors de la récupération des tickets:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
    });


    app.post("/tickets", async (req: Request, res: Response) => {
        const validation = createTicketValidation.validate(req.body)
    
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
    
        const ticketRequest = validation.value
        console.log(ticketRequest)


        const ticketRepo = AppDataSource.getRepository(Ticket)
        try {
    
            const ticketCreated = await ticketRepo.save(
                ticketRequest
            )

            
            res.status(201).send(ticketCreated)
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" })
        }
    })
};