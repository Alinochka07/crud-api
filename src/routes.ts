import { IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { sendJSONResponse } from './sendResponse';
import { extractUserId } from './extractUserId';

interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string [] | [];
}

interface RouteHandler {
    (req: IncomingMessage, res: ServerResponse): void;
}

let users: User[] = [];


export const routes: { [path: string]: { [method: string]: RouteHandler } } = {
    'api/users': {
        GET: (_, res) => {
            sendJSONResponse(res, 200, users);
        },
        POST: (req, res) => {
            try {
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    const {username, age, hobbies } = JSON.parse(body);
                    !username || !age ? sendJSONResponse(res, 200, { message: 'Username and age are required!'}) : null

                    const newUser: User = {
                        id: uuidv4(),
                        username,
                        age,
                        hobbies: hobbies || []
                    };
                    users.push(newUser);
                    sendJSONResponse(res, 201, newUser);
                });
            } catch (error) {
                console.error('Error during creating user', error);
            }
        }
    },
    '/api/users/:userId': {
        GET: (req, res) => {
            try {
                const userId = extractUserId(req);
                !userId && sendJSONResponse(res, 400, { message: 'Invalid userId' });
                const user = users.find(user => user.id === userId);
                !user && sendJSONResponse(res, 404, { message: 'User not found' });
                sendJSONResponse(res, 200, user);
            } catch (error) {
                console.error('Error during getting user', error);
            }
        },
        PUT: (req, res) => {
            try {
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    const { userId, username, age, hobbies } = JSON.parse(body);
                    const userIndex = users.findIndex((user) => user.id === userId); 

                    userIndex === -1 && sendJSONResponse(res, 404, { message: 'User not found' });
                    !username || !age && sendJSONResponse(res, 400, { message: 'Username and age are required' });

                    users[userIndex] = {
                        ...users[userIndex],
                        username,
                        age,
                        hobbies: hobbies || users[userIndex].hobbies
                    };
                    sendJSONResponse(res, 200, users[userIndex]);
                })
            } catch (error) {
                console.error('Error during updating existing user', error);
            }
        },
        DELETE: (req, res) => {
            try {
                const userId = extractUserId(req);
                !userId && sendJSONResponse(res, 400, { message: 'Invalid userId' });
                const index = users.findIndex(user => user.id === userId);
                index === -1 && sendJSONResponse(res, 404, { message: 'User not found' });
                users.splice(index, 1);
                sendJSONResponse(res, 204, { message: 'User has been successfully deleted' });
            } catch (error) {
                console.error('Error during removing the user', error);
            }
            
        }
    },
    notFound: {
        GET: (req: IncomingMessage, res: ServerResponse) => {
            sendJSONResponse(res, 404, { message: 'Not Found' });
        }
      }
}

