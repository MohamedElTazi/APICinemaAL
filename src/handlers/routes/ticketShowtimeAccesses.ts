import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import { TicketShowtimeAccesses } from "../../database/entities/ticketShowtimeAccesses";
import { accessTicketValidation, createAccessTicketShowTimeAccessesValidation, listAccessTicketShowTimeAccessesValidation, ticketAccessIdValidation, updateTicketAccesValidation } from "../validators/ticketShowtimeAccesses-validator";
import { TicketAccesUsecase } from "../../domain/ticketShowtimeAccesses-usecase";
import { authMiddlewareAdmin, authMiddlewareAll } from "../middleware/auth-middleware";


export const TicketShowtimeAccessessHandler = (app: express.Express) => {

    app.get("/ticketShowtimeAccesses", authMiddlewareAdmin ,async (req: Request, res: Response) => {
        try {
            const validation = listAccessTicketShowTimeAccessesValidation.validate(req.query);

            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }

            
            
            const listAcessTicketTicketShowTimeRequest = validation.value;
            let limit = 20;
            if (listAcessTicketTicketShowTimeRequest.limit) {
                limit = listAcessTicketTicketShowTimeRequest.limit;
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


    app.get("/ticketShowtimeAccesses/:id", authMiddlewareAll ,async (req: Request, res: Response) => {
        try {
            const validationResult = ticketAccessIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const ticketAccessId = validationResult.value
    
            const ticketAccesUsecase = new TicketAccesUsecase(AppDataSource);
            const ticketAcces = await ticketAccesUsecase.getOneTicketAcces(ticketAccessId.id )
            if (ticketAcces === null) {
                res.status(404).send({ "error": `ticketAcces ${ticketAccessId.id} not found` })
                return
            }
            res.status(200).send(ticketAcces)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.post("/ticketShowtimeAccesses", authMiddlewareAdmin,async (req: Request, res: Response) => {
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

/**
 * @openapi
 * 
 * components:
 *  schemas:
 *    TicketShowtimeAccesses:
 *      type: object 
 *      properties:
 *        id:
 *          type: integer
 *          description: The id of the ticket showtime access
 *        ticketId:
 *          type: integer
 *          description: The id of the ticket
 *        showtimeId:
 *          type: integer
 *          description: The id of the showtime
 * 
 */

/**
 * @openapi
 * /ticketShowtimeAccesses:
 *   get:
 *     tags:
 *       - Ticket_Showtime_Accesses
 *     summary: List ticket showtime accesses
 *     description: Retrieve a list of ticket showtime accesses.
 *     responses:
 *       200:
 *         description: List of ticket showtime accesses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TicketShowtimeAccess'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /ticketShowtimeAccesses/{id}:
 *   get:
 *     tags:
 *       - Ticket_Showtime_Accesses
 *     summary: Get ticket showtime access by ID
 *     description: Retrieve a ticket showtime access by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket showtime access details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketShowtimeAccess'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Ticket showtime access not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /ticketShowtimeAccesses:
 *   post:
 *     tags:
 *       - Ticket_Showtime_Accesses
 *     summary: Create ticket showtime access
 *     description: Create a new ticket showtime access.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketShowtimeAccesses'
 *     responses:
 *       201:
 *         description: Ticket showtime access created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketShowtimeAccess'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /ticketShowtimeAccesses/{id}:
 *   patch:
 *     tags:
 *       - Ticket_Showtime_Accesses
 *     summary: Update ticket showtime access
 *     description: Update a ticket showtime access by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketShowtimeAccesses'
 *     responses:
 *       200:
 *         description: Updated ticket showtime access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketShowtimeAccess'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Ticket showtime access not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /ticketShowtimeAccesses/{id}:
 *   delete:
 *     tags:
 *       - Ticket_Showtime_Accesses
 *     summary: Delete ticket showtime access by ID
 *     description: Delete a ticket showtime access by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket showtime access deleted successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Ticket showtime access not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
