import express from 'express'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const app = express() 
const port = 5000

const __dirname = import.meta.dirname;

app.use(express.json())

function readJson(filePath){
  filePath = join(__dirname, filePath)
  const raw = readFileSync(filePath)
  const data = JSON.parse(raw)
  return data
}

function readChallenge(filePath){
  filePath = join("parcours", filePath + ".json")
  return readJson(filePath)
}

function findNextFileName(filename) {
  const match = filename.match(/^(.*?)(\d*)$/)

  if (!match) throw new Error("Nom de fichier invalide")

  const base = match[1]
  const number = match[2] ? parseInt(match[2]) : 1

  return `${base}${number + 1}`
}

app.get(/^\/(.*)$/, (req, res) => {
  const filePath = req.params[0] === "" ? "example" : req.params[0]
  const json = readChallenge(filePath)
  res.status(200).json(json)
})

app.post(/^\/(.*)$/, (req, res) => {
  const filePath = req.params[0] === "" ? "example" : req.params[0]
  const answer = req.body.answer
  const answers = readJson("answers.json")

  if (answers[filePath] == answer) {
    let nextQuestion

    const parentPath = filePath.split("/").slice(0, -1).join("/")
    const fileName = filePath.split("/").slice(-1)[0]
    const nextFileName = findNextFileName(fileName)
    const nextFilePath = join(parentPath, nextFileName)

    if (existsSync(join(__dirname, "parcours", nextFilePath + ".json"))) {
      nextQuestion = readChallenge(nextFilePath)
    }
    return res.status(200).json({"success": true, nextQuestion})
  }

  return res.status(200).json({"success": false})
})

app.listen(port, () => {
  console.log(`Osint4Fun Mock listening on port ${port}`)
})
