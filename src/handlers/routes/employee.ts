import express, { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createEmployeeValidation, listEmployeeValidation, employeeIdValidation , updateEmployeeValidation} from "../validators/employee-validator";
import { Employee } from "../../database/entities/employee";
import { EmployeeUsecase } from "../../domain/employee-usecase";
import { authMiddlewareAdmin, authMiddlewareSuperAdmin } from "../middleware/auth-middleware";

export const EmployeeHandler = (app: express.Express) => {

    app.get("/employees/:id", authMiddlewareSuperAdmin ,async (req: Request, res: Response) => {
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

    app.get("/employees", authMiddlewareSuperAdmin ,async (req: Request, res: Response) => {
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


    app.post("/employees", authMiddlewareSuperAdmin ,async (req: Request, res: Response) => {
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

    app.patch("/employees/:id", authMiddlewareSuperAdmin ,async (req: Request, res: Response) => {

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


app.delete("/employees/:id", authMiddlewareSuperAdmin ,async (req: Request, res: Response) => {
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
            res.status(404).send({ "error": `employees ${employeeId.id} not found` })
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

/**
 * @openapi
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       properties:
 *         id:
 *           type: Integer
 *           description: The ID of the employee.
 *         name:
 *           type: string
 *           description: The name of the employee.
 * tags:
 *  name: Employees
 *  description: Endpoints related to employees
 */


/**
 * @openapi
 * /employees:
 *   get:
 *     tags:
 *      [Employees]
 *     summary: Get all employees
 *     description: Retrieve a list of employees.
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
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

 * /employees/{id}:
 *   get:
 *     tags:
 *      [Employees]
 *     summary: Get an employee by ID
 *     description: Retrieve an employee with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee to retrieve
 *     responses:
 *       200:
 *         description: Employee found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
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
 *         description: Employee not found
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
 * /employees:
 *   post:
 *     tags:
 *      [Employees]
 *     summary: Create a new employee
 *     description: Create a new employee.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: Employee successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
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
 * /employees/{id}:
 *   delete:
 *     tags:
 *      [Employees]
 *     summary: Delete an employee by ID
 *     description: Delete an employee with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee to delete
 *     responses:
 *       200:
 *         description: Employee successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
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
 *         description: Employee not found
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
 * /employees/{id}:
 *   patch:
 *     tags:
 *      [Employees]
 *     summary: Update an employee by ID
 *     description: Update an employee with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: Employee successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
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
 *         description: Employee not found
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