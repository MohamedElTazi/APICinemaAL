"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planning = void 0;
const typeorm_1 = require("typeorm");
const employee_1 = require("./employee");
const poste_1 = require("./poste");
let Planning = class Planning {
    constructor(id, employees, postes, start_datetime, end_datetime) {
        this.id = id;
        this.employee = employees;
        this.poste = postes;
        this.start_datetime = start_datetime;
        this.end_datetime = end_datetime;
    }
};
exports.Planning = Planning;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Planning.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_1.Employee, employee => employee.id),
    __metadata("design:type", employee_1.Employee)
], Planning.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => poste_1.Poste, poste => poste.id),
    __metadata("design:type", poste_1.Poste)
], Planning.prototype, "poste", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Planning.prototype, "start_datetime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Planning.prototype, "end_datetime", void 0);
exports.Planning = Planning = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [Number, employee_1.Employee, poste_1.Poste, Date, Date])
], Planning);
