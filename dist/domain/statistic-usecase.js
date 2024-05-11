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
exports.StatisticUsecase = void 0;
class StatisticUsecase {
    constructor(db) {
        this.db = db;
    }
    getAttendanceSalles() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `
        SELECT
            salle.name AS salle_name,
            DATE(start_datetime) AS date,
            COUNT(ticket_showtime_accesses.ticketId) AS nb_tickets_sold,
            COUNT(DISTINCT showtime.id) AS nb_showtimes
        FROM
            salle
        JOIN showtime ON salle.id = showtime.salleId
        JOIN ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        GROUP BY
            salle.name, DATE(start_datetime)
        ORDER BY
            date DESC;
        `;
            const query = yield entityManager.query(sqlQuery);
            return query;
        });
    }
    getTotalAttendance() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `
        SELECT
            DATE(start_datetime) AS date,
            COUNT(ticket_showtime_accesses.ticketId) AS nb_tickets_sold,
            COUNT(DISTINCT showtime.id) AS nb_showtimes
        FROM
            showtime
        JOIN ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        GROUP BY
            DATE(start_datetime)
        ORDER BY
            date DESC;
        `;
            const query = yield entityManager.query(sqlQuery);
            return query;
        });
    }
    realTimeAttendanceRate() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `
        SELECT
            salle.name AS salle_name,
            NOW() AS time_checked,
            COUNT(DISTINCT ticket_showtime_accesses.ticketId) AS current_visitors
        FROM
            salle
        JOIN showtime ON salle.id = showtime.salleId
        JOIN ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        WHERE
            showtime.start_datetime <= NOW() AND showtime.end_datetime >= NOW()
        GROUP BY
            salle.name;
        `;
            const query = yield entityManager.query(sqlQuery);
            return query;
        });
    }
    filmPerformance() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `
        SELECT
            salle.name AS salle_name,
            DATE_FORMAT(start_datetime, '%Y-%m-%d') AS date, -- Jour
            DATE_FORMAT(start_datetime, '%Y-%u') AS week, -- Semaine
            DATE_FORMAT(start_datetime, '%Y-%m') AS month, -- Mois
            DATE_FORMAT(start_datetime, '%Y') AS year, -- Année
            COUNT(ticket_showtime_accesses.ticketId) AS nb_tickets_sold
        FROM
            salle
        JOIN showtime ON salle.id = showtime.salleId
        JOIN ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        GROUP BY
            salle.name, date, week, month, year
        ORDER BY
            year, month, week, date;
        `;
            const query = yield entityManager.query(sqlQuery);
            return query;
        });
    }
    numberOfTicketsPurchasedUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `
        SELECT 
            user.firstname, 
            user.lastname, 
            COUNT(ticket.id) AS tickets_purchased 
        FROM 
            user 
        JOIN 
            ticket ON user.id = ticket.userId 
        GROUP BY 
            user.id;
        `;
            const query = yield entityManager.query(sqlQuery);
            return query;
        });
    }
    transactionDetailsUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `
        SELECT 
            user.firstname, 
            user.lastname, 
            transaction.transaction_type, 
            transaction.amount, 
            transaction.transaction_date 
        FROM 
            user 
        JOIN 
            transaction ON user.id = transaction.userId 
        ORDER BY 
            transaction.transaction_date DESC;
        `;
            const query = yield entityManager.query(sqlQuery);
            return query;
        });
    }
    usersAccessCurrentSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `
        SELECT DISTINCT
            user.firstname,
            user.lastname,
            showtime.start_datetime,
            movie.title
        FROM
            user
        JOIN
            ticket ON user.id = ticket.userId
        JOIN
            ticket_showtime_accesses ON ticket.id = ticket_showtime_accesses.ticketId
        JOIN
            showtime ON ticket_showtime_accesses.showtimeId = showtime.id
        JOIN
            movie ON showtime.movieId = movie.id
        WHERE
            showtime.start_datetime <= NOW() AND showtime.end_datetime >= NOW();
        `;
            const query = yield entityManager.query(sqlQuery);
            return query;
        });
    }
    mostWatchedMovie() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `
        SELECT
            movie.title,
            COUNT(ticket_showtime_accesses.ticketId) AS number_of_viewers
        FROM
            movie
        JOIN
            showtime ON movie.id = showtime.movieId
        JOIN
            ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        GROUP BY
            movie.id
        ORDER BY
            number_of_viewers DESC
        LIMIT 1;
        `;
            const query = yield entityManager.query(sqlQuery);
            return query;
        });
    }
    listOfFilmsByPopularity() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `
        SELECT
            movie.title,
            COUNT(ticket_showtime_accesses.ticketId) AS number_of_viewers
        FROM
            movie
        JOIN
            showtime ON movie.id = showtime.movieId
        JOIN
            ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        GROUP BY
            movie.id
        ORDER BY
            number_of_viewers DESC;
        `;
            const query = yield entityManager.query(sqlQuery);
            return query;
        });
    }
    numberScreeningsPerFilm() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db;
            const sqlQuery = `
        SELECT
            movie.title,
            COUNT(showtime.id) AS number_of_showtimes
        FROM
            movie
        JOIN
            showtime ON movie.id = showtime.movieId
        GROUP BY
            movie.id
        ORDER BY
            number_of_showtimes DESC;
        `;
            const query = yield entityManager.query(sqlQuery);
            return query;
        });
    }
}
exports.StatisticUsecase = StatisticUsecase;
