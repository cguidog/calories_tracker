const express = require('express');
const app = express();
const mongoose = require('mongoose');
const moment = require('moment');
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
  limitId= item.id;
  })
})
/* GET home page. */
app.get('/', (req, res)=> {
  res.redirect('/item');
});
app.get('/item', (req, res)=> {
  Item.find({date: {"$gte": moment().startOf('day'), "$lt": moment().endOf('day')}}, (err, allItems)=>{
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
      //  console.log(item.limit);
        })
      })
      res.render('itemlist', {'itemlist': allItems, total, limit, limitId});
    }
  });
});
app.post('/item', (req, res)=> {
Item.create({item: req.body.input, calories: req.body.calories, quantity: req.body.quantity, date: new Date()}, (err, newItem)=>{
  if (err) {
    console.log('Error:' + err);
    res.render('itemlist');
  } else {
    res.redirect('/');
  }
});
});

app.get('/item/new', (req, res)=>{
  res.render('new');
});

app.get('/item/:id/edit', (req, res)=>{
  Item.findById(req.params.id, (err, showItem)=>{
  if (err){
    res.redirect('/item');
  } else {
    res.render('edititem', {item: showItem});
  }
  });
  });

  app.put('/item/:id', (req, res)=>{
    Item.findByIdAndUpdate(req.params.id, {item: req.body.input, calories: req.body.calories, quantity: req.body.quantity}, (err, UpdtItem)=>{
      if (err) {
        res.redirect('/item/' + req.params.id + '/edit');
      } else {
        res.redirect('/item');
      }
    });
    });
app.delete('/item/:id', (req, res)=>{
  Item.findByIdAndRemove(req.params.id, (err)=>{
    if (err) {
      res.redirect('/item');
      console.log(err)
    } else {
      res.redirect('/item');
    }
  });
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

  app.get('/limit/:id/edit', (req, res)=>{
    Limit.findById(limitId, (err, showLimit)=>{
    if (err){
      res.redirect('/item');
    } else {
      res.render('editlimit', {limit: showLimit});
    }
    });
    });
    app.put('/limit', (req, res)=>{
      Limit.findByIdAndUpdate(limitId, {limit: req.body.limit}, (err, UpdtLimit)=>{
        limit=UpdtLimit.limit;
        if (err) {
          res.redirect('/limit');
        } else {
          console.log(limit)
          res.redirect('/');
        }
      });
      });
module.exports = app;
