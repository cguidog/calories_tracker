const express = require('express');
const app = express();
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
const limitSchema = new mongoose.Schema({
  limit: Number
});

const Limit = mongoose.model('Limit', limitSchema);
var limit = Limit.find({}, (err, allLimit)=>{
  allLimit.forEach((item)=>{
  limit = item.limit;
  })
})
/* GET home page. */
app.get('/', (req, res)=> {
  res.redirect('/item');
});
app.get('/item', (req, res)=> {
  Item.find({date: {"$gte": new Date("Sat Sep 09 2018 00:00:00 GMT-0400 (EDT)"), "$lt": new Date("2018-09-10")}}, (err, allItems)=>{
    if (err) {
      console.log(err);
    } else {
      var total = 0;
      allItems.forEach((item)=>{
        total = total + item.calories;
      });
      Limit.find({}, (err, allLimit)=>{
        allLimit.forEach((item)=>{
        limit = item.limit;
        })

        console.log(limit);
      })
      res.render('itemlist', {'itemlist': allItems, 'total': total, 'limit': limit});
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
app.get('/limit', (req, res)=>{
  res.render('limit');
});
app.post('/limit', (req, res)=> {
  Limit.create({limit: req.body.limit}, (err, newItem)=>{
    if (err) {
      console.log('Error:' + err);
      res.render('limit');
    } else {
      limit = '';
      res.redirect('/item');
    }
  });
  });
  app.get('/limit/edit', (req, res)=>{
    Limit.findById('5b952b524ef09a03c61f91b8', (err, showLimit)=>{
    if (err){
      res.redirect('/item');
    } else {
      res.render('editlimit', {limit: showLimit});
    }
    });
    });
    app.put('/limit', (req, res)=>{
      Limit.findByIdAndUpdate("5b952b524ef09a03c61f91b8", {limit: req.body.limit}, (err, UpdtLimit)=>{
        if (err) {
          res.redirect('/limit');
        } else {
          res.redirect('/item');
        }
      });
      });
module.exports = app;
