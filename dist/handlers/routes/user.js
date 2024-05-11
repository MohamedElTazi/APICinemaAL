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
const UserHandler = (app) => {
    app.post('/auth/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(req.body);
            const validationResult = user_validator_1.createUserValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createUserRequest = validationResult.value;
            const hashedPassword = yield (0, bcrypt_1.hash)(createUserRequest.password, 10);
            const userRepository = database_1.AppDataSource.getRepository(user_1.User);
            const user = yield userRepository.save({
                email: createUserRequest.email,
                password: hashedPassword,
                role: req.body.role
            });
            res.status(201).send({ id: user.id, email: user.email, role: user.role });
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
            console.log(secret);
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
};
exports.UserHandler = UserHandler;
