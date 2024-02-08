import http, { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import { v4 as uuidv4 } from 'uuid';

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

        },
        DELETE: (req, res) => {

        }
    },
    notFound: {
        GET: (req: IncomingMessage, res: ServerResponse) => {
          res.writeHead(404, headers);
          res.end(JSON.stringify({ message: 'Not Found' }));
        }
      }
}

