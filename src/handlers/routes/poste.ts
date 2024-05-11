import express, { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createPosteValidation, listPosteValidation, posteIdValidation , updatePosteValidation} from "../validators/poste-validator";
import { Poste } from "../../database/entities/poste";
import { PosteUsecase } from "../../domain/poste-usecase";
import { authMiddlewareAdmin } from "../middleware/auth-middleware";

export const PosteHandler = (app: express.Express) => {

    app.get("/postes/:id",  async (req: Request, res: Response) => {
        try {
            const validationResult = posteIdValidation.validate(req.params)
            if(validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const posteId = validationResult.value
            const posteRepository = AppDataSource.getRepository(Poste)
            const poste = await posteRepository.findOneBy({id: posteId.id})
            if(poste === null) {
                res.status(404).send({"error": `poste ${posteId.id} not found`})
                return
            }
            res.status(200).send(poste)
        }
        catch(error) {
            console.log(error)
            res.status(500).send({error: "Internal error"})
        }
    })

    app.get("/postes", async (req: Request, res: Response) => {
        const validation = listPosteValidation.validate(req.query)

        if(validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listPosteRequest = validation.value
        let limit = 20
        if(listPosteRequest.limit) {
            limit = listPosteRequest.limit
        }
        const page = listPosteRequest.page ?? 1

        try {
            const posteUsecase = new PosteUsecase(AppDataSource)
            const listPostes = await posteUsecase.listPoste({...listPosteRequest, page, limit})
            res.status(200).send(listPostes)
        } catch(error) {
            console.log(error)
        }
    })

    app.post("/postes", async (req: Request, res: Response) => {
        const validation = createPosteValidation.validate(req.body)
        if(validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
        const PosteRequest = validation.value
        const posteRepository = AppDataSource.getRepository(Poste)
        try{
            const posteCreated = await posteRepository.save(
                PosteRequest
            )
            res.status(201).send(posteCreated)

        }
        catch(error) {
            console.log(error)
            res.status(500).send({error: "Internal error"})
        }
    })

    app.patch("/postes/:id", async (req: Request, res: Response) => {

            const validation = updatePosteValidation.validate({...req.params, ...req.body})

            if(validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details))
                return
            }

            const UpdatePosteRequest = validation.value



            try {
                const posteUsecase = new PosteUsecase(AppDataSource)

                const validationResult = posteIdValidation.validate(req.params)
            
                if(validationResult.error) {
                    res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                    return
                }
                const posteId = validationResult.value
    
                const updatedPoste = await posteUsecase.updatePoste(
                    UpdatePosteRequest.id,
                    { ...UpdatePosteRequest }
                )
                if(updatedPoste === null) {
                    res.status(404).send({"error": `Poste ${UpdatePosteRequest.id} not found`})
                    return
                }
        
        
        
                res.status(200).send(updatedPoste)
            }
        catch(error) {
            console.log(error)
            res.status(500).send({error: "Internal error"})
        }
    })

    app.delete("/postes/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = posteIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const posteId = validationResult.value
    
            const PosteRepository = AppDataSource.getRepository(Poste)
            const poste = await PosteRepository.findOneBy({ id: posteId.id })
            if (poste === null) {
                res.status(404).send({ "error": `salle ${posteId.id} not found` })
                return
            }
    
            const PosteDeleted = await PosteRepository.remove(poste)
            res.status(200).send(PosteDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

}

/**
 * @openapi
 * components:
 *   schemas:
 *     Poste:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the poste.
 *         name:
 *           type: string
 *           description: The name of the poste.
 *         description:
 *           type: string
 *           description: The description of the poste.
 * tags:
 *  name: Postes
 *  description: Endpoints related to postes
 */
/**
 * @openapi
 * /postes/{id}:
 *   get:
 *     tags:
 *      [Postes]
 *     summary: Get a post by ID
 *     description: Retrieve details of a specific post.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the post to retrieve.
 *     responses:
 *       200:
 *         description: Success retrieving the post.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poste'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Post not found
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
 * 
 */

/**
 * @openapi
 * /postes:
 *   get:
 *     tags:
 *      [Postes]
 *     summary: Get all posts
 *     description: Retrieve a list of posts.
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poste'
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
 * /postes:
 *   post:
 *     tags:
 *      [Postes]
 *     summary: Create a new post
 *     description: Create a new post with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Poste'
 *     responses:
 *       201:
 *         description: Post created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poste'
 *       400:
 *         description: Invalid request data.
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
 * 
 */
/**
 * @openapi
 * /postes/{id}:
 *   patch:
 *     tags:
 *      [Postes]
 *     summary: Update a post by ID
 *     description: Update the details of a specific post.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the post to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Poste'
 *     responses:
 *       200:
 *         description: Success updating the post.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poste'
 *       400:
 *         description: Invalid parameter or request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Post not found
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
 * /postes/{id}:
 *   delete:
 *     tags:
 *      [Postes]
 *     summary: Delete a post by ID
 *     description: Delete a specific post.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the post to delete.
 *     responses:
 *       200:
 *         description: Success deleting the post.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poste'
 *       400:
 *         description: Invalid parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Post not found
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


