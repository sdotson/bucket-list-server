'use strict';

const express = require('express'),
  mongoose = require('mongoose'),
  app = express();

/*
http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api

Just an API to hit for bucket list app

Categories
POST categories -> new category
DELETE categories/:id -> delete category
PUT categories/:id -> update category
GET categories -> get all categories as an array

Users
GET users -> List all users
GET users/:id -> Get user
POST users/:id -> Update user
POST users -> Create new users
DELETE users/:id -> Delete users

Bucket List Items
GET users/:id/items -> get all items for user with optional query strings
  - category
  - done status
POST users/:id/items -> add new item

GET users/:id/items/:item_id -> get item data
PUT users/:id/items/:item_id -> update item data
DELETE users/:id/items/:item_id -> delete item data

*/

/*

Data structures

Category = {
  name,
  created,
  updated
}

User = {
  username,
  email,
  created,
  updated
}

**** Below is a guess. I should figure out login system first ****
ListItem = {
  user,
  title,
  description,
  categories
}

*/

app.listen(3000);
console.log('Listening on port 3000...');
