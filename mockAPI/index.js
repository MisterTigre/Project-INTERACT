import express from 'express'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

const app = express() 
const port = 5000

const __dirname = import.meta.dirname;

app.use(express.json())

function readJson(filePath){
  const raw = readFileSync(filePath)
  const data = JSON.parse(raw)
  return data
}

function readChallenge(path){
  // Search for a question with this name
  let filePath = join(__dirname, "parcours", path + ".json")
  if (existsSync(filePath)) return readJson(filePath)

  // Search for a index.json file in the folder
  filePath = join(__dirname, "parcours", path, "index.json")
  if (existsSync(filePath)) return readJson(filePath)

  // Take the first question in the folder
  const files = readdirSync(join(__dirname, "parcours", path))
  if (files.length > 0) return readJson(join(__dirname, "parcours", path, files[0]))

  throw new Error(`Unknowd challenge ${path}`)
}

function findNextFileName(filename) {
  const match = filename.match(/^(.*?)(\d*)$/)

  if (!match) throw new Error("Nom de fichier invalide")

  const base = match[1]
  const number = match[2] ? parseInt(match[2]) : 1

  return `${base}${number + 1}`
}

app.get(/^\/(.*)$/, (req, res) => {
  const filePath = req.params[0]
  const json = readChallenge(filePath)
  res.status(200).json(json)
})

app.post(/^\/(.*)$/, (req, res) => {
  const filePath = req.params[0]
  const answer = req.body.answer
  const answers = readJson(join(__dirname, "answers.json"))

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
