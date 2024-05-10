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
const PosteHandler = (app) => {
    app.get("/postes/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.get("/postes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.post("/postes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.patch("/postes/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
};
exports.PosteHandler = PosteHandler;
