import express from 'express'
import { renderFile } from 'ejs'
import { jsonToGridCSS } from "./public/js/utils.js"

const app = express()
const port = 3000

app.use(express.json())
app.use(express.static('src/public/'))
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'))
app.use('/bootstrap-icons', express.static('node_modules/bootstrap-icons/font'))


async function renderChallenge(req, res) {
    const config = await fetch(`http://localhost:5000/${req.params[0]}`).then(ret => ret.json())

    config = checkSupport(req.headers["user-agent"] ?? "", config)

    let modules_html = ""
    let z = 0
    for (const module of config.modules) {
        const x = module.position[0]
        const y = module.position[1]

        const w = module.size[0]
        const h = module.size[1]

        const module_html = await renderFile(`src/modules/${module.type}/${module.type}.ejs`, { data: module.data })
        modules_html += await renderFile("src/modules/moduleContainer.ejs", {
            module: module_html,
            id: module.id,
            style: `grid-column: ${x + 1} / ${x + w + 1}; grid-row: ${y + 1} / ${y + h + 1}; z-index: ${z * 100}`
        })
        z++
    }

    const html = await renderFile("src/routes/home.ejs", {
        modules: modules_html,
        title: config.title,
        style: jsonToGridCSS(config),
        config: config
    })

    res.send(html)
} 

function checkSupport(userAgent, data){
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
  if (!isMobile) {return data}
  for (const module of data.modules){
    if (module.type == "challengeBook"){
        module.type = "challengeArray"
        module.data.challenges = []
        for (const page of module.data.pages){
            if (page.challenges){
                module.data.challenges = [...module.data.challenges, ...page.challenges]
            }
        }
        delete module.data.pages
    }
  }
  return data
}


app.get(/^\/(.*)$/, renderChallenge)

app.post("/verify", (req, res) => {
    fetch(`http://localhost:5000/${req.body.url}`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({"answer": req.body.answer}),
    }).then(async ret => {
        const json = await ret.json();

        if (json.success)
        {
            let z = 0
            for (let module of json.nextQuestion.modules) {
                const x = module.position[0]
                const y = module.position[1]

                const w = module.size[0]
                const h = module.size[1]

                const module_html = await renderFile(`src/modules/${module.type}/${module.type}.ejs`, { data: module.data })
                module.html = await renderFile("src/modules/moduleContainer.ejs", {
                    module: module_html,
                    id: module.id,
                    style: `grid-column: ${x + 1} / ${x + w + 1}; grid-row: ${y + 1} / ${y + h + 1}; z-index: ${z * 100}`
                })
                z++
            }
        }

        res.status(200).json(json)
    })
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
