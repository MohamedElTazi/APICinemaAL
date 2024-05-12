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
exports.MovieUsecase = void 0;
const movie_1 = require("../database/entities/movie");
const showtime_1 = require("../database/entities/showtime");
const database_1 = require("../database/database");
const showtime_usecase_1 = require("./showtime-usecase");
const planning_usecase_1 = require("./planning-usecase");
class MovieUsecase {
    constructor(db) {
        this.db = db;
    }
    listSalle(listMovieFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(movie_1.Movie, 'Movie');
            query.skip((listMovieFilter.page - 1) * listMovieFilter.limit);
            query.take(listMovieFilter.limit);
            const [Movies, totalCount] = yield query.getManyAndCount();
            return {
                Movies,
                totalCount
            };
        });
    }
    updateMovie(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { title, description, duration, genre }) {
            const repo = this.db.getRepository(movie_1.Movie);
            const movieToUpdate = yield repo.findOneBy({ id });
            if (!movieToUpdate)
                return undefined;
            if (title) {
                movieToUpdate.title = title;
            }
            if (description) {
                movieToUpdate.description = description;
            }
            if (duration) {
                movieToUpdate.duration = duration;
            }
            if (genre) {
                movieToUpdate.genre = genre;
            }
            const MovieUpdated = yield repo.save(movieToUpdate);
            return MovieUpdated;
        });
    }
    getMoviePlanning(startDate, endDate, id) {
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
                .andWhere("movie.id = :id", { id: id });
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
    getMovieAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.db.getRepository(showtime_1.Showtime)
                .createQueryBuilder("showtime")
                .leftJoinAndSelect("showtime.salle", "salle")
                .leftJoinAndSelect("showtime.movie", "movie")
                .select([
                "salle.id",
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
                .andWhere("showtime.start_datetime >= NOW()");
            return query;
        });
    }
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        // Convertit les heures et les minutes en chaîne, ajoutant un zéro au début si nécessaire
        const hoursStr = hours.toString().padStart(2, '0');
        const minutesStr = remainingMinutes.toString().padStart(2, '0');
        return `${hoursStr}:${minutesStr}:00`; // Format HH:mm:ss
    }
    updateShowtimeEndDatetimesOnFilmDurationChange(movieId, newDurationMinutes) {
        return __awaiter(this, void 0, void 0, function* () {
            const showtimes = yield this.db.getRepository(showtime_1.Showtime)
                .createQueryBuilder("showtime")
                .where("showtime.movieId = :movieId", { movieId })
                .getMany();
            const verifShowtimesPlanning = showtimes.map((showtime) => __awaiter(this, void 0, void 0, function* () {
                const showtimeUsecase = new showtime_usecase_1.ShowtimeUsecase(database_1.AppDataSource);
                const planningUseCase = new planning_usecase_1.PlanningUsecase(database_1.AppDataSource);
                const showtimeById = yield showtimeUsecase.foundShowtime(showtime.id);
                if (showtimeById === null) {
                    console.log({ error: `Showtime not found` });
                    return;
                }
                if ((showtime.start_datetime !== undefined && showtime.end_datetime !== undefined) ||
                    (showtime.start_datetime !== undefined && showtime.end_datetime === undefined) ||
                    (showtime.start_datetime === undefined && showtime.end_datetime !== undefined) ||
                    (showtime.start_datetime === undefined && showtime.end_datetime === undefined)) {
                    const startDatetime = showtime.start_datetime !== undefined ? showtime.start_datetime : showtimeById.start_datetime;
                    const endDatetime = showtime.end_datetime !== undefined ? showtime.end_datetime : showtimeById.end_datetime;
                    const verifyPlanning = yield planningUseCase.verifyPlanning(startDatetime, endDatetime);
                    if (verifyPlanning[0].postesCouverts !== "3") {
                        console.log({ "error": `not all employees are available` });
                        return "not all employees are available";
                    }
                }
            }));
            yield Promise.all(verifShowtimesPlanning);
            const updatePromises = showtimes.map(showtime => {
                let newEndDatetime = new Date(showtime.start_datetime.getTime() + newDurationMinutes * 60000);
                if (isNaN(newEndDatetime.getTime())) {
                    console.error("Failed to calculate newEndDatetime for showtime:", showtime.id);
                    throw new Error("Invalid newEndDatetime calculated");
                }
                return this.db.getRepository(showtime_1.Showtime)
                    .createQueryBuilder()
                    .update(showtime_1.Showtime)
                    .set({ end_datetime: newEndDatetime })
                    .where("id = :id", { id: showtime.id })
                    .execute();
            });
            yield Promise.all(updatePromises);
        });
    }
}
exports.MovieUsecase = MovieUsecase;
