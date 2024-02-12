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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readUserData = void 0;
const uuid_1 = require("uuid");
const sendResponse_1 = require("./sendResponse");
const extractUserId_1 = require("./extractUserId");
const node_fs_1 = __importDefault(require("node:fs"));
const path = __importStar(require("path"));
const url = __importStar(require("url"));
let users = [];
async function readUserData() {
    try {
        const filePath = path.resolve(__dirname, 'db.json');
        const exists = await node_fs_1.default.promises.access(filePath, node_fs_1.default.constants.F_OK)
            .then(() => true)
            .catch(() => false);
        if (!exists) {
            throw new Error('DB file does not exist');
        }
        const data = await node_fs_1.default.promises.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(data);
        const loadedUsers = parsedData.users || [];
        return loadedUsers;
    }
    catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        return [];
    }
}
exports.readUserData = readUserData;
readUserData().then((userData) => {
    users = userData;
});
const routes = {
    "/api/users": {
        GET: async (_, res) => {
            try {
                (0, sendResponse_1.sendJSONResponse)(res, 200, users);
            }
            catch (error) {
                console.log('Error in handling get requiest', error);
            }
        },
        POST: async (req, res) => {
            try {
                let body = '';
                await new Promise((resolve, reject) => {
                    req.on('data', (chunk) => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        resolve();
                    });
                    req.on('error', (err) => {
                        console.log('error: ', err);
                        reject(err);
                    });
                });
                const { username, age, hobbies } = JSON.parse(body);
                !username || !age ? (0, sendResponse_1.sendJSONResponse)(res, 200, { message: 'Username and age are required!' }) : null;
                const newUser = {
                    id: (0, uuid_1.v4)(),
                    username: username,
                    age: age,
                    hobbies: hobbies || []
                };
                users.push(newUser);
                await node_fs_1.default.promises.writeFile(path.resolve(__dirname, 'db.json'), JSON.stringify({ users }, null, 2));
                (0, sendResponse_1.sendJSONResponse)(res, 201, newUser);
            }
            catch (error) {
                console.error('Error during creating user', error);
            }
        }
    },
    "/api/users/:userId": {
        GET: async (req, res) => {
            try {
                const reqUrl = req.url || '';
                console.log('Request URL:', reqUrl);
                const parsedUrl = url.parse(reqUrl, true);
                console.log('Parsed URL:', parsedUrl);
                const userId = (0, extractUserId_1.extractUserId)(req, parsedUrl.pathname?.split('/').pop() || '');
                console.log('Requested userId:', userId);
                if (!userId) {
                    (0, sendResponse_1.sendJSONResponse)(res, 400, { message: 'Invalid userId' });
                    return;
                }
                console.log('Found user:', userId);
                (0, sendResponse_1.sendJSONResponse)(res, 200, userId);
            }
            catch (error) {
                console.error('Error during getting user', error);
                (0, sendResponse_1.sendJSONResponse)(res, 500, { error: 'Internal Server Error' });
            }
        },
        PUT: async (req, res) => {
            try {
                let body = '';
                await new Promise((resolve, reject) => {
                    req.on('data', (chunk) => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        resolve();
                    });
                    req.on('error', (err) => {
                        reject(err);
                    });
                });
                const { userId, username, age, hobbies } = JSON.parse(body);
                const userIndex = users.findIndex((user) => user.id === userId);
                if (userIndex === -1) {
                    (0, sendResponse_1.sendJSONResponse)(res, 404, { message: 'User not found' });
                    return;
                }
                if (!username || !age) {
                    (0, sendResponse_1.sendJSONResponse)(res, 400, { message: 'Username and age are required' });
                    return;
                }
                users[userIndex] = {
                    ...users[userIndex],
                    username,
                    age,
                    hobbies: hobbies || users[userIndex].hobbies,
                };
                (0, sendResponse_1.sendJSONResponse)(res, 200, users[userIndex]);
            }
            catch (error) {
                console.error('Error during updating existing user', error);
            }
        },
        DELETE: async (req, res) => {
            try {
                const reqUrl = req.url || '';
                const parsedUrl = url.parse(reqUrl, true);
                const userId = (0, extractUserId_1.extractUserId)(req, parsedUrl.pathname?.split('/').pop() || '');
                if (!userId) {
                    (0, sendResponse_1.sendJSONResponse)(res, 400, { message: 'Invalid userId' });
                    return;
                }
                const index = users.findIndex((user) => user.id);
                if (index === -1) {
                    (0, sendResponse_1.sendJSONResponse)(res, 404, { message: 'User not found' });
                    return;
                }
                users.splice(index, 1);
                (0, sendResponse_1.sendJSONResponse)(res, 204, { message: 'User has been successfully deleted' });
            }
            catch (error) {
                console.error('Error during removing the user', error);
            }
        }
    },
    notFound: {
        GET: async (req, res) => {
            (0, sendResponse_1.sendJSONResponse)(res, 404, { message: 'Not Found' });
        },
    },
};
exports.default = routes;
