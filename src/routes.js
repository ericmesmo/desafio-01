import { randomUUID } from 'node:crypto';

import { Database } from "./database.js";
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (request, response) => {
            const { search } = request.query

            const tasks = database.select('tasks', {
                title: search,
                description: search
            });

            return response.end(JSON.stringify(tasks));
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/task'),
        handler: (request, response) => {
            const { title, description } = request.body;

            const task = {
                id: randomUUID(),
                title,
                description,
                completedAt: null, 
                createdAt: new Date(),
                updateAt: new Date()
            };

            database.insert('tasks', task); 

            return response.writeHead(201).end()
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/csv'),
        handler: (request, response) => {
            let body = '';

            request.on('data', (chunk) => {
                body += chunk.toString();
            });

            request.on('end', () => {
            const boundary = request.headers['content-type'].split('; ')[1].split('=')[1];
            const lines = body.split(`--${boundary}`);

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('filename')) {
                const line = lines[i + 1];
                const csvContent = line.split('\r\n').slice(1, -1).join('\r\n');

                const results = [];
                fs.createReadStream(csvContent)
                    .pipe(csvParser())
                    .on('data', (data) => results.push(data))
                    .on('end', () => {
                    // Aqui você tem acesso aos dados processados da planilha CSV
                    console.log(results);
                    response.writeHead(200, { 'Content-Type': 'text/plain' });
                    response.end('CSV file processed successfully.');
                    });

                break;
                }
            }
            });
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/task/:id'),
        handler: (request, response) => {
            const { id } = request.params;
            const { title, description } = request.body

            const res = database.update('tasks', id, {
                title,
                description,
                updateAt: new Date()
            });

             if (res){
                return response.writeHead(200).end("Tesk atualizada com sucesso");
            } else {
                return response.writeHead(406).end("Task não existe")
            }
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/task/:id'),
        handler: (request, response) => {

            const { id } = request.params;

            const res = database.delete('tasks', id); 

            if(res === 'sucess'){
                return response.writeHead(204).end();
            } else {
                return response.writeHead(406).end(res);
            }
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/task/:id/complete'),
        handler: (request, response) => {
            const { id } = request.params;

            const res = database.toogleComplete('tasks', id);

            if (res === 'error'){
                return response.writeHead(406).end("Task não existe")
            } else {
                return response.writeHead(200).end(res);
            }
        }
    }
]