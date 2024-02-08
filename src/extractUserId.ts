import { IncomingMessage } from 'http';
import * as url from 'url';

export const extractUserId = (req: IncomingMessage) => {
    const parsedUrl = url.parse(req.url || '', true);
    return parsedUrl.pathname?.split('/')[3];
}