//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-minh:Minh2001.@cluster0.oin8wqn.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Do homework"
});

const item2 = new Item({
  name: "Go buy grocery"
});

const item3 = new Item({
  name: "Clean the house"
});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res) {

  Item.find({}, function(err, items){
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0) {
        Item.insertMany([item1,item2,item3], function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("Succesfully added new item");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: items});
      }
    }
  });

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const list = req.body.list;

  const newItem = new Item({
    name: item
  });

  if (list === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name:list}, function(err, result){
      result.items.push(newItem);
      result.save();
      console.log(result);
      res.redirect("/"+list);
    });

  }

});

app.post("/delete", function(req, res){
  const itemID = req.body.checkbox;
  const list = req.body.listName;
  if (list === "Today") {
    Item.findByIdAndRemove(itemID, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("An item has been removed");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:list},{$pull:{items:{_id:itemID}}},function(err, result){
      if(!err){
        res.redirect("/"+list);
      }
    });
  }

});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("list", listSchema);

app.get("/:title", function(req, res){
  const custom = _.capitalize(req.params.title);
  List.findOne({name:custom}, function(err, result){
    if (!result) {
      //console.log("Does not exist");
      const list = new List({
        name:custom,
        items: [item1,item2,item3]
      });
      list.save();
      res.redirect("/"+custom);
    } else {
      res.render("list", {listTitle: result.name, newListItems: result.items});
    }
  });
});
;

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
