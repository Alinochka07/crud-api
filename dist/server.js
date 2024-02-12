"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const url = __importStar(require("url"));
const routes_1 = __importStar(require("./routes"));
const port = process.env.PORT || 4000;
async function startServer() {
    try {
        await (0, routes_1.readUserData)();
        const server = (0, http_1.createServer)(async (req, res) => {
            try {
                const parsedUrl = url.parse(req.url || '', true);
                const path = parsedUrl.pathname || '';
                const method = (req.method || '').toUpperCase();
                const handler = routes_1.default[path] && routes_1.default[path][method];
                if (!handler) {
                    routes_1.default.notFound.GET(req, res);
                }
                else {
                    handler(req, res);
                }
            }
            catch (error) {
                console.error('Error processing request:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        });
        server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }
    catch (error) {
        console.error('Error loading user data:', error);
    }
}
startServer();
