"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRoutes = void 0;
const invalid_path_handler_1 = require("../errors/invalid-path-handler");
const user_1 = require("./user");
const salle_1 = require("./salle");
const movie_1 = require("./movie");
const showtime_1 = require("./showtime");
const poste_1 = require("./poste");
const transaction_1 = require("./transaction");
const ticket_1 = require("./ticket");
const ticketShowtimeAccesses_1 = require("./ticketShowtimeAccesses");
const statistic_1 = require("./statistic");
const initRoutes = (app) => {
    app.get("/health", (res) => {
        res.send({ "message": "OP LE S" });
    });
    (0, user_1.UserHandler)(app);
    (0, salle_1.SalleHandler)(app);
    (0, poste_1.PosteHandler)(app);
    (0, movie_1.MovieHandler)(app);
    (0, showtime_1.ShowtimeHandler)(app);
    (0, transaction_1.TransactionHandler)(app);
    (0, ticket_1.TicketHandler)(app);
    (0, ticketShowtimeAccesses_1.TicketShowtimeAccessessHandler)(app);
    (0, statistic_1.StatisticHandler)(app);
    app.use(invalid_path_handler_1.invalidPathHandler);
};
exports.initRoutes = initRoutes;
