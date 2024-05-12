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
exports.SalleUsecase = void 0;
const salle_1 = require("../database/entities/salle");
const showtime_1 = require("../database/entities/showtime");
class SalleUsecase {
    constructor(db) {
        this.db = db;
    }
    listSalle(listSalleFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(listSalleFilter);
            const query = this.db.createQueryBuilder(salle_1.Salle, 'Salle');
            if (listSalleFilter.name) {
                query.andWhere('Salle.name = :name', { name: listSalleFilter.name });
            }
            if (listSalleFilter.type) {
                query.andWhere('Salle.type = :type', { type: listSalleFilter.type });
            }
            if (listSalleFilter.access_disabled) {
                query.andWhere('Salle.access_disabled = :access_disabled', { access_disabled: listSalleFilter.access_disabled });
            }
            if (listSalleFilter.maintenance_status) {
                query.andWhere('Salle.maintenance_status = :maintenance_status', { maintenance_status: listSalleFilter.maintenance_status });
            }
            if (listSalleFilter.capacityMax) {
                query.andWhere('Salle.capacity <= :capacityMax', { capacityMax: listSalleFilter.capacityMax });
            }
            query.skip((listSalleFilter.page - 1) * listSalleFilter.limit);
            query.take(listSalleFilter.limit);
            const [Salles, totalCount] = yield query.getManyAndCount();
            return {
                Salles,
                totalCount
            };
        });
    }
    updateSalle(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { capacity, type, description, name }) {
            const repo = this.db.getRepository(salle_1.Salle);
            const Sallefound = yield repo.findOneBy({ id });
            if (Sallefound === null)
                return null;
            if (name) {
                Sallefound.name = name;
            }
            if (type) {
                Sallefound.type = type;
            }
            if (description) {
                Sallefound.description = description;
            }
            if (capacity) {
                Sallefound.capacity = capacity;
            }
            const SalleUpdate = yield repo.save(Sallefound);
            return SalleUpdate;
        });
    }
    updateMaintenanceSalle(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { maintenance_status }) {
            const repo = this.db.getRepository(salle_1.Salle);
            const Sallefound = yield repo.findOneBy({ id });
            if (Sallefound === null)
                return null;
            if (maintenance_status === true || maintenance_status === false) {
                Sallefound.maintenance_status = maintenance_status;
            }
            const SalleUpdate = yield repo.save(Sallefound);
            return SalleUpdate;
        });
    }
    getSallePlanning(startDate, endDate, id) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.db.getRepository(showtime_1.Showtime)
                .createQueryBuilder("showtime")
                .leftJoinAndSelect("showtime.salle", "salle")
                .leftJoinAndSelect("showtime.movie", "movie")
                .select([
                "salle.name",
                "salle.description",
                "salle.type",
                "movie.title",
                "movie.description",
                "showtime.start_datetime",
                "showtime.end_datetime",
                "showtime.special_notes"
            ])
                .where("salle.maintenance_status = false")
                .andWhere("salle.id = :id", { id: id });
            if (startDate && endDate) {
                endDate = endDate + " 23:59:59";
                query = query.andWhere("showtime.start_datetime >= :startDate AND showtime.end_datetime <= :endDate", { startDate, endDate });
            }
            else if (startDate && !endDate) {
                query = query.andWhere("showtime.start_datetime >= :startDate", { startDate });
            }
            else if (!startDate && endDate) {
                endDate = endDate + " 23:59:59";
                query = query.andWhere("showtime.end_datetime <= :endDate", { endDate });
            }
            return query;
        });
    }
}
exports.SalleUsecase = SalleUsecase;
