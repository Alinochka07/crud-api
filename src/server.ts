import { Server, IncomingMessage, ServerResponse, createServer } from 'http';
import * as url from 'url';
import { routes } from './routes';


const port = process.env.PORT || 4000;

export const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = url.parse(req.url || '', true);
    const path = parsedUrl.pathname || '';
    const method = (req.method || '').toUpperCase();

    let handler = routes[path] && routes[path][method];

    if (handler) {
        handler(req, res)
    } else {
        routes.notFound.GET(req, res);
    }
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})






