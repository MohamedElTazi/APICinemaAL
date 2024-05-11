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
            const validation = listTicketValidation.validate(req.query);

            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }
            
            const listMovieRequest = validation.value;
            let limit = 20;
            if (listMovieRequest.limit) {
                limit = listMovieRequest.limit;
            }
            const page = listMovieRequest.page ?? 1;

            const ticketUsecase = new TicketUsecase(AppDataSource);

            const listTickets = await ticketUsecase.listTickets({ ...listMovieRequest, page, limit });
            
            res.status(200).send(listTickets);

        } catch (error) {
            console.log('Erreur lors de la récupération des tickets:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.get("/tickets/infos" ,async (req: Request, res: Response) => {

        const ticketUsecase = new TicketUsecase(AppDataSource);

        const query = await ticketUsecase.getTicketsInfos();

        if(query === null){
            res.status(404).send(Error("Error fetching planning"))
            return
        }

        try {
            res.status(200).send(query);
        } catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get("/tickets/infos/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = ticketIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const ticketId = validationResult.value;

            const ticketUsecase = new TicketUsecase(AppDataSource);

            let ticket = await ticketUsecase.getTicketInfos(ticketId.id);
            if (ticket === null) {
                res.status(404).send({ "error": `movie ${ticketId.id} not found` });
                return;
            }

            if (ticket.length === 0) {
                const ticketUsecase = new TicketUsecase(AppDataSource);
                ticket = await ticketUsecase.getOneTicket(ticketId.id)
            }
            res.status(200).send(ticket);
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

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
    
            const ticketUsecase = new TicketUsecase(AppDataSource);
            const ticket = await ticketUsecase.getOneTicket(ticketId.id)

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

/** 
 * @openapi
 * 
 * components:
 *  schemas:
 *    Ticket:
 *     type: object
 *     required:
 *      - user_id
 *      - is_used
 *      - is_super
 *      - amount
 *      - nb_tickets
 *     properties:
 *      id:
 *       type: integer
 *       description: The auto-generated id of the ticket
 *      user_id:
 *       type: integer
 *       description: The id of the user who bought the ticket
 *      is_used:
 *       type: boolean
 *       description: The status of the ticket
 *      is_super:
 *       type: boolean
 *       description: The status of the ticket
 *      amount:
 *       type: number
 *       description: The price of the ticket
 *      nb_tickets: 
 *       type: integer
 *       description: The number of tickets bought
 * 
 * tags: 
 *  name: Tickets
 */

/**
 * @openapi
 * /tickets:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get list of tickets
 *     description: Retrieve a list of tickets with optional pagination and filtering.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of tickets per page
 *     responses:
 *       200:
 *         description: List of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
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
 * /tickets/infos:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get ticket information
 *     description: Retrieve information about tickets.
 *     responses:
 *       200:
 *         description: Ticket information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TicketInfo'
 *       404:
 *         description: Tickets not found
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
 * /tickets/infos/{id}:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get ticket information by ID
 *     description: Retrieve information about a ticket by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
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
 *         description: Ticket not found
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
 * /tickets:
 *   post:
 *     tags:
 *       - Tickets
 *     summary: Create a new ticket
 *     description: Create a new ticket.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTicket'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
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
 * /tickets/{id}:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get ticket by ID
 *     description: Retrieve a ticket by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
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
 *         description: Ticket not found
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
 * /tickets/{id}:
 *   patch:
 *     tags:
 *       - Tickets
 *     summary: Update ticket by ID
 *     description: Update a ticket by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTicket'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
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
 *         description: Ticket not found
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
 * /tickets/{id}:
 *   delete:
 *     tags:
 *       - Tickets
 *     summary: Delete ticket by ID
 *     description: Delete a ticket by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Successfully deleted
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
 *         description: Ticket not found
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
