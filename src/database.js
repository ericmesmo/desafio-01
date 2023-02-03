import fs from 'node:fs/promises';

const databasePath = new URL('db.json', import.meta.url); 

export class Database{
    #database = {}

    constructor(){
        fs.readFile(databasePath, 'utf8').then(data => {
            this.#database = JSON.parse(data)
        }).catch(() => {
            this.#persist
        })
    }

    #persist(){
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    select (table, search) {
        let data = this.#database[table] ?? []

        if(search){
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].includes(value);
                })
            })
        }

        return data; 
    }

    insert (table, data){
        if (Array.isArray(this.#database[table])){
            this.#database[table].push(data);
        } else {
            this.#database[table] = [data];
        }

        this.#persist();

        return data
    }

    update (table, id, data){
        const rowIndex = this.#database[table].findIndex(row => row.id === id);

        const task = this.select(table, {
            id
        });

        if(task){
            task.forEach(task => {
                this.#database[table][rowIndex] = { 
                    id,
                    title: data.title ? data.title : task.title,
                    description: data.description ? data.description : task.description,
                    completedAt: task.completedAt,
                    createdAt: task.createdAt,
                    updateAt: data.updateAt,
                }; 
                this.#persist();
            });
            return true;
        } else {
            return false
        }
    }

    delete (table, id){
        const rowIndex = this.#database[table].findIndex(row => row.id === id);

        if (rowIndex > -1){
            this.#database[table].splice(rowIndex, 1); 
            this.#persist();

            return 'sucess'; 
        } else {
            return 'Task não existe'
        }
    }

    toogleComplete(table, id){
        const rowIndex = this.#database[table].findIndex(row => row.id === id);

        if (rowIndex > -1){
            this.#database[table][rowIndex].completedAt = this.#database[table][rowIndex].completedAt === null ? new Date() : null; 
            this.#persist(); 
            return `Task ${this.#database[table][rowIndex].completedAt === null ? "feita" : "desfeita"}`
        } else {
            return 'error'
        }
    }
}