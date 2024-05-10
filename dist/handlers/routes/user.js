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
exports.UserHandler = void 0;
const database_1 = require("../../database/database");
const bcrypt_1 = require("bcrypt");
const user_validator_1 = require("../validators/user-validator");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const user_1 = require("../../database/entities/user");
const jsonwebtoken_1 = require("jsonwebtoken");
const token_1 = require("../../database/entities/token");
const user_usecase_1 = require("../../domain/user-usecase");
const UserHandler = (app) => {
    app.post('/auth/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.createUserValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createUserRequest = validationResult.value;
            const hashedPassword = yield (0, bcrypt_1.hash)(createUserRequest.password, 10);
            const userRepository = database_1.AppDataSource.getRepository(user_1.User);
            const user = yield userRepository.save({
                firstname: createUserRequest.firstname,
                lastname: createUserRequest.lastname,
                email: createUserRequest.email,
                password: hashedPassword,
                role: req.body.role
            });
            res.status(201).send({ id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email, role: user.role });
            return;
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ "error": "internal error retry later" });
            return;
        }
    }));
    app.post('/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const validationResult = user_validator_1.LoginUserValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const loginUserRequest = validationResult.value;
            // valid user exist
            const user = yield database_1.AppDataSource.getRepository(user_1.User).findOneBy({ email: loginUserRequest.email });
            if (!user) {
                res.status(400).send({ error: "username or password not valid" });
                return;
            }
            // valid password for this user
            const isValid = yield (0, bcrypt_1.compare)(loginUserRequest.password, user.password);
            if (!isValid) {
                res.status(400).send({ error: "username or password not valid" });
                return;
            }
            const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "azerty";
            // generate jwt
            const token = (0, jsonwebtoken_1.sign)({ user_id: user.id, email: user.email }, secret, { expiresIn: '1d' });
            // store un token pour un user
            yield database_1.AppDataSource.getRepository(token_1.Token).save({ token: token, user: user });
            res.status(200).json({ token });
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ "error": "internal error retry later" });
            return;
        }
    }));
    app.delete('/auth/logout/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.userIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const userId = validationResult.value;
            const userRepository = database_1.AppDataSource.getRepository(user_1.User);
            const user = yield userRepository.findOneBy({ id: userId.id });
            if (user === null) {
                res.status(404).send({ "error": `user ${userId.id} not found` });
                return;
            }
            const userUsecase = new user_usecase_1.UserUsecase(database_1.AppDataSource);
            userUsecase.deleteToken(user.id);
            res.status(201).send({ "message": "logout success" });
            return;
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ "error": "internal error retry later" });
            return;
        }
    }));
    app.get("/users/infos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userUsecase = new user_usecase_1.UserUsecase(database_1.AppDataSource);
        const query = yield userUsecase.getUsersInfos();
        if (query === null) {
            res.status(404).send(Error("Error fetching planning"));
            return;
        }
        try {
            res.status(200).send(query);
        }
        catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }));
    app.get("/users/infos/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.userIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const userId = validationResult.value;
            const userUsecase = new user_usecase_1.UserUsecase(database_1.AppDataSource);
            const user = yield userUsecase.getUserInfos(userId.id);
            if (user === null) {
                res.status(404).send({ "error": `movie ${userId.id} not found` });
                return;
            }
            res.status(200).send(user);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.UserHandler = UserHandler;
