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
class MovieUsecase {
    constructor(db) {
        this.db = db;
    }
    listSalle(listMovieFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(listMovieFilter);
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
                movieToUpdate.description = description;
                movieToUpdate.duration = duration;
                movieToUpdate.genre = genre;
            }
            const MovieUpdated = yield repo.save(movieToUpdate);
            return MovieUpdated;
        });
    }
}
exports.MovieUsecase = MovieUsecase;
