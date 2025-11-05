// routes/products.js
const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

function getJsonFile(fileName){
  const filePath = path.join(__dirname, fileName)
  const raw = fs.readFileSync(filePath)
  const data = JSON.parse(raw)
  return data
}
router.use(express.json())

router.get('/', (req, res) => {
  let data = getJsonFile("main.json")
  res.status(200).json(data)
})

router.post('/:challenge/:question', (req, res) => {
  if (req.params.question === "q1" && req.body.answer === "Polytech Angers"){
    let data = getJsonFile("storyChallenge1Question2.json")
    return res.status(200).json({"success":true, "nextQuestion":data})
  }else if (req.params.question == "q2"){
    return res.status(200).json({"success":true})
  }

  return res.status(200).json({"success":false})

})

router.get('/challenge1', (req, res) => {
  let data = getJsonFile("storyChallenge1Question1.json")
  res.status(200).json(data)
})

module.exports = router