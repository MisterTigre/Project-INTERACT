const express = require('express')
const ejs = require('ejs')

const app = express()
const port = 3000

app.use(express.static('src/public/'));

app.get('/', async (req, res) => {
    // TODO: Fetch config file from Osint4Fun

    config = {
        title: "Main page",
        gridSize: [7, 7],
        modules: [
            {
                type: "map",
                id: "map1",
                position: [1, 1],
                size: [5, 5]
            },
            {
                type: "test",
                id: "test1",
                position: [0, 0],
                size: [1, 1]
            },
            {
                type: "test",
                id: "test2",
                position: [1, 0],
                size: [1, 2]
            }
        ]
    }

    let modules_html = ""
    for (module of config.modules)
    {
        const x = module.position[0]
        const y = module.position[1]

        const w = module.size[0]
        const h = module.size[1]

        console.log(x, y, w, h)
        console.log(`style="grid-column: ${x+1} / ${x+w+1}; grid-row: ${y+1} / ${y+h+1};"`)

        const module_html = await ejs.renderFile(`src/modules/${module.type}/${module.type}.ejs`)
        modules_html += await ejs.renderFile("src/modules/module_container.ejs", {
            module: module_html,
            id: module.id,
            style: `grid-column: ${x+1} / ${x+w+1}; grid-row: ${y+1} / ${y+h+1};`
        })
    }

    const html = await ejs.renderFile("src/routes/home.ejs", {
        modules: modules_html,
        title: config.title,
        gridWidth: config.gridSize[0],
        gridHeight: config.gridSize[1],
        config: config
    })

    res.send(html)
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})