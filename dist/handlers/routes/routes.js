"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRoutes = void 0;
const invalid_path_handler_1 = require("../errors/invalid-path-handler");
const user_1 = require("./user");
const salle_1 = require("./salle");
const movie_1 = require("./movie");
const showtime_1 = require("./showtime");
const poste_1 = require("./poste");
const initRoutes = (app) => {
    app.get("/health", (req, res) => {
        res.send({ "message": "OP LE S" });
    });
    (0, user_1.UserHandler)(app);
    (0, salle_1.SalleHandler)(app);
    (0, poste_1.PosteHandler)(app);
    (0, movie_1.MovieHandler)(app);
    (0, showtime_1.ShowtimeHandler)(app);
    app.use(invalid_path_handler_1.invalidPathHandler);
};
exports.initRoutes = initRoutes;
