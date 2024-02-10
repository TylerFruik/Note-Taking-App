const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { readAndAppend, readFromFile } = require('./helpers/fsUtils');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4();
  readAndAppend(newNote, './db/db.json');
  res.json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;

  readFromFile('./db/db.json')
    .then((data) => {
      const notes = JSON.parse(data);
      const updatedNotes = notes.filter((note) => note.id !== id);
    fs.writeFile('./db/db.json', JSON.stringify(updatedNotes), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete note' });
      } else {
        res.json({ message: 'Note deleted successfully' });
      }
    });
  });
});

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
