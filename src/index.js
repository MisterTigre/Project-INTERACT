const express = require('express')
const ejs = require('ejs')

const app = express()
const port = 3000

app.use(express.static('src/public/'))
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'))

app.get('/', async (req, res) => {
    const challenge = req.query.challenge ?? "example"

    // TODO: Fetch config file from Osint4Fun

    config = await (await fetch(`http://localhost:3000/challenges/${challenge}.json`)).json()

    let modules_html = ""
    let z = 0
    for (module of config.modules) {
        const x = module.position[0]
        const y = module.position[1]

        const w = module.size[0]
        const h = module.size[1]

        const module_html = await ejs.renderFile(`src/modules/${module.type}/${module.type}.ejs`)
        modules_html += await ejs.renderFile("src/modules/module_container.ejs", {
            module: module_html,
            id: module.id,
            style: `grid-column: ${x + 1} / ${x + w + 1}; grid-row: ${y + 1} / ${y + h + 1}; z-index: ${z * 100}`
        })
        z++
    }

    function jsonToGridCSS(config) {
        const cols = config.columnWidths?.join(' ') || Array(config.gridSize[0]).fill('1fr').join(' ');
        const rows = config.rowHeights?.join(' ') || Array(config.gridSize[1]).fill('1fr').join(' ');
        return `
            display: grid;
            grid-template-columns: ${cols};
            grid-template-rows: ${rows};
        `;
    }

    const html = await ejs.renderFile("src/routes/home.ejs", {
        modules: modules_html,
        title: config.title,
        style: jsonToGridCSS(config),
        config: config
    })

    res.send(html)
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
