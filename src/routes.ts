import { IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { sendJSONResponse } from './sendResponse';
import { extractUserId } from './extractUserId';
import fs from 'node:fs';
import * as path from 'path';
import * as url from 'url';


interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string [];
}

interface RouteHandler {
    (req: IncomingMessage, res: ServerResponse): void;
}

let users: User[] = [];

export async function readUserData(): Promise<User[]> {
    try {
        const filePath = path.resolve(__dirname, 'db.json');
        const exists = await fs.promises.access(filePath, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false)

        if (!exists) {
            throw new Error('DB file does not exist');
        } 

        const data = await fs.promises.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(data);
        const loadedUsers = parsedData.users || [];
    
        return loadedUsers;

    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        return []; 
    }
}
readUserData().then((userData) => {
    users = userData;
});


const routes: { [path: string]: { [method: string]: RouteHandler } } = {
    "/api/users": {
        GET: async (_, res) => {
            try {
                sendJSONResponse(res, 200, users);
            } catch (error) {
                console.log('Error in handling get requiest', error)
            }
        },
        POST: async (req, res) => {
            try {
                let body = '';
                await new Promise<void>((resolve, reject) => {
                    req.on('data', (chunk) => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        resolve();
                    });
                    req.on('error', (err) => {
                        console.log('error: ', err)
                        reject(err);
                    });
                });

                const {username, age, hobbies } = JSON.parse(body);
                !username || !age ? sendJSONResponse(res, 200, { message: 'Username and age are required!'}) : null

                const newUser: User = {
                    id: uuidv4(),
                    username: username,
                    age: age,
                    hobbies: hobbies || []
                };
                users.push(newUser);
                await fs.promises.writeFile(path.resolve(__dirname, 'db.json'), JSON.stringify({ users }, null, 2));

                sendJSONResponse(res, 201, newUser);

            } catch (error) {
                console.error('Error during creating user', error);
            }
        }
    },
    "/api/users/:userId": {
        GET: async (req, res) => {
            try {
                const userId = extractUserId(req);
                console.log('Requested userId:', userId);
                
                if (!userId) {
                    sendJSONResponse(res, 400, { message: 'Invalid userId' });
                    return;
                }
                const user = users.find((user) => user.id === userId);
                console.log('Found user:', user);

                if (!user) {
                    sendJSONResponse(res, 404, { message: 'User not found' });
                    return;
                }
                sendJSONResponse(res, 200, user);
               
            } catch (error) {
                console.error('Error during getting user', error);
                sendJSONResponse(res, 500, { error: 'Internal Server Error' });
            }
        },
        PUT: async (req, res) => {
            try {
                let body = '';
                await new Promise<void>((resolve, reject) => {
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
                    sendJSONResponse(res, 404, { message: 'User not found' });
                    return;
                }

                if (!username || !age) {
                    sendJSONResponse(res, 400, { message: 'Username and age are required' });
                    return;
                }

                users[userIndex] = {
                    ...users[userIndex],
                    username,
                    age,
                    hobbies: hobbies || users[userIndex].hobbies,
                };
                sendJSONResponse(res, 200, users[userIndex]);
            } catch (error) {
                console.error('Error during updating existing user', error);
            }
        },
        DELETE: async (req, res) => {
            try {
                const userId = extractUserId(req);
                if (!userId) {
                    sendJSONResponse(res, 400, { message: 'Invalid userId' });
                    return;
                }
                const index = users.findIndex((user) => user.id === userId);
                if (index === -1) {
                    sendJSONResponse(res, 404, { message: 'User not found' });
                    return;
                }
                users.splice(index, 1);
                sendJSONResponse(res, 204, { message: 'User has been successfully deleted' });
            } catch (error) {
                console.error('Error during removing the user', error);
            }
            
        }
    },
    notFound: {
        GET: async (req: IncomingMessage, res: ServerResponse) => {
            sendJSONResponse(res, 404, { message: 'Not Found' });
        },
    },
}

export default routes;