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
exports.TransactionHandler = void 0;
const generate_validation_message_1 = require("../validators/generate-validation-message");
const database_1 = require("../../database/database");
const auth_middleware_1 = require("../middleware/auth-middleware");
const transaction_validator_1 = require("../validators/transaction-validator");
const transaction_1 = require("../../database/entities/transaction");
const transaction_usecase_1 = require("../../domain/transaction-usecase");
const user_validator_1 = require("../validators/user-validator");
const user_1 = require("../../database/entities/user");
const TransactionHandler = (app) => {
    app.post("/transactions", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = transaction_validator_1.createTransactionValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const transactionRequest = validation.value;
        const transactionRepo = database_1.AppDataSource.getRepository(transaction_1.Transaction);
        try {
            const transactionCreated = yield transactionRepo.save(transactionRequest);
            res.status(201).send(transactionCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/transactions", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const validation = transaction_validator_1.listTransactionValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const listTransactionRequest = validation.value;
        let limit = 20;
        if (listTransactionRequest.limit) {
            limit = listTransactionRequest.limit;
        }
        const page = (_a = listTransactionRequest.page) !== null && _a !== void 0 ? _a : 1;
        console.log(validation.value);
        try {
            const transactionUsecase = new transaction_usecase_1.TransactionUsecase(database_1.AppDataSource);
            const listTransaction = yield transactionUsecase.listTransaction(Object.assign(Object.assign({}, listTransactionRequest), { page, limit }));
            res.status(200).send(listTransaction);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/transactions/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = transaction_validator_1.transactionIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const transactionId = validationResult.value;
            const transactionUsecase = new transaction_usecase_1.TransactionUsecase(database_1.AppDataSource);
            const transaction = yield transactionUsecase.getOneTransaction(transactionId.id);
            if (transaction === null) {
                res.status(404).send({ "error": `transaction ${transactionId.id} not found` });
                return;
            }
            res.status(200).send(transaction);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/transactions/clients/:id", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.userIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const userId = validationResult.value;
            const transactionRepository = database_1.AppDataSource.getRepository(user_1.User);
            const user = yield transactionRepository.findOneBy({ id: userId.id });
            if (user === null) {
                res.status(404).send({ "error": `transaction ${userId.id} not found` });
                return;
            }
            const transactionUsecase = new transaction_usecase_1.TransactionUsecase(database_1.AppDataSource);
            const transaction = yield transactionUsecase.listTransaction({ user: userId.id, page: 1, limit: 20 });
            res.status(200).send(transaction);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/transactions/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = transaction_validator_1.updateTransactionValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const updateTransactionRequest = validation.value;
        try {
            const transactionUsecase = new transaction_usecase_1.TransactionUsecase(database_1.AppDataSource);
            if (updateTransactionRequest.amount === undefined || updateTransactionRequest.amount < 0) {
                res.status(404).send("error: Capacity not good");
                return;
            }
            const updatedTransaction = yield transactionUsecase.updateTransaction(updateTransactionRequest.id, Object.assign({}, updateTransactionRequest));
            if (updatedTransaction === null) {
                res.status(404).send({ "error": `Transaction ${updateTransactionRequest.id} not found` });
                return;
            }
            res.status(200).send(updatedTransaction);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post("/transactions/buyTicket/:id", auth_middleware_1.authMiddlewareUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = transaction_validator_1.buyTicketValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const userId = validation.value.id;
        const UserRepository = database_1.AppDataSource.getRepository(user_1.User);
        const user = yield UserRepository.findOneBy({ id: userId });
        if (user === null) {
            res.status(404).send({ "error": `user ${userId} not found` });
            return;
        }
        else if (user.role !== "user") {
            res.status(400).send("error: user only can buy ticket");
            return;
        }
        if (validation.value.idShowtime !== undefined && validation.value.is_super === true) {
            res.status(400).send("error: cannot assigned showtime to super ticket");
            return;
        }
        if (validation.value.idShowtime === undefined) {
            if (validation.value.is_super === false) {
                res.status(400).send("error: idShowtime is required");
                return;
            }
            validation.value.idShowtime = 0;
        }
        const buyTicketRequest = validation.value;
        try {
            const moneyUsecase = new transaction_usecase_1.TransactionUsecase(database_1.AppDataSource);
            const response = yield moneyUsecase.buyTicket(buyTicketRequest.id, validation.value.is_super, validation.value.idShowtime);
            if (response === "user not found") {
                res.status(404).send({ "error": `User ${buyTicketRequest.id} not found` });
                return;
            }
            else if (response === "showtime not found") {
                res.status(404).send({ "error": `Showtime ${validation.value.id} not found` });
                return;
            }
            else if (response === "insufficient funds") {
                res.status(404).send({ "error": 'insufficient funds' });
                return;
            }
            else if (response === "creation of ticket failed") {
                res.status(404).send("Creation of ticket failed");
                return;
            }
            else if (response === "showtime is outdated") {
                res.status(404).send("Showtime is outdated");
                return;
            }
            res.status(200).send("Purchase successfully completed");
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/transactions/rechargeBalance/:id", auth_middleware_1.authMiddlewareUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = transaction_validator_1.updateMoneyValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const updateMoneyRequest = validation.value;
        try {
            const moneyUsecase = new transaction_usecase_1.TransactionUsecase(database_1.AppDataSource);
            if (updateMoneyRequest.amount === undefined || updateMoneyRequest.amount < 0) {
                res.status(404).send("error: Amount not good");
                return;
            }
            const updatedMoney = yield moneyUsecase.transaction("add", updateMoneyRequest.id, updateMoneyRequest.amount, false, 0);
            if (updatedMoney === null) {
                res.status(404).send({ "error": `User ${updateMoneyRequest.id} not found` });
                return;
            }
            res.status(200).send("New balance : " + updatedMoney.balance);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/transactions/withdrawBalance/:id", auth_middleware_1.authMiddlewareUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = transaction_validator_1.updateMoneyValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const updateMoneyRequest = validation.value;
        try {
            const moneyUsecase = new transaction_usecase_1.TransactionUsecase(database_1.AppDataSource);
            if (updateMoneyRequest.amount === undefined || updateMoneyRequest.amount < 0) {
                res.status(404).send("error: Amount not good");
                return;
            }
            const updatedMoney = yield moneyUsecase.transaction("withdraw", updateMoneyRequest.id, updateMoneyRequest.amount, false, 0);
            if (updatedMoney === null) {
                res.status(404).send({ "error": `User ${updateMoneyRequest.id} not found` });
                return;
            }
            res.status(200).send("New balance : " + updatedMoney.balance);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/transactions/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = transaction_validator_1.transactionIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const transactionId = validationResult.value;
            const transactionRepository = database_1.AppDataSource.getRepository(transaction_1.Transaction);
            const transaction = yield transactionRepository.findOneBy({ id: transactionId.id });
            if (transaction === null) {
                res.status(404).send({ "error": `transaction ${transactionId.id} not found` });
                return;
            }
            yield transactionRepository.remove(transaction);
            res.status(200).send(`Successfully deleted`);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post("/transactions/useSuperTicket/:id", auth_middleware_1.authMiddlewareUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = transaction_validator_1.useSuperTicketValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const useSuperTicketRequest = validation.value;
        try {
            const moneyUsecase = new transaction_usecase_1.TransactionUsecase(database_1.AppDataSource);
            const response = yield moneyUsecase.useSuperTicket(useSuperTicketRequest.id, validation.value.idTicket, validation.value.idShowtime);
            if (response === "user not found") {
                res.status(400).send({ "error": `User ${useSuperTicketRequest.id} not found` });
                return;
            }
            else if (response === "ticket not found") {
                res.status(400).send({ "error": `Ticket ${validation.value.idTicket} not found` });
                return;
            }
            else if (response === "showtime not found") {
                res.status(400).send({ "error": `Showtime ${validation.value.idShowtime} not found` });
                return;
            }
            else if (response === "ticket is already used") {
                res.status(404).send("Ticket is already used");
                return;
            }
            else if (response === "ticket as problem") {
                res.status(404).send("Ticket as problem");
                return;
            }
            else if (response === "ticket is not super") {
                res.status(404).send("Ticket is not super");
                return;
            }
            else if (response === "showtime is outdated") {
                res.status(404).send("Showtime is outdated");
                return;
            }
            res.status(200).send("Ticket usage completed successfully");
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.TransactionHandler = TransactionHandler;
/**
 * @openapi
 *
 * components:
 *  schemas:
 *    Transaction:
 *     type: object
 *     properties:
 *      id:
 *       type: integer
 *       description: The auto-generated id of the transaction
 *      user:
 *       type: integer
 *       description: The id of the user
 *      ticket:
 *       type: integer
 *       description: The id of the ticket
 *      transaction_type:
 *       type: string
 *       description: The type of the transaction
 *      amount:
 *       type: integer
 *       description: The amount of the transaction
 *      transaction_date:
 *       type: date
 *       description: The date of the transaction
 *
 * tags:
 *  name: Transactions
 *
 *
*/
/**
 * @openapi
 * /transactions:
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Create a new transaction
 *     description: Create a new transaction.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTransaction'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
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
 * /transactions:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get list of transactions
 *     description: Retrieve a list of transactions with optional pagination and filtering.
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
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
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
 * /transactions/{id}:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get transaction by ID
 *     description: Retrieve a transaction by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
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
 *         description: Transaction not found
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
 * /transactions/clients/{id}:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get transactions by client ID
 *     description: Retrieve transactions by client ID with optional pagination.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Client ID
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
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
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
 *         description: Transactions not found
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
 * /transactions/{id}:
 *   patch:
 *     tags:
 *       - Transactions
 *     summary: Update transaction by ID
 *     description: Update a transaction by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransaction'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
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
 *         description: Transaction not found
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
 * /transactions/buyTicket/{id}:
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Buy ticket
 *     description: Buy a ticket for a specific user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BuyTicket'
 *     responses:
 *       200:
 *         description: Purchase successful
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
 *         description: User not found or Showtime not found
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
 * /transactions/rechargeBalance/{id}:
 *   patch:
 *     tags:
 *       - Transactions
 *     summary: Recharge balance
 *     description: Recharge the balance of a user account.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMoney'
 *     responses:
 *       200:
 *         description: New balance
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
 * /transactions/withdrawBalance/{id}:
 *   patch:
 *     tags:
 *       - Transactions
 *     summary: Withdraw balance
 *     description: Withdraw balance from a user account.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMoney'
 *     responses:
 *       200:
 *         description: New balance
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
 * /transactions/{id}:
 *   delete:
 *     tags:
 *       - Transactions
 *     summary: Delete transaction by ID
 *     description: Delete a transaction by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
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
 *         description: Transaction not found
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
 * /transactions/useSuperTicket/{id}:
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Use super ticket
 *     description: Use a super ticket for a specific user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UseSuperTicket'
 *     responses:
 *       200:
 *         description: Ticket usage completed successfully
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
 *         description: User not found, Ticket not found, Showtime not found, Ticket is already used, Ticket has a problem, Ticket is not super, or Showtime is outdated
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
