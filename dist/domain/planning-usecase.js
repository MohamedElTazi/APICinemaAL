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
exports.PlanningUsecase = void 0;
const planning_1 = require("../database/entities/planning");
class PlanningUsecase {
    constructor(db) {
        this.db = db;
    }
    listPlanning(listPlanningFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(planning_1.Planning, 'Planning');
            if (listPlanningFilter.capacityMax) {
                query.andWhere('Planning.capacity <= :capacityMax', { capacityMax: listPlanningFilter.capacityMax });
            }
            query.skip((listPlanningFilter.page - 1) * listPlanningFilter.limit);
            query.take(listPlanningFilter.limit);
            const [Plannings, totalCount] = yield query.getManyAndCount();
            return {
                Plannings,
                totalCount
            };
        });
    }
    updatePlanning(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { poste, employee, start_datetime, end_datetime }) {
            const repo = this.db.getRepository(planning_1.Planning);
            const planningToUpdate = yield this.foundPlanningById(id);
            if (planningToUpdate === null)
                return null;
            if (poste) {
                planningToUpdate.poste = poste;
            }
            if (employee) {
                planningToUpdate.employee = employee;
            }
            if (start_datetime) {
                planningToUpdate.start_datetime = start_datetime;
            }
            if (end_datetime) {
                planningToUpdate.end_datetime = end_datetime;
            }
            const planningUpdate = yield repo.save(planningToUpdate);
            return planningUpdate;
        });
    }
    verifyPlanning(start_datetime, end_datetime) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `SELECT COUNT(*) AS postesCouverts FROM planning WHERE start_datetime <= ? AND end_datetime >= ? AND posteId IN (1, 2, 3);`;
            const planning = yield entityManager.query(sqlQuery, [start_datetime, end_datetime]);
            return planning;
        });
    }
    verifyPoste(posteId, start_datetime, end_datetime) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `SELECT COUNT(*) FROM planning WHERE (start_datetime <= ? AND end_datetime >= ? AND posteId = ?) OR (start_datetime <= ? AND posteId = ?) OR (end_datetime >= ? AND posteId = ?);`;
            const planning = yield entityManager.query(sqlQuery, [start_datetime, end_datetime, posteId, start_datetime, posteId, end_datetime, posteId]);
            return planning;
        });
    }
    foundPlanningById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(planning_1.Planning);
            const planning = yield repo.findOneBy({ id });
            return planning;
        });
    }
}
exports.PlanningUsecase = PlanningUsecase;
