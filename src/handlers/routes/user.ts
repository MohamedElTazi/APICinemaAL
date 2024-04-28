import express, { Request, Response } from "express"
import { AppDataSource } from "../../database/database"
import { compare, hash } from "bcrypt";
import { createUserValidation, LoginUserValidation } from "../validators/user-validator"
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { User } from "../../database/entities/user";
import { sign } from "jsonwebtoken";
import { Token } from "../../database/entities/token";

export const UserHandler = (app: express.Express) => {
    app.post('/auth/signup', async (req: Request, res: Response) => {
        try {
            console.log(req.body)
            const validationResult = createUserValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }

            const createUserRequest = validationResult.value;
            const hashedPassword = await hash(createUserRequest.password, 10);

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.save({
                email: createUserRequest.email,
                password: hashedPassword,
                role: req.body.role
            });

            res.status(201).send({ id: user.id, email: user.email, role: user.role });
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
            console.log(secret)
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

}
