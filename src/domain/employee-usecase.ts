import { DataSource, Repository } from "typeorm";
import { Employee } from "../database/entities/employee";
import { Poste } from "../database/entities/poste";

export interface ListEmployeeFilter {
    page: number
    limit: number
}
export interface ListEmployeeRequest {
    page?: number
    limit?: number
}
export interface UpdateEmployeeParams {
    name: string
    working_hours: string
}

export class EmployeeUsecase {
    constructor(private db: DataSource) {}
    async updateEmployee(id: number, {name,  working_hours}: UpdateEmployeeParams): Promise<Employee | undefined> {
        const repo = this.db.getRepository(Employee)
        const employeeToUpdate = await repo.findOneBy({id})
        if (!employeeToUpdate) return undefined

        if(name){
            employeeToUpdate.name = name
            employeeToUpdate.working_hours = working_hours
        }
        const employeeUpdated = await repo.save(employeeToUpdate)
        return employeeUpdated
    }
    async listEmployee(ListEmployeeFilter: ListEmployeeFilter): Promise<{ Employee: Employee[]; totalCount: number; }> {
        console.log(ListEmployeeFilter)
        const query = this.db.createQueryBuilder(Employee, 'Employee')
        query.skip((ListEmployeeFilter.page - 1) * ListEmployeeFilter.limit)
        query.take(ListEmployeeFilter.limit)

        const [Employe, totalCount] = await query.getManyAndCount()
        return {
            Employee: Employe,
            totalCount
        }
    }


}