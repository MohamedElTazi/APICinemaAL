import { DataSource, Repository } from "typeorm";
import { Movie } from "../database/entities/movie";

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
    duration: number
    genre: string
}
export class MovieUsecase {
    constructor(private db: DataSource) {}
    async listSalle(listMovieFilter: ListMovieFilter): Promise<{ Movies: Movie[]; totalCount: number; }> {
        console.log(listMovieFilter)
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
}