import express from 'express';
import { Request, Response } from 'express';
import { listTicketValidation,createTicketValidation,ticketIdValidation,updateTicketValidation } from "../validators/ticket-validator";
import { generateValidationErrorMessage } from '../validators/generate-validation-message';
import { TicketUsecase } from "../../domain/ticket-usecase";
import { AppDataSource } from '../../database/database';
import { Ticket } from "../../database/entities/ticket";
export const ticketHandler = (app: express.Express) => {
    app.get("/tickets", async (req: Request, res: Response) => {
        try {
            // Validation de la requête
            const validation = listTicketValidation.validate(req.query);

            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }

            
            console.log('Requête valide:', req.query);
            
            const listTicketRequest = validation.value;
            let limit = 20;
            if (listTicketRequest.limit) {
                limit = listTicketRequest.limit;
                console.log('Limite:', limit);
            }
            const page = listTicketRequest.page ?? 1;
          
            const ticketUsecase = new TicketUsecase(AppDataSource);
      
       
            const listTickets = await ticketUsecase.listTickets({ ...listTicketRequest, page, limit });
           
            
            res.status(200).send(listTickets);

        } catch (error) {
            
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
        const ticketRepo = AppDataSource.getRepository(Ticket)
        console.log("ok")
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
    
    
            const updatedMovie = await ticketUsecase.updateTicket(
                UpdateticketRequest.id,
                { ...UpdateticketRequest }
                )
    
            if (updatedMovie === null) {
                res.status(404).send({ "error": `ticket ${UpdateticketRequest.id} not found `})
                return
            }
    
    
    
            res.status(200).send(updatedMovie)
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
    
            const TicketDeleted = await MovieRepository.remove(ticket)
            res.status(200).send(TicketDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    


   };
