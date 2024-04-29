import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { AppDataSource } from "../../database/database";
import {authMiddlewareAdmin, authMiddlewareAll, authMiddlewareUser } from "../middleware/auth-middleware";
import { buyTicketValidation, createTransactionValidation, listTransactionValidation, transactionIdValidation, updateMoneyValidation, updateTransactionValidation, useSuperTicketValidation } from "../validators/transaction-validator";
import { Transaction } from "../../database/entities/transaction";
import { TransactionUsecase } from "../../domain/transaction-usecase";
import { userIdValidation } from "../validators/user-validator";
import { User } from "../../database/entities/user";

export const TransactionHandler = (app: express.Express) => {

    app.post("/transactions", authMiddlewareAll ,async (req: Request, res: Response) => {
        const validation = createTransactionValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const transactionRequest = validation.value
        const transactionRepo = AppDataSource.getRepository(Transaction)
        try {

            const transactionCreated = await transactionRepo.save(
                transactionRequest
            )
            res.status(201).send(transactionCreated)
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.get("/transactions",async (req: Request, res: Response) => {
        const validation = listTransactionValidation.validate(req.query)


        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listTransactionRequest = validation.value

        let limit = 20
        if (listTransactionRequest.limit) {
            limit = listTransactionRequest.limit
        }
        const page = listTransactionRequest.page ?? 1

        console.log(validation.value)

        try {

            const transactionUsecase = new TransactionUsecase(AppDataSource);
            const listTransaction = await transactionUsecase.listTransaction({ ...listTransactionRequest, page, limit })
            res.status(200).send(listTransaction)
            
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.get("/transactions/:id",async (req: Request, res: Response) => {
        try {
            const validationResult = transactionIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const transactionId = validationResult.value

            const transactionRepository = AppDataSource.getRepository(Transaction)
            const transaction = await transactionRepository.findOneBy({ id: transactionId.id })
            if (transaction === null) {
                res.status(404).send({ "error": `transaction ${transactionId.id} not found` })
                return
            }
            res.status(200).send(transaction)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.get("/transactions/clients/:id",async (req: Request, res: Response) => {
        try {
            const validationResult = userIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const userId = validationResult.value

            const transactionRepository = AppDataSource.getRepository(User)
            const user = await transactionRepository.findOneBy({ id: userId.id })
            if (user === null) {
                res.status(404).send({ "error": `transaction ${userId.id} not found` })
                return
            }

            const transactionUsecase = new TransactionUsecase(AppDataSource);

            const transaction = await transactionUsecase.listTransaction({ user: userId.id, page: 1, limit: 20 })

            res.status(200).send(transaction)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })



    app.patch("/transactions/:id" ,async (req: Request, res: Response) => {

        const validation = updateTransactionValidation.validate({ ...req.params, ...req.body })

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateTransactionRequest = validation.value

        try {
            const transactionUsecase = new TransactionUsecase(AppDataSource);

            if (updateTransactionRequest.amount === undefined || updateTransactionRequest.amount < 0) {
                res.status(404).send("error: Capacity not good")
                return
            }

            const updatedTransaction = await transactionUsecase.updateTransaction(updateTransactionRequest.id, { ...updateTransactionRequest })
            
            if (updatedTransaction === null) {
                res.status(404).send({ "error": `Transaction ${updateTransactionRequest.id} not found` })
                return
            }

            res.status(200).send(updatedTransaction)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.post("/transactions/buyTicket/:id" ,async (req: Request, res: Response) => {
        const validation = buyTicketValidation.validate({...req.params, ...req.body})

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }



        if(validation.value.idShowtime !== undefined && validation.value.is_super ===true){
            res.status(400).send("error: cannot assigned showtime to super ticket")
            return
        }

        if(validation.value.idShowtime === undefined){
            if(validation.value.is_super === false){
                res.status(400).send("error: idShowtime is required")
                return
            }
            validation.value.idShowtime = 0
        }



        const buyTicketRequest = validation.value

        try {
            const moneyUsecase = new TransactionUsecase(AppDataSource);

            const response = await moneyUsecase.buyTicket(buyTicketRequest.id, validation.value.is_super, validation.value.idShowtime)
        
            if(response === "user not found"){
                
                res.status(404).send({ "error": `User ${buyTicketRequest.id} not found` })
                return
            }
            else if(response === "showtime not found"){
                res.status(404).send({ "error": `Showtime ${validation.value.id} not found` })
                return
            }
            else if(response === "insufficient funds"){
                res.status(404).send({ "error": 'insufficient funds' })
                return
            }else if (response === "creation of ticket failed") {
                res.status(404).send("Creation of ticket failed")
                return
            }else if(response === "showtime is outdated"){
                res.status(404).send("Showtime is outdated")
                return
            }

            res.status(200).send("Purchase successfully completed")
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.patch("/transactions/rechargeBalance/:id",authMiddlewareUser ,async (req: Request, res: Response) => {
    
        const validation = updateMoneyValidation.validate({ ...req.params, ...req.body })

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }


        const updateMoneyRequest = validation.value

        try {
            const moneyUsecase = new TransactionUsecase(AppDataSource);

            if (updateMoneyRequest.amount === undefined || updateMoneyRequest.amount < 0) {
                res.status(404).send("error: Amount not good")
                return
            }

            const updatedMoney = await moneyUsecase.transaction("add",updateMoneyRequest.id, updateMoneyRequest.amount, false,0)
            
            if (updatedMoney === null) {
                res.status(404).send({ "error": `User ${updateMoneyRequest.id} not found` })
                return
            }

            res.status(200).send("New balance : " + updatedMoney.balance)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.patch("/transactions/withdrawBalance/:id" ,async (req: Request, res: Response) => {
    
        
        const validation = updateMoneyValidation.validate({ ...req.params, ...req.body })

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateMoneyRequest = validation.value

        try {
            const moneyUsecase = new TransactionUsecase(AppDataSource);

            if (updateMoneyRequest.amount === undefined || updateMoneyRequest.amount < 0) {
                res.status(404).send("error: Amount not good")
                return
            }

            const updatedMoney = await moneyUsecase.transaction("withdraw",updateMoneyRequest.id, updateMoneyRequest.amount, false,0)
            
            if (updatedMoney === null) {
                res.status(404).send({ "error": `User ${updateMoneyRequest.id} not found` })
                return
            }

            res.status(200).send("New balance : " + updatedMoney.balance)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.delete("/transactions/:id",authMiddlewareAdmin ,async (req: Request, res: Response) => {
        try {
            const validationResult = transactionIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const transactionId = validationResult.value
    
            const transactionRepository = AppDataSource.getRepository(Transaction)
            const transaction = await transactionRepository.findOneBy({ id: transactionId.id })
            if (transaction === null) {
                res.status(404).send({ "error": `transaction ${transactionId.id} not found` })
                return
            }
    
            await transactionRepository.remove(transaction)
            res.status(200).send(`Successfully deleted`)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })




    app.post("/transactions/useSuperTicket/:id" ,async (req: Request, res: Response) => {
            const validation = useSuperTicketValidation.validate({...req.params, ...req.body})

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const useSuperTicketRequest = validation.value

        try {
            const moneyUsecase = new TransactionUsecase(AppDataSource);

            const response = await moneyUsecase.useSuperTicket(useSuperTicketRequest.id, validation.value.idTicket, validation.value.idShowtime)
        
            if(response === "user not found"){
                
                res.status(400).send({ "error": `User ${useSuperTicketRequest.id} not found` })
                return
            }
            else if(response === "ticket not found"){
                res.status(400).send({ "error": `Ticket ${validation.value.idTicket} not found` })
                return
            }
            else if(response === "showtime not found"){
                res.status(400).send({ "error": `Showtime ${validation.value.idShowtime} not found` })
                return
            }else if (response === "ticket is already used") {
                res.status(404).send("Ticket is already used")
                return
            }else if(response === "ticket as problem"){
                res.status(404).send("Ticket as problem")
                return
            }else if(response === "ticket is not super"){
                res.status(404).send("Ticket is not super")
                return
            }else if(response === "showtime is outdated"){
                res.status(404).send("Showtime is outdated")
                return
            }


            res.status(200).send("Ticket usage completed successfully")
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


}