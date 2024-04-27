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
exports.ShowtimeUsecase = void 0;
const showtime_1 = require("../database/entities/showtime");
const movie_1 = require("../database/entities/movie");
const database_1 = require("../database/database");
const date_fns_1 = require("date-fns");
const ticketShowtimeAccesses_1 = require("../database/entities/ticketShowtimeAccesses");
class ShowtimeUsecase {
    constructor(db) {
        this.db = db;
    }
    listShowtime(listShowtimeFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(listShowtimeFilter);
            const query = this.db.createQueryBuilder(showtime_1.Showtime, 'Showtime');
            if (listShowtimeFilter.capacityMax) {
                query.andWhere('Showtime.capacity <= :capacityMax', { capacityMax: listShowtimeFilter.capacityMax });
            }
            query.skip((listShowtimeFilter.page - 1) * listShowtimeFilter.limit);
            query.take(listShowtimeFilter.limit);
            const [Showtimes, totalCount] = yield query.getManyAndCount();
            return {
                Showtimes,
                totalCount
            };
        });
    }
    updateShowtime(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { special_notes }) {
            const repo = this.db.getRepository(showtime_1.Showtime);
            const Showtimefound = yield repo.findOneBy({ id });
            if (Showtimefound === null)
                return null;
            if (special_notes) {
                Showtimefound.special_notes = special_notes;
            }
            const ShowtimeUpdate = yield repo.save(Showtimefound);
            return ShowtimeUpdate;
        });
    }
    getMovieDuration(movieId, start_datetime) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.AppDataSource
                .getRepository(movie_1.Movie)
                .createQueryBuilder("movie")
                .select("duration")
                .where("id = :movieId", { movieId: movieId })
                .getRawOne();
            const start_datetimeDate = new Date(start_datetime);
            const formattedDate = (0, date_fns_1.format)(start_datetimeDate, 'yyyy-MM-dd');
            let resultDate = new Date(formattedDate + "T" + result.duration);
            start_datetimeDate.setHours(start_datetimeDate.getHours() + resultDate.getHours());
            start_datetimeDate.setMinutes(start_datetimeDate.getMinutes() + resultDate.getMinutes());
            start_datetimeDate.setSeconds(start_datetimeDate.getSeconds() + resultDate.getSeconds());
            return start_datetimeDate;
        });
    }
    getShowtimePlanning(startDate, endDate) {
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
                .where("salle.maintenance_status = false");
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
    isOverlap(newShowtime) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.db.getRepository(showtime_1.Showtime)
                .createQueryBuilder('showtime')
                .where('start_datetime <= :newEndDatetime', { newEndDatetime: newShowtime.end_datetime })
                .andWhere('DATE_ADD(end_datetime, INTERVAL 30 MINUTE) >= :newStartDatetime', { newStartDatetime: newShowtime.start_datetime })
                .andWhere('salleId = :salleId', { salleId: newShowtime.salle })
                .getCount();
            if (count === 0) {
                return false;
            }
            return true;
        });
    }
    getCountByShowtimeId(showtimeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.db.getRepository(ticketShowtimeAccesses_1.TicketShowtimeAccesses).
                createQueryBuilder('ticketShowtimeAccess')
                .where('ticketShowtimeAccess.showtimeId = :showtimeId', { showtimeId })
                .getCount();
            return count;
        });
    }
}
exports.ShowtimeUsecase = ShowtimeUsecase;
