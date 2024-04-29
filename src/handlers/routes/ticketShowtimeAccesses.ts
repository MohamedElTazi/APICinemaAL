import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { TicketShowtimeAccesses } from "../../database/entities/ticketShowtimeAccesses";
import { accessTicketValidation, createAccessTicketShowTimeAccessesValidation, listAccessTicketShowTimeAccessesValidation, ticketAccessIdValidation, updateTicketAccesValidation } from "../validators/ticketShowtimeAccesses-validator";
import { TicketAccesUsecase } from "../../domain/ticketShowtimeAccesses-usecase";


export const ticketShowtimeAccessessHandler = (app: express.Express) => {

    app.get("/ticketShowtimeAccesses", async (req: Request, res: Response) => {
        try {
            // Validation de la requête
            const validation = listAccessTicketShowTimeAccessesValidation.validate(req.query);

            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }

            
            console.log('Requête valide:', req.query);
            
            const listAcessTicketTicketShowTimeRequest = validation.value;
            let limit = 20;
            if (listAcessTicketTicketShowTimeRequest.limit) {
                limit = listAcessTicketTicketShowTimeRequest.limit;
                console.log('Limite:', limit);
            }
            const page = listAcessTicketTicketShowTimeRequest.page ?? 1;
          
            const ticketAccessUsecase = new TicketAccesUsecase(AppDataSource);
      
       
            const listTickets = await ticketAccessUsecase.listTicketsAcces({ ...listAcessTicketTicketShowTimeRequest, page, limit });
           
            
            res.status(200).send(listTickets);

        } catch (error) {
            
            console.log('Erreur lors de la récupération des tickets:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
    });


    app.get("/ticketShowtimeAccesses/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = ticketAccessIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const ticketAccessId = validationResult.value
    
            const ticketRepository = AppDataSource.getRepository(TicketShowtimeAccesses)
            const ticket = await ticketRepository.findOneBy({ id: ticketAccessId.id })
            if (ticket === null) {
                res.status(404).send({ "error": `ticket ${ticketAccessId.id} not found` })
                return
            }
            res.status(200).send(ticket)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.post("/ticketShowtimeAccesses", async (req: Request, res: Response) => {
        try {
            // Validez les données de la requête
            const validation = accessTicketValidation.validate(req.body);
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
    
  
    app.patch("/ticketShowtimeAccesses/:id", async (req: Request, res: Response) => {
    
        const validation = updateTicketAccesValidation.validate({ ...req.params, ...req.body })
    
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
    
        const UpdateticketRequest = validation.value
    
        try {
            const ticketAccesUsecase = new TicketAccesUsecase(AppDataSource);
    
            const validationResult = ticketAccessIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
    
    
            const updateTicketAccess = await ticketAccesUsecase.updateTicketAccess(
                UpdateticketRequest.id,
                { ...UpdateticketRequest }
                )
    
            if (updateTicketAccess === null) {
                res.status(404).send({ "error": `ticketAccess ${UpdateticketRequest.id} not found `})
                return
            }
    
    
    
            res.status(200).send(updateTicketAccess)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    

    
    app.delete("/ticketShowtimeAccesses/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = ticketAccessIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const ticketId = validationResult.value
    
            const MovieRepository = AppDataSource.getRepository(TicketShowtimeAccesses)
            const ticket = await MovieRepository.findOneBy({ id: ticketId.id })
            if (ticket === null) {
                res.status(404).send({ "error": `ticketAccess  ${ticketId.id} not found` })
                return
            }
    
            const TicketDeleted = await MovieRepository.remove(ticket)
            res.status(200).send("ticketAccess deleted")
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    


}