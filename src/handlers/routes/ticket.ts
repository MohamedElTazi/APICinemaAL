import express from 'express';
import { Request, Response } from 'express';
import { listTicketValidation,createTicketValidation, ticketIdValidation, updateTicketValidation } from "../validators/ticket-validator";
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


    app.get("/tickets/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = ticketIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const ticketId = validationResult.value
    
            const ticketRepository = AppDataSource.getRepository(Ticket)
            const ticket = await ticketRepository.findOneBy({ id: ticketId.id })
            if (ticket === null) {
                res.status(404).send({ "error": `ticket ${ticketId.id} not found` })
                return
            }
            res.status(200).send(ticket)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    
    app.patch("/tickets/:id", async (req: Request, res: Response) => {
    
        const validation = updateTicketValidation.validate({ ...req.params, ...req.body })
    
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
    
        const UpdateticketRequest = validation.value
    
        try {
            const ticketUsecase = new TicketUsecase(AppDataSource);
    
            const validationResult = ticketIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
    
    
            const updatedTicket = await ticketUsecase.updateTicket(UpdateticketRequest.id,{ ...UpdateticketRequest})
    
            if (updatedTicket === null) {
                res.status(404).send({ "error": `ticket ${UpdateticketRequest.id} not found `})
                return
            }

            
            if(updatedTicket === "No data to update"){
                res.status(400).send({ "error": `No data to update`})
                return
            }
    
    
            res.status(200).send(updatedTicket)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    

    
    app.delete("/tickets/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = ticketIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const ticketId = validationResult.value
    
            const MovieRepository = AppDataSource.getRepository(Ticket)
            const ticket = await MovieRepository.findOneBy({ id: ticketId.id })
            if (ticket === null) {
                res.status(404).send({ "error": `ticket  ${ticketId.id} not found` })
                return
            }
    
            await MovieRepository.remove(ticket)
            res.status(200).send("Successfully deleted")
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

};