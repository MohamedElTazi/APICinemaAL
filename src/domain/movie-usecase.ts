import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { Movie } from "../database/entities/movie";
import { Showtime } from "../database/entities/showtime";

export interface ListMovieFilter {
    page: number
    limit: number
}
export interface ListMovieRequest {
    page?: number
    limit?: number
}
export interface UpdateMovieParams {
    title: string
    description: string
    duration: Date
    genre: string
}
export class MovieUsecase {
    constructor(private db: DataSource) {}
    async listSalle(listMovieFilter: ListMovieFilter): Promise<{ Movies: Movie[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Movie, 'Movie')
        query.skip((listMovieFilter.page - 1) * listMovieFilter.limit)
        query.take(listMovieFilter.limit)

        const [Movies, totalCount] = await query.getManyAndCount()
        return {
            Movies,
            totalCount
        }
    }

    async updateMovie(id: number, {title, description, duration, genre}: UpdateMovieParams): Promise<Movie | undefined> {
        const repo = this.db.getRepository(Movie)
        const movieToUpdate = await repo.findOneBy({id})
        if (!movieToUpdate) return undefined

        if(title){
            movieToUpdate.title = title
            movieToUpdate.description = description
            movieToUpdate.duration = duration
            movieToUpdate.genre = genre
        }
        const MovieUpdated = await repo.save(movieToUpdate)
        return MovieUpdated
    }

    async getMoviePlanning(startDate:string, endDate:string, id:number): Promise<SelectQueryBuilder<Showtime> | null>{

        let query = this.db.getRepository(Showtime)
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
            endDate = endDate + " 23:59:59"
            query = query.andWhere("showtime.start_datetime >= :startDate AND showtime.end_datetime <= :endDate", { startDate, endDate });
        }else if(startDate && !endDate){
            query = query.andWhere("showtime.start_datetime >= :startDate", { startDate });
        }else if(!startDate && endDate){
            endDate = endDate + " 23:59:59"
            query = query.andWhere("showtime.end_datetime <= :endDate", { endDate });
        }

        return query;

    }
    
}