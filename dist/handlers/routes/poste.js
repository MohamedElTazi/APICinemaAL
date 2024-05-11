"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosteHandler = void 0;
const database_1 = require("../../database/database");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const poste_validator_1 = require("../validators/poste-validator");
const poste_1 = require("../../database/entities/poste");
const poste_usecase_1 = require("../../domain/poste-usecase");
const auth_middleware_1 = require("../middleware/auth-middleware");
const PosteHandler = (app) => {
    app.get("/postes/:id", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = poste_validator_1.posteIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const posteId = validationResult.value;
            const posteRepository = database_1.AppDataSource.getRepository(poste_1.Poste);
            const poste = yield posteRepository.findOneBy({ id: posteId.id });
            if (poste === null) {
                res.status(404).send({ "error": `poste ${posteId.id} not found` });
                return;
            }
            res.status(200).send(poste);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/postes", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const validation = poste_validator_1.listPosteValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const listPosteRequest = validation.value;
        let limit = 20;
        if (listPosteRequest.limit) {
            limit = listPosteRequest.limit;
        }
        const page = (_a = listPosteRequest.page) !== null && _a !== void 0 ? _a : 1;
        try {
            const posteUsecase = new poste_usecase_1.PosteUsecase(database_1.AppDataSource);
            const listPostes = yield posteUsecase.listPoste(Object.assign(Object.assign({}, listPosteRequest), { page, limit }));
            res.status(200).send(listPostes);
        }
        catch (error) {
            console.log(error);
        }
    }));
    app.post("/postes", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = poste_validator_1.createPosteValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const PosteRequest = validation.value;
        const posteRepository = database_1.AppDataSource.getRepository(poste_1.Poste);
        try {
            const posteCreated = yield posteRepository.save(PosteRequest);
            res.status(201).send(posteCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/postes/:id", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = poste_validator_1.updatePosteValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const UpdatePosteRequest = validation.value;
        try {
            const posteUsecase = new poste_usecase_1.PosteUsecase(database_1.AppDataSource);
            const validationResult = poste_validator_1.posteIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const posteId = validationResult.value;
            const updatedPoste = yield posteUsecase.updatePoste(UpdatePosteRequest.id, Object.assign({}, UpdatePosteRequest));
            if (updatedPoste === null) {
                res.status(404).send({ "error": `Poste ${UpdatePosteRequest.id} not found` });
                return;
            }
            res.status(200).send(updatedPoste);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/postes/:id", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = poste_validator_1.posteIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const posteId = validationResult.value;
            const PosteRepository = database_1.AppDataSource.getRepository(poste_1.Poste);
            const poste = yield PosteRepository.findOneBy({ id: posteId.id });
            if (poste === null) {
                res.status(404).send({ "error": `salle ${posteId.id} not found` });
                return;
            }
            const PosteDeleted = yield PosteRepository.remove(poste);
            res.status(200).send(PosteDeleted);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.PosteHandler = PosteHandler;
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
