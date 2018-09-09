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
  quantity: Number,
  date: String
});

const Item = mongoose.model('Item', itemSchema);

/* GET home page. */
app.get('/', (req, res)=> {
  res.redirect('/item');
});
app.get('/item', (req, res)=> {
  Item.find({date: {"$gte": new Date("2018-09-08"), "$lt": new Date("2018-09-10")}}, (err, allItems)=>{
    if (err) {
      console.log(err);
    } else {
      var total = 0;
      allItems.forEach((item)=>{
        total = total + item.calories;
      })
      res.render('itemlist', {'itemlist': allItems, 'total': total});
    }
  });
});
app.post('/item', (req, res)=> {
Item.create({item: req.body.input, calories: req.body.calories, quantity: req.body.quantity, date: new Date()}, (err, newItem)=>{
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
