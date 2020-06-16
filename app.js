//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-bobby:test123@cluster0-avhha.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });



const itemsSchema = new mongoose.Schema ({
    name: String
});

const listSchema ={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemsSchema);

//Creating a new Item using our itemSchema
const item1 = new Item ({
  name: "Go to costco"
});
const item2 = new Item ({
  name: "Code for 2 hours"
});
const item3 = new Item ({
  name: "Read for 1 hour"
});

const defaultItems = [item1, item2, item3];






app.get("/", function(req, res) {

Item.find({}, function(err,foundItem){

if (foundItem.length === 0) {

  Item.insertMany(defaultItems, function(err){
    if (err) {
      console.log(err);
    } else {

      console.log("Success")
    }
  });
  res.redirect("/");
} else {
res.render("list", {listTitle: "Today", newListItems: foundItem});
}

});
});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem  = new Item({
    name: itemName
  }) ;
if (listName === "Today") {

  newItem.save();
  res.redirect("/");
} else {
    List.findOne({name: listName}, function(err,foundList){
      if (err) {
        console.log(err);
      } else {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/"+listName);
      }
    })
}
});

app.post("/delete", function(req,res){

var listName = req.body.listName;

if (listName === "Today") {
  Item.findByIdAndRemove(req.body.Checkbox, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully Delete Post");
    }
  });
  res.redirect("/");
  // Item.deleteOne(re)
} else {
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: req.body.Checkbox}}}, function(err, foundlist) {
    if (!err) {
          res.redirect("/"+listName);
      }

  })


}
});

app.get("/:listTitle", function(req, res) {
      const newListName = _.capitalize(req.params.listTitle);
      List.findOne({name:newListName}, function(err, foundList) {
        if (!err) {
          if (!foundList) {
            console.log("DOesnt Exist!")
            const list = new List ({
              name: newListName,
              items: defaultItems
            });
            list.save();
            res.redirect("/"+newListName);
          } else {
              res.render("list",{listTitle: foundList.name, newListItems: foundList.items} );
          }
        }
      })
    });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
