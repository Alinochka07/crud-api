import http, { Server, IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';
import { routes } from './routes';


interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string [] | [];
}

let users: User[] = [];

const port = process.env.PORT || 4000;






