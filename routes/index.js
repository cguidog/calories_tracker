const express = require('express');
const app = express();
const mongoose = require('mongoose');
const moment = require('moment');
const metOvrr = require("method-override");
const url = 'mongodb://localhost:27017/calorie_tracker';
const firebase = require('firebase');
const firebaseRun = require('../api');
const auth = firebase.auth();

mongoose.connect(url);
app.use(metOvrr("_method"));
const itemSchema = new mongoose.Schema({
  user: String,
  item: String,
  calories: Number,
  quantity: Number,
  unit: String,
  favorite: Boolean,
  date: String
});
const Item = mongoose.model('Item', itemSchema);

const limitSchema = new mongoose.Schema({
  limit: Number
});

const userSchema = new mongoose.Schema({
  user: String,
  userId: String
});
const User = mongoose.model('User', userSchema);

const Limit = mongoose.model('Limit', limitSchema);

var limit = Limit.find({}, (err, allLimit)=>{
  allLimit.forEach((item)=>{
  limit = item.limit;
  limitId= item.id;
  })
});
var userId = '';
/* GET home page. */
app.get('/', (req, res)=> {
  res.render('index');
});

app.post('/', (req, res)=>{
  const email  = req.body.email;
  const password = req.body.password;
  const promise = auth.signInWithEmailAndPassword(email, password);
  promise.catch(e => console.log(e.message));
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser){
      User.find({userId: firebaseUser.uid}, (err, user)=>{
        userId = user[0].userId;
      });
      Item.find({date: {"$gte": moment().startOf('day'), "$lt": moment().endOf('day')}, user: firebaseUser.uid}, (err, allItems)=>{
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
          console.log('New limit: '+ limit);
            })
          })
          res.render('itemlist', {'itemlist': allItems, total, limit, limitId});
        }
      });
    } else {
       console.log('not log in');
    }
  })
});

app.get('/register', (req, res)=> {
  res.render('register');
});

app.post('/register', (req, res)=>{
  const email  = req.body.email;
  const password = req.body.password;
  const promise = auth.createUserWithEmailAndPassword(email, password);
  promise.catch(e => console.log(e.message));
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser){
      //console.log(firebaseUser.uid);
      User.create({user: firebaseUser.email, userId: firebaseUser.uid});
      Item.find({date: {"$gte": moment().startOf('day'), "$lt": moment().endOf('day')}, user: firebaseUser.email}, (err, allItems)=>{
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
          console.log('New limit: '+ limit);
            })
          })
          //console.log(userId);
          res.render('itemlist', {'itemlist': allItems, total, limit, limitId});
        }
      });
    }
   else {
      console.log('not log in');
    }
  })
});
app.get('/item', (req, res)=> {
  Item.find({date: {"$gte": moment().startOf('day'), "$lt": moment().endOf('day')},user: userId}, (err, allItems)=>{
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
      console.log('New limit: '+ limit);
        })
      })
      res.render('itemlist', {'itemlist': allItems, total, limit, limitId});
    }
  });
});
app.post('/item', (req, res)=> {
User.find()
Item.create({item: req.body.input.toUpperCase(),
            user: userId,
            calories: req.body.calories,
            quantity: req.body.quantity,
            unit: req.body.unit,
            favorite: req.body.favorite,
            date: new Date()}, (err, newItem)=>{
  if (err) {
    console.log('Error:' + err);
    res.redirect('/item');
  } else {
    res.redirect('/item');
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
    Item.findByIdAndUpdate(req.params.id, {item: req.body.input,
                                          calories: req.body.calories,
                                          quantity: req.body.quantity,
                                          unit: req.body.unit,
                                          favorite: req.body.favorite}, (err, UpdtItem)=>{
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
      if (err) {
        res.redirect('/limit');
      } else {
        limit = req.body.limit;
        res.redirect('/item');
      }
    });
});

app.get('/favorites', (req, res)=>{
  Item.find({favorite: true}, (err, allFavorites)=>{
    if(err){
      console.log(err);
    } else {
      res.render('favorites', {'favorites': allFavorites})
    }
  });
});

app.put('/favorites/:id', (req, res)=>{
Item.findByIdAndUpdate(req.params.id, {favorite: false}, (err)=>{
if(err){
  console.log(err);
} else {
  res.redirect('/favorites')
}
});
});
module.exports = app;
