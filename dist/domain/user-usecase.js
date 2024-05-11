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
exports.UserUsecase = void 0;
const token_1 = require("../database/entities/token");
const user_1 = require("../database/entities/user");
class UserUsecase {
    constructor(db) {
        this.db = db;
    }
    deleteToken(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const TokenDelete = yield this.db.createQueryBuilder().delete().from(token_1.Token).where("userId = :id", { id: id }).execute();
            return TokenDelete;
        });
    }
    getUsersInfos() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db.getRepository(user_1.User); // ou vous pouvez utiliser getRepository si vous préférez
            const sqlQuery = `
        SELECT
          u.id AS user_id,
          u.firstname,
          u.lastname,
          u.email,
          u.role,
          u.balance,
          COUNT(DISTINCT t.id) AS total_tickets,
          SUM(CASE WHEN t.is_used = TRUE THEN 1 ELSE 0 END) AS tickets_used,
          SUM(t.nb_tickets) AS total_tickets_purchased,
          COUNT(DISTINCT ts.id) AS total_ticket_showtime_accesses,
          COUNT(DISTINCT tr.id) AS total_transactions,
          GROUP_CONCAT(DISTINCT m.title ORDER BY m.title ASC SEPARATOR ', ') AS movies_watched,
          GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.start_datetime, '-', s.end_datetime) ORDER BY s.id ASC SEPARATOR ', ') AS showtimes_info
        FROM
          user u
        LEFT JOIN
          ticket t ON u.id = t.userId
        LEFT JOIN
          ticket_showtime_accesses ts ON t.id = ts.ticketId
        LEFT JOIN
          transaction tr ON u.id = tr.userId
        LEFT JOIN
          showtime s ON ts.showtimeId = s.id
        LEFT JOIN
          movie m ON s.movieId = m.id
        GROUP BY
          u.id;
        `;
            const users = yield entityManager.query(sqlQuery);
            return users;
        });
    }
    getUserInfos(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db.getRepository(user_1.User);
            const sqlQuery = `
        SELECT
            u.id AS user_id,
            u.firstname,
            u.lastname,
            u.email,
            u.role,
            u.balance,
            COUNT(DISTINCT t.id) AS total_tickets,
            SUM(CASE WHEN t.is_used = TRUE THEN 1 ELSE 0 END) AS tickets_used,
            SUM(t.nb_tickets) AS total_tickets_purchased,
            COUNT(DISTINCT ts.id) AS total_ticket_showtime_accesses,
            COUNT(DISTINCT tr.id) AS total_transactions,
            GROUP_CONCAT(DISTINCT m.title ORDER BY m.title ASC SEPARATOR ', ') AS movies_watched,
            GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.start_datetime, '-', s.end_datetime) ORDER BY s.id ASC SEPARATOR ', ') AS showtimes_info
        FROM
            user u
        LEFT JOIN
            ticket t ON u.id = t.userId
        LEFT JOIN
            ticket_showtime_accesses ts ON t.id = ts.ticketId
        LEFT JOIN
            transaction tr ON u.id = tr.userId
        LEFT JOIN
            showtime s ON ts.showtimeId = s.id
        LEFT JOIN
            movie m ON s.movieId = m.id
        WHERE u.id = ?
        GROUP BY
            u.id;
        `;
            const users = yield entityManager.query(sqlQuery, [id]);
            return users;
        });
    }
}
exports.UserUsecase = UserUsecase;
