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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./handlers/routes/routes");
const database_1 = require("./database/database");
require("dotenv/config");
const swagger_1 = require("./swagger/swagger");
require("reflect-metadata");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    const port = 3000;
    try {
        console.log(process.env.NODE_ENV),
            yield database_1.AppDataSource.initialize();
        console.error("well connected to database");
    }
    catch (error) {
        console.log(error);
        console.error("Cannot contact database");
        process.exit(1);
    }
    app.use(express_1.default.json());
    (0, swagger_1.swaggerDocs)(app, port);
    (0, routes_1.initRoutes)(app);
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});
main();
