"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendJSONResponse = void 0;
const sendJSONResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};
exports.sendJSONResponse = sendJSONResponse;
