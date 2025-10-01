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
                size: [5, 5],
                data: {
                    latitude: 47.47911839457999,
                    longitude: -0.5872555540154729,
                    zoom: 18
                }
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
        ],
        story: [
            {
                moduleId: "map1",
                msg: "add_custom_icon",
                payload: {
                    "name": "frightfur",
                    "iconUrl": "img/frightfur.jpg",
                    "iconSize": [38, 38],
                    "iconAnchor": [19, 38],
                    "popupAnchor": [0, -38]
                }
            },
            {
                moduleId: "map1",
                delay: 1000,
                msg: "add_marker",
                payload: {
                    "icon": "frightfur",
                    "latitude": 47.47901916504906,
                    "longitude": -0.5872019529342651,
                    "popup_text": "Message de base"
                }
            },
            {
                moduleId: "map1",
                delay: 5000,
                msg: "add_marker",
                payload: {
                    "icon": "default",
                    "latitude": 47.47943149670439,
                    "longitude": -0.5875704044184071
                }
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