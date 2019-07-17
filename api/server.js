const express = require('express'),
  bodyParser = require('body-parser'),
  mongodb = require('./config/conn'),
  objectID = require('mongodb').ObjectID;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 8080;

app.listen(port);
console.log('Servidor na porta ' + port);

app.get('/', (req, res) => {
  const resposta = { msg: 'Olá' };
  res.send(resposta);
});

app.post('/api', async (req, res) => {
  const connection = await mongodb;

  const dados = req.body;

  connection
    .db()
    .collection('postagens')
    .insertOne(dados, (err, result) => {
      if (err) {
        res.status(422).json(err);
        return;
      }

      res.status(200).json(result);
    });
});

app.get('/api', async (req, res) => {
  const connection = await mongodb;
  connection
    .db()
    .collection('postagens')
    .find()
    .toArray((err, result) => {
      if (err) {
        res.status(422).json(err);
        return;
      }

      res.status(200).json(result);
    });
});

app.get('/api/:id', async (req, res) => {
  const connection = await mongodb;

  const id = req.param('id');

  connection
    .db()
    .collection('postagens')
    .find(objectID(id))
    .toArray((err, result) => {
      if (err) {
        res.status(422).json(err);
        return;
      }

      res.status(200).json(result);
    });
});

app.put('/api/:id', async (req, res) => {
  const connection = await mongodb;

  const id = req.param('id');
  const dados = req.body;
  connection
    .db()
    .collection('postagens')
    .findOneAndUpdate(
      objectID(id),
      {
        $set: { titulo: dados.titulo, imagem: dados.imagem }
      },
      (err, result) => {
        if (err) {
          res.status(422).json(err);
          return;
        }

        res.status(200).json(result);
      }
    );
});

app.delete('/api/:id', async (req, res) => {
  const connection = await mongodb;

  const id = req.param('id');

  connection
    .db()
    .collection('postagens')
    .findOneAndDelete(objectID(id), (err, result) => {
      if (err) {
        res.status(422).json(err);
        return;
      }

      res.status(200).json(result);
    });
});
