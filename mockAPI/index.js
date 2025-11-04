const express = require('express')
const app = express()
const port = 5000
app.use(express.json())
const parcours1Route = require('./parcours/parcours1/routes')



app.use("/parcours1", parcours1Route)






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/', (req,res) => {
    res.status(200).json({state: req.body.state})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
