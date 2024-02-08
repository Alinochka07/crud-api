import http, { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import { v4 as uuidv4 } from 'uuid';
import { sendJSONResponse } from './sendResponse';

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
const headers = {'Content-Type': 'application/json' };

export const routes: { [path: string]: { [method: string]: RouteHandler } } = {
    'api/users': {
        GET: (_, res) => {
            res.writeHead(200, headers);
            res.end(JSON.stringify(users));
        },
        POST: (req, res) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const {username, age, hobbies } = JSON.parse(body);

                if(!username || !age) {
                    res.writeHead(200, headers);
                    res.end(JSON.stringify({ message: 'Username and age is required!'}));
                    return;
                } 

                const newUser: User = {
                    id: uuidv4(),
                    username,
                    age,
                    hobbies: hobbies || []
                };
                users.push(newUser);

                res.writeHead(201, headers);
                res.end(JSON.stringify(newUser));
            });
        }
    },
    '/api/users/:userId': {
        GET: (req, res) => {
            const parsedURL = url.parse(req.url || '', true);
            const userId = parsedURL.pathname?.split('/')[3];

            if(!userId) {
                res.writeHead(400, headers);
                res.end(JSON.stringify({ message: 'Invalid userId' }));
                return;
            }

            const user = users.find(user => user.id === userId);

            if (!user) {
                res.writeHead(404, headers);
                res.end(JSON.stringify({ message: 'User not found' }));
                return;
            }

            res.writeHead(200, headers);
            res.end(JSON.stringify(user));
        },
        PUT: (req, res) => {
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
        },
        DELETE: (req, res) => {
            
        }
    },
    notFound: {
        GET: (req: IncomingMessage, res: ServerResponse) => {
            sendJSONResponse(res, 404, { message: 'Not Found' });
        }
      }
}

