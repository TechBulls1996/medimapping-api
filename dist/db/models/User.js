"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
var userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
    },
    mobile: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    country: {
        type: Object,
        required: true,
    },
    state: {
        type: Object,
        required: true,
    },
    city: {
        type: Object,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    pinCode: {
        type: String,
        required: true,
    },
    roles: {
        type: Array,
        required: true,
        default: [
            {
                type: "user",
                isPrimary: true,
            },
        ],
    },
}, {
    timestamps: true,
});
module.exports = mongoose_1.default.model("User", userSchema);
