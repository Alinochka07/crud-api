import { Server, IncomingMessage, ServerResponse, createServer } from 'http';
import * as url from 'url';
import routes, { readUserData } from './routes';

const port = process.env.PORT || 4000;

async function startServer() {
    try {
        await readUserData();

        const server: Server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
            try {
                const parsedUrl = url.parse(req.url || '', true);
                const path = parsedUrl.pathname || '';
                const method = (req.method || '').toUpperCase();

                const handler = routes[path] && routes[path][method];

                if (!handler) {
                    routes.notFound.GET(req, res);
                } else {
                    handler(req, res); 
                }
            } catch (error) {
                console.error('Error processing request:', error);
                res.statusCode = 500; 
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        });

        server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

startServer();