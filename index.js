const {Command} = require('commander')
const express = require('express')
const http = require('http')
const path = require('path')
const fs = require('fs'). promises
const multer = require('multer')

const program = new Command();
program
    .requiredOption('-h, --host <host>', 'адреса сервера')
    .requiredOption('-p, --port <port>', 'порт сервера')
    .requiredOption('-C, --cache <cache>', 'адреса кешованих файлів');

program.parse(process.argv);
const { host, port, cache } = program.opts();

const app = express();

app.use(express.json());

const server = http.createServer(app);
const upload =multer();

server.listen(port, host, () => {
    console.log(`Сервер запущено на http://${host}:${port}`);
});
app.get(`/notes/:name`, async (req, res) => {
    const noteName = req.params.name; // test
    const notePath = path.join(cache, `${ noteName }.txt`); // ./cache/test.txt

    try {
        await fs.access(notePath);
    }
    catch (error) {
        return res.status(404).send('Not Found');
    }

    try {
        const data = await fs.readFile(notePath, 'utf8');
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error reading the note');
    }
});
app.put('/notes/:name', async (req, res) => {
    const noteName = req.params.name;
    const notePath = path.join(cache, `${ noteName }.txt`);
    const newNote = req.body.text;
    try {
        await fs.access(notePath);
    }
    catch (error) {
        return res.status(404).send('Not Found');
    }

    try {
        await fs.writeFile(notePath, newNote, 'utf8');
        res.send('Нотатка була записана у файл');
    } catch (error) {
        console.error(error);
        res.status(500).send('Помилка під час запису нотатки');
    }
});