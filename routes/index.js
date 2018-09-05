const express = require('express');
const app = express();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const mongoose = require('mongoose');
const metOvrr = require("method-override");
const url = 'mongodb://localhost:27017/calorie_tracker';

mongoose.connect(url);
app.use(metOvrr("_method"));
const itemSchema = new mongoose.Schema({
  item: String,
  calories: Number,
  quantity: Number
});

const Item = mongoose.model('Item', itemSchema);

/* GET home page. */
app.get('/', (req, res)=> {

});
app.get('/item', (req, res)=> {
  MongoClient.connect(url, (err, database)=>{
    if(err){
      console.log('Unable to connect to server' + err);
    } else {
      console.log('Connection Established');
      const db = database.db('calorie_tracker');
      db.collection('items').find({}).toArray((err, result)=>{
        if (err){
          res.send(err);
        } else if (result.length) {
          res.render('itemlist', {
            'itemlist': result
          })
        } else {
          res.send('No documents found');
        }
        database.close();
      });
    }
  });
});
app.post('/item', (req, res)=> {
Item.create({item: req.body.input, calories: req.body.calories, quantity: req.body.quantity}, (err, newItem)=>{
  if (err) {
    console.log('Error:' + err);
    res.render('item');
  } else {
    res.redirect('/item');
  }
});
});

app.get('/item/new', (req, res)=>{
  res.render('new');
});

module.exports = app;
