import express, { Request, Response } from "express"
import { AppDataSource } from "../../database/database"
import { compare, hash } from "bcrypt";
import { createUserValidation, LoginUserValidation, userIdValidation } from "../validators/user-validator"
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { User } from "../../database/entities/user";
import { sign } from "jsonwebtoken";
import { Token } from "../../database/entities/token";
import { UserUsecase } from "../../domain/user-usecase";

export const UserHandler = (app: express.Express) => {
    app.post('/auth/signup', async (req: Request, res: Response) => {
        try {
            const validationResult = createUserValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }

            const createUserRequest = validationResult.value;
            const hashedPassword = await hash(createUserRequest.password, 10);

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.save({
                firstname: createUserRequest.firstname,
                lastname: createUserRequest.lastname,
                email: createUserRequest.email,
                password: hashedPassword,
                role: req.body.role
            });

            res.status(201).send({ id: user.id, firstname:user.firstname, lastname:user.lastname, email: user.email, role: user.role });
            return
        } catch (error) {
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    app.post('/auth/login', async (req: Request, res: Response) => {
        try {

            const validationResult = LoginUserValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const loginUserRequest = validationResult.value

            // valid user exist
            const user = await AppDataSource.getRepository(User).findOneBy({ email: loginUserRequest.email });

            if (!user) {
                res.status(400).send({ error: "username or password not valid" })
                return
            }

            // valid password for this user
            const isValid = await compare(loginUserRequest.password, user.password);
            if (!isValid) {
                res.status(400).send({ error: "username or password not valid" })
                return
            }
            
            const secret = process.env.JWT_SECRET ?? "azerty"
            // generate jwt
            const token = sign({ user_id: user.id, email: user.email }, secret, { expiresIn: '1d' });
            // store un token pour un user
            await AppDataSource.getRepository(Token).save({ token: token, user: user})
            res.status(200).json({ token });
        } catch (error) {
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    app.delete('/auth/logout/:id', async (req: Request, res: Response) => {
        try {
            const validationResult = userIdValidation.validate(req.params)
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }

            const userId = validationResult.value

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: userId.id })

            if (user === null) {
                res.status(404).send({ "error": `user ${userId.id} not found` })
                return
            }

            const userUsecase = new UserUsecase(AppDataSource);

            userUsecase.deleteToken(user.id)
            
            res.status(201).send({ "message": "logout success" });
            return
        } catch (error) {
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })


    app.get("/users/infos" ,async (req: Request, res: Response) => {

        const userUsecase = new UserUsecase(AppDataSource);

        const query = await userUsecase.getUsersInfos();

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

    app.get("/users/infos/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = userIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const userId = validationResult.value
    
            const userUsecase = new UserUsecase(AppDataSource);

            const user = await userUsecase.getUserInfos(userId.id);
            if (user === null) {
                res.status(404).send({ "error": `movie ${userId.id} not found` })
                return
            }
            res.status(200).send(user)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    

}

/** 
 * 
 * components:
 * schemas:
 *   UserSignup:
 *     type: object
 *     properties:
 *       firstname:
 *         type: string
 *         description: The first name of the user.
 *       lastname:
 *         type: string
 *         description: The last name of the user.
 *       email:
 *         type: string
 *         format: email
 *         description: The email address of the user.
 *       password:
 *         type: string
 *         description: The password of the user.
 *       role:
 *         type: string
 *         description: The role of the user.
 * 
 * schemas:
 *   UserLogin:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *         format: email
 *         description: The email address of the user.
 *       password:
 *         type: string
 *         description: The password of the user.
 *
 *
 * schemas:
 *   User:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         description: The unique identifier of the user.
 *       firstname:
 *         type: string
 *         description: The first name of the user.
 *       lastname:
 *         type: string
 *         description: The last name of the user.
 *       email:
 *         type: string
 *         format: email
 *         description: The email address of the user.
 *       role:
 *         type: string
 *         description: The role of the user.
 *
 *tags:
 * name: Users
 *  description: API for managing users.
 */


 /**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags:
 *      [Authentication]
 *     summary: Create a new user
 *     description: Create a new user with provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSignup'
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 */
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *      [Authentication]
 *     summary: Log in user
 *     description: Authenticate a user and generate JWT token for authorization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for user authentication.
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
 */
/**
 * @openapi
 * /auth/logout/{id}:
 *   delete:
 *     tags:
 *      [Authentication]
 *     summary: Log out user by ID
 *     description: Log out a specific user by deleting their session token.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the user to log out.
 *     responses:
 *       201:
 *         description: User logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
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
 *         description: User not found
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
 * /users/infos:
 *   get:
 *     tags:
 *      [Users]
 *     summary: Get all users information
 *     description: Retrieve information of all users.
 *     responses:
 *       200:
 *         description: List of users information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
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
 * /users/infos/{id}:
 *   get:
 *     tags:
 *      [Users]
 *     summary: Get user information by ID
 *     description: Retrieve information of a specific user by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the user to retrieve information for.
 *     responses:
 *       200:
 *         description: Success retrieving user information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *         description: User not found
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


