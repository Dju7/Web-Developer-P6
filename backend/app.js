const express = require ('express');

const app = express();

app.use((req, res) => {
    res.json({ message: "requete ok : hello world"});
});

module.exports = app;