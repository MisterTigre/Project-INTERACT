// routes/products.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

function getJsonFile(fileName){
  const filePath = path.join(__dirname, fileName)
  const raw = fs.readFileSync(filePath)
  const data = JSON.parse(raw)
  return data
}

router.get('/', (req, res) => {
  let data = getJsonFile("storyChallenge1.json")
  res.status(200).json(data)
})

router.get('/challenge1', (req, res) => {
  let data = getJsonFile("storyChallenge1.json")
  res.status(200).json(data)
});

router.post('/challenge1', (req, res) => {
  if (req.body.anwser !== "Polytech Angers"){
    return res.status(200).json({"succes":false})
  }
  let data = getJsonFile("storyChallenge2.json")
  res.status(200).json({"succes":true, "challenge":data})
});



module.exports = router;