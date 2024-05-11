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
exports.EmployeeHandler = void 0;
const database_1 = require("../../database/database");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const employee_validator_1 = require("../validators/employee-validator");
const employee_1 = require("../../database/entities/employee");
const employee_usecase_1 = require("../../domain/employee-usecase");
const auth_middleware_1 = require("../middleware/auth-middleware");
const EmployeeHandler = (app) => {
    app.get("/employees/:id", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = employee_validator_1.employeeIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const employeeId = validationResult.value;
            const employeeRepository = database_1.AppDataSource.getRepository(employee_1.Employee);
            const employee = yield employeeRepository.findOneBy({ id: employeeId.id });
            if (employee === null) {
                res.status(404).send({ "error": `employee ${employeeId.id} not found` });
                return;
            }
            res.status(200).send(employee);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/employees", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const validation = employee_validator_1.listEmployeeValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const listEmployeeRequest = validation.value;
        let limit = 20;
        if (listEmployeeRequest.limit) {
            limit = listEmployeeRequest.limit;
        }
        const page = (_a = listEmployeeRequest.page) !== null && _a !== void 0 ? _a : 1;
        try {
            const employeeUsecase = new employee_usecase_1.EmployeeUsecase(database_1.AppDataSource);
            const listEmployees = yield employeeUsecase.listEmployee(Object.assign(Object.assign({}, listEmployeeRequest), { page, limit }));
            res.status(200).send(listEmployees);
        }
        catch (error) {
            console.log(error);
        }
    }));
    app.post("/employees", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = employee_validator_1.createEmployeeValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const EmployeeRequest = validation.value;
        const employeeRepository = database_1.AppDataSource.getRepository(employee_1.Employee);
        try {
            const employeeCreated = yield employeeRepository.save(EmployeeRequest);
            res.status(201).send(employeeCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/employees/:id", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = employee_validator_1.updateEmployeeValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const UpdateEmployeeRequest = validation.value;
        try {
            const employeeUsecase = new employee_usecase_1.EmployeeUsecase(database_1.AppDataSource);
            const validationResult = employee_validator_1.employeeIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const employeId = validationResult.value;
            const updatedEmployee = yield employeeUsecase.updateEmployee(employeId.id, Object.assign({}, UpdateEmployeeRequest));
            if (updatedEmployee === null) {
                res.status(404).send({ "error": `Poste ${UpdateEmployeeRequest.id} not found` });
                return;
            }
            res.status(200).send(updatedEmployee);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/employees/:id", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = employee_validator_1.employeeIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const employeeId = validationResult.value;
            const EmployeeRepository = database_1.AppDataSource.getRepository(employee_1.Employee);
            const employee = yield EmployeeRepository.findOneBy({ id: employeeId.id });
            if (employee === null) {
                res.status(404).send({ "error": `employees ${employeeId.id} not found` });
                return;
            }
            const EmployeeDeleted = yield EmployeeRepository.remove(employee);
            res.status(200).send(EmployeeDeleted);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.EmployeeHandler = EmployeeHandler;
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
