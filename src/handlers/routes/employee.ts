import express, { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createEmployeeValidation, listEmployeeValidation, employeeIdValidation , updateEmployeeValidation} from "../validators/employee-validator";
import { Employee } from "../../database/entities/employee";
import { EmployeeUsecase } from "../../domain/employee-usecase";
import { authMiddlewareAdmin } from "../middleware/auth-middleware";

export const EmployeeHandler = (app: express.Express) => {

    app.get("/employees/:id",  async (req: Request, res: Response) => {
        try {
            const validationResult = employeeIdValidation.validate(req.params)
            if(validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const employeeId = validationResult.value
            const employeeRepository = AppDataSource.getRepository(Employee)
            const employee = await employeeRepository.findOneBy({id: employeeId.id})
            if(employee === null) {
                res.status(404).send({"error": `employee ${employeeId.id} not found`})
                return
            }
            res.status(200).send(employee)
        }
        catch(error) {
            console.log(error)
            res.status(500).send({error: "Internal error"})
        }
    })

    app.get("/employees", async (req: Request, res: Response) => {
        const validation = listEmployeeValidation.validate(req.query)

        if(validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listEmployeeRequest = validation.value
        let limit = 20
        if(listEmployeeRequest.limit) {
            limit = listEmployeeRequest.limit
        }
        const page = listEmployeeRequest.page ?? 1

        try {
            const employeeUsecase = new EmployeeUsecase(AppDataSource)
            const listEmployees = await employeeUsecase.listEmployee({...listEmployeeRequest, page, limit})
            res.status(200).send(listEmployees)
        } catch(error) {
            console.log(error)
        }
    })

    app.post("/employees", async (req: Request, res: Response) => {
        const validation = createEmployeeValidation.validate(req.body)
        if(validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
        const EmployeeRequest = validation.value
        const employeeRepository = AppDataSource.getRepository(Employee)
        try{
            const employeeCreated = await employeeRepository.save(EmployeeRequest)

            res.status(201).send(employeeCreated)

        }
        catch(error) {
            console.log(error)
            res.status(500).send({error: "Internal error"})
        }
    })

    app.patch("/employees/:id", async (req: Request, res: Response) => {

        const validation = updateEmployeeValidation.validate({...req.params, ...req.body})

        if(validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const UpdateEmployeeRequest = validation.value



        try {
            const employeeUsecase = new EmployeeUsecase(AppDataSource)

            const validationResult = employeeIdValidation.validate(req.params)
        
            if(validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const employeId = validationResult.value

            const updatedEmployee = await employeeUsecase.updateEmployee(employeId.id, {...UpdateEmployeeRequest})
            if(updatedEmployee === null) {
                res.status(404).send({"error": `Poste ${UpdateEmployeeRequest.id} not found`})
                return
            }
    
            res.status(200).send(updatedEmployee)
        }
    catch(error) {
        console.log(error)
        res.status(500).send({error: "Internal error"})
    }
})

app.delete("/postes/:id", async (req: Request, res: Response) => {
    try {
        const validationResult = employeeIdValidation.validate(req.params)

        if (validationResult.error) {
            res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
            return
        }
        const employeeId = validationResult.value

        const EmployeeRepository = AppDataSource.getRepository(Employee)
        const employee = await EmployeeRepository.findOneBy({ id: employeeId.id })
        if (employee === null) {
            res.status(404).send({ "error": `salle ${employeeId.id} not found` })
            return
        }

        const EmployeeDeleted = await EmployeeRepository.remove(employee)
        res.status(200).send(EmployeeDeleted)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Internal error" })
    }
})

}