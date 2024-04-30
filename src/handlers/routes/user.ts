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
