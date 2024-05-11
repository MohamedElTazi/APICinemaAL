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
exports.EmployeeUsecase = void 0;
const employee_1 = require("../database/entities/employee");
class EmployeeUsecase {
    constructor(db) {
        this.db = db;
    }
    updateEmployee(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { name, working_hours }) {
            const repo = this.db.getRepository(employee_1.Employee);
            const employeeToUpdate = yield repo.findOneBy({ id });
            if (!employeeToUpdate)
                return undefined;
            if (name) {
                employeeToUpdate.name = name;
                employeeToUpdate.working_hours = working_hours;
            }
            const employeeUpdated = yield repo.save(employeeToUpdate);
            return employeeUpdated;
        });
    }
    listEmployee(ListEmployeeFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(ListEmployeeFilter);
            const query = this.db.createQueryBuilder(employee_1.Employee, 'Employee');
            query.skip((ListEmployeeFilter.page - 1) * ListEmployeeFilter.limit);
            query.take(ListEmployeeFilter.limit);
            const [Employe, totalCount] = yield query.getManyAndCount();
            return {
                Employee: Employe,
                totalCount
            };
        });
    }
}
exports.EmployeeUsecase = EmployeeUsecase;
