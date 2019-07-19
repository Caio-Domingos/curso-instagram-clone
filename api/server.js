const express = require('express'),
  bodyParser = require('body-parser'),
  mongodb = require('./config/conn'),
  cors = require('cors'),
  multiparty = require('connect-multiparty'),
  fs = require('fs'),
  objectID = require('mongodb').ObjectID;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(multiparty());

const port = 8080;

app.listen(port);
console.log('Servidor na porta ' + port);

app.get('/', (req, res) => {
  const resposta = { msg: 'Olá' };
  res.send(resposta);
});

app.post('/api', async (req, res) => {
  const connection = await mongodb;

  console.log(req.files);

  const date = new Date();
  const timestamp = date.getTime();

  const url_imagem = timestamp + '_' + req.files.arquivo.originalFilename;
  const path_origem = req.files.arquivo.path;
  const path_destino = './uploads/' + url_imagem;

  fs.copyFile(path_origem, path_destino, err => {
    console.log('erro no fs', err);
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
  });

  const dados = {
    titulo: req.body.titulo,
    url_imagem: url_imagem
  };

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

app.get('/uploads/:imagem', (req, res) => {
  const img = req.params.imagem;
  console.log(img);

  fs.readFile('./uploads/' + img, (err, conteudo) => {
    if (err) {
      res.status(400).json({ erro: err });
      return;
    }
    res.writeHead(200, {
      'content-type': 'image/jpg'
    });
    res.end(conteudo);
  });
});

app.put('/api/:id', async (req, res) => {
  const connection = await mongodb;

  const id = req.params.id;
  const dados = req.body;

  console.log(id);
  connection
    .db()
    .collection('postagens')
    .findOneAndUpdate(
      { _id: objectID(id) },
      {
        $push: {
          comentarios: {
            id_comentario: new objectID(),
            comentario: dados.comentario
          }
        }
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
  const id = req.params.id;

  connection
    .db()
    .collection('postagens')
    .updateMany({}, {
      $pull: {
        comentarios: {id_comentario: objectID(id)}
      }
    }, (err, result) => {
      if (err) {
        res.status(422).json(err);
        return;
      }

      res.status(200).json(result);
    });
});
