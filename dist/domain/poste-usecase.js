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
exports.PosteUsecase = void 0;
const poste_1 = require("../database/entities/poste");
class PosteUsecase {
    constructor(db) {
        this.db = db;
    }
    updatePoste(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { name, description }) {
            const repo = this.db.getRepository(poste_1.Poste);
            const posteToUpdate = yield repo.findOneBy({ id });
            if (!posteToUpdate)
                return undefined;
            if (name) {
                posteToUpdate.name = name;
            }
            if (description) {
                posteToUpdate.description = description;
            }
            const PosteUpdated = yield repo.save(posteToUpdate);
            return PosteUpdated;
        });
    }
    listPoste(listPosteFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(listPosteFilter);
            const query = this.db.createQueryBuilder(poste_1.Poste, 'Poste');
            query.skip((listPosteFilter.page - 1) * listPosteFilter.limit);
            query.take(listPosteFilter.limit);
            const [Postes, totalCount] = yield query.getManyAndCount();
            return {
                Postes,
                totalCount
            };
        });
    }
}
exports.PosteUsecase = PosteUsecase;
