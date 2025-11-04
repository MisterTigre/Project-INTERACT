class MapModule {
    #id
    #json
    #popup
    #customIcons
    #map
    #wanted_item
    #mouseMarker
    #mouseCircle
    #validate_btn
    #callback
    #listening_to_item_click
    #listening_to_map_click
    #format

    constructor(id, data, callback) {

        if (typeof data !== "object") {
            data = {}
        }

        this.#id = id
        this.#callback = callback
        this.#json = data
        this.#customIcons = {}
        this.#popup

        this.#put_default()

        this.#create_base_map()

        if (this.#json.dragable != true) {
            this.#desactivate_movement()
        }

        this.#create_custom_icons(this.#json.customIcons)
        this.#create_markers(this.#json.markers)
        this.#create_circle_markers(this.#json.circleMarkers)
        this.#create_polygons(this.#json.polygons)
        this.#create_circles(this.#json.circles)

        this.#popup = L.popup()
        this.#map.on('click', this.#onMapClick.bind(this))

        this.#listening_to_item_click = false
        this.#listening_to_map_click = false
    }

    // Create the base map
    #create_base_map() {
        this.#map = L.map(this.#id).setView([this.#json.latitude, this.#json.longitude], this.#json.zoom)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: this.#json.maxZoom,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.#map)
    }

    // Desactive all movements if you want it
    #desactivate_movement() {
        this.#map.removeControl(this.#map.zoomControl)
        this.#map.dragging.disable()
        this.#map.touchZoom.disable()
        this.#map.doubleClickZoom.disable()
        this.#map.scrollWheelZoom.disable()
        this.#map.boxZoom.disable()
        this.#map.keyboard.disable()
    }


    // create custom icons
    #create_custom_icons(icons) {
        icons.forEach(ci => {
            this.#customIcons[ci.name] = L.icon({
                iconUrl: ci.iconUrl,
                iconSize: ci.iconSize,
                iconAnchor: ci.iconAnchor,
                popupAnchor: ci.popupAnchor
            })
        })
    }

    // Add markers to the map
    #create_markers(markers) {
        markers.forEach(m => {
            var addon = {}
            if ("icon" in m) {
                if (m.icon in this.#customIcons) {
                    addon['icon'] = this.#customIcons[m.icon]
                } else if (m.icon != "default") {
                    console.error(`The icon "${m.icon}" has not been declared`)
                }
            }
            if ('name' in m) {
                addon['name'] = m.name
            }

            var new_marker = L.marker([m.latitude, m.longitude], addon).addTo(this.#map)
            if ("popup_text" in m) {
                new_marker.bindPopup(m.popup_text)
            }

            new_marker.on('click', this.#onItemClick.bind(this))
        })
    }

    // Add circle's markers to the map
    #create_circle_markers(circleMarkers) {
        circleMarkers.forEach(cm => {
            if ('name' in cm) {
                cm.style['name'] = cm.name
            }
            var new_circle_marker = L.circleMarker(cm.center, cm.style).addTo(this.#map)

            if ("popup_text" in cm) {
                new_circle_marker.bindPopup(cm.popup_text)
            }

            new_circle_marker.on('click', this.#onItemClick.bind(this))
        })
    }

    // Add polygons to the map
    #create_polygons(polygons) {
        polygons.forEach(p => {
            if ('name' in p) {
                p.style['name'] = p.name
            }
            var new_polygon = L.polygon(p.points, p.style).addTo(this.#map)

            if ("popup_text" in p) {
                new_polygon.bindPopup(p.popup_text)
            }

            if ("hover_view" in p && p.hover_view) {
                new_polygon.setStyle({ opacity: 0, fillOpacity: 0 })

                if (!("opacity" in p.style)) {
                    p.style.opacity = 1
                } if (!("fillOpacity" in p.style)) {
                    p.style.fillOpacity = 0.5
                }

                new_polygon.on('mouseover', function () {
                    this.setStyle({ opacity: p.style.opacity, fillOpacity: p.style.fillOpacity })
                })

                new_polygon.on('mouseout', function () {
                    this.setStyle({ opacity: 0, fillOpacity: 0 })
                    this.closePopup()
                })
            }

            new_polygon.on('click', this.#onItemClick.bind(this))
        })
    }


    // Add cicrcles to the map
    #create_circles(circles) {
        circles.forEach(c => {
            c.style["radius"] = c.radius
            if ('name' in c){

                c.style['name'] = c.name
            }
            var new_circle = L.circle(c.center, c.style).addTo(this.#map)

            if ("popup_text" in c) {
                new_circle.bindPopup(c.popup_text)
            }

            if ("hover_view" in c && c.hover_view) {
                new_circle.setStyle({ opacity: 0, fillOpacity: 0 })

                if (!("opacity" in c.style)) {
                    c.style.opacity = 1
                } if (!("fillOpacity" in c.style)) {
                    c.style.fillOpacity = 0.5
                }

                new_circle.on('mouseover', function () {
                    this.setStyle({ opacity: c.style.opacity, fillOpacity: c.style.fillOpacity })
                })

                new_circle.on('mouseout', function () {
                    this.setStyle({ opacity: 0, fillOpacity: 0 })
                    this.closePopup()
                })
            }

            new_circle.on('click', this.#onItemClick.bind(this))
        })
    }

    #put_default() {
        const def = {
            "latitude": 47.46653288719405,
            "longitude": -0.5565456868413388,
            "zoom": 12,
            "maxZoom": 20,
            "dragable": true,
            "buttonPosition": "botomright",
            "customIcons": [],
            "markers": [],
            "circleMarkers": [],
            "polygons": [],
            "circles": []
        }
        for (const key in def) {
            if (!(key in this.#json)) {
                this.#json[key] = def[key]
            }
        }
    }
    
    #remove_mouse_item(type){
        if (this.#mouseMarker !== undefined && (type === "mouse" || type === "all")){
            this.#map.removeLayer(this.#mouseMarker)
        }
        if (this.#mouseCircle !== undefined && (type === "mouse" || type === "all")){
            this.#map.removeLayer(this.#mouseCircle)
        }
        if (this.#validate_btn !== undefined && (type === "btn" || type === "all")){
            this.#map.removeControl(this.#validate_btn)
            this.#validate_btn = undefined 
        }
    }

    get_id() {
        return this.#id
    }


    #onMapClick(e) {
        // Use 0 in the callback if you click on the map but requested an item
        if (this.#listening_to_item_click){
            this.#callback({choice: 0})
            this.#listening_to_item_click = false
        }
        
        // Only change the marker/circle of the mouse if a callback has been send
        if (this.#listening_to_map_click){
            this.#add_mousePointer(e)   
        }
    }
        

    #onItemClick(e) {
        // Use the name of the item if you click on an item and want an item
        if (this.#listening_to_item_click) {
            this.#callback({choice: +(e.target.options.name === this.#wanted_item)})
            this.#listening_to_item_click = false
        }
        // Use mouse'coords if you click on an item and want coords
        if (this.#listening_to_map_click) {
            this.#add_mousePointer(e)
        }
    }

    #add_mousePointer(e){
        var addon = {}
        if ("mouse_icon" in this.#customIcons){
            addon["icon"] = this.#customIcons["mouse_icon"]
        }
        this.#remove_mouse_item("mouse")
        if (this.#validate_btn === undefined){
            // Création d'un contrôle personnalisé
            this.#validate_btn = L.control({position: this.#json.buttonPosition})

            this.#validate_btn.onAdd = (map) =>{
                var div = L.DomUtil.create('div', '')
                
                let button = L.DomUtil.create('a', 'validate-btn', div)
                button.innerHTML = 'Validate'
                button.title = 'Validate'
                button.href = '#'

                L.DomEvent.disableClickPropagation(div)

                button.onclick = (e) =>{
                    let coords
                    if (this.#mouseMarker){
                        coords = this.#mouseMarker.getLatLng()
                    }else if (this.#mouseCircle){
                        coords = this.#mouseCircle.getLatLng()
                    }

                    // Use mouse'coords if you click on the map and want coords
                    if (this.#listening_to_map_click){
                        if (this.#format == "coords"){
                            this.#callback({"answer": coords})
                        }else{
                            let url = `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
                            fetch(url).then(async response => {
                                let ret = (await response.json())["address"][this.#format]
                                this.#callback({"answer" : ret})
                            })

                    } 
                    this.#listening_to_map_click = false
                    }
                    this.#remove_mouse_item("btn")
                }
                return div
            }
            // Ajout du contrôle à la carte
            this.#validate_btn.addTo(this.#map)
        }
        if ("mouseMarker" in this.#json.mousePointer && this.#json.mousePointer.mouseMarker){
            this.#mouseMarker = L.marker(e.latlng, addon)
            this.#mouseMarker.addTo(this.#map)
        }
        if ("mouseMarker" in this.#json.mousePointer && this.#json.mousePointer.mouseCircle){
            this.#mouseCircle = L.circle(e.latlng,this.#json.mousePointer.mouse_radius)
            this.#mouseCircle.addTo(this.#map)
        }
    }


    notify(msg, payload) {
        switch (msg) {
            case "addCustomIcon":
                this.#create_custom_icons([payload])
                this.#callback()
                break
            case "addMarker":
                this.#create_markers([payload])
                this.#callback()
                break
            case "addCircleMarker":
                this.#create_circle_markers([payload])
                this.#callback()
                break
            case "addPolygon":
                this.#create_polygons([payload])
                this.#callback()
                break
            case "addCircle":
                this.#create_circles([payload])
                this.#callback()
                break
            case "mapAnswer":
                this.#json["mousePointer"] = payload.mousePointer
                this.#listening_to_map_click = true
                this.#remove_mouse_item("all")
                if ("format" in payload){
                    this.#format = payload.format
                }else {
                    this.#format = "coords"
                }
                break
            case "itemChoice":
                this.#wanted_item = payload.wantedItem
                this.#listening_to_item_click = true
                break

            case "goTo":
                this.#map.flyTo(payload.coords, payload.zoom)
                this.#callback()
                break
            case "remove":
                this.#map.eachLayer(function (layer) {
                    if ("name" in layer.options && layer.options.name === payload.name) {
                        this.#map.removeLayer(layer)
                    }
                }.bind(this))
                this.#callback()
                break
            default:
                console.error("Unknown message : " + msg)
                return
        }
    }
}
