class Map {
    #id
    #json
    #popup
    #custom_icons
    #map
    #orchest_map_callback
    #orchest_item_callback
    #wanted_item


    constructor(id, data){

        if (typeof data !== "object"){
            data = {}
        }

        this.#id = id
        this.#json = data
        this.#custom_icons = {}
        this.#popup

        this.#put_default()

        this.#create_base_map()

        if (this.#json.dragable != true){
            this.#desactivate_movement()
        }

        this.#create_custom_icons(this.#json.custom_icons)
        this.#create_markers(this.#json.markers)
        this.#create_circle_markers(this.#json.circle_markers)
        this.#create_polygons(this.#json.polygons)
        this.#create_circles(this.#json.circles)

        this.#popup = L.popup()
        this.#map.on('click', this.#onMapClick.bind(this))
    }

    // Create the base map
    #create_base_map(){
        this.#map = L.map(this.#id).setView([this.#json.latitude, this.#json.longitude], this.#json.zoom)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: this.#json.max_zoom,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.#map)
    }

    // Desactive all movements if you want it
    #desactivate_movement(){
        this.#map.removeControl(this.#map.zoomControl)
        this.#map.dragging.disable()
        this.#map.touchZoom.disable()
        this.#map.doubleClickZoom.disable()
        this.#map.scrollWheelZoom.disable()
        this.#map.boxZoom.disable()
        this.#map.keyboard.disable()
    }


    // create custom icons
    #create_custom_icons(icons){
        icons.forEach(ci => {
            this.#custom_icons[ci.name] = L.icon({
                iconUrl: ci.iconUrl,  
                iconSize: ci.iconSize,              
                iconAnchor: ci.iconAnchor,            
                popupAnchor: ci.popupAnchor           
            })
        })
    }

    // Add markers to the map
    #create_markers(markers){
        markers.forEach(m => {
            var addon = {}
            if ("icon" in m){
                if (m.icon in this.#custom_icons){
                    addon['icon'] = this.#custom_icons[m.icon]
                }else if (m.icon != "default"){
                    console.error(`The icon "${m.icon}" has not been declared`)
                }
            }
            if ('name' in m){
                addon['name'] = m.name
            }
            
            var new_marker = L.marker([m.latitude, m.longitude], addon).addTo(this.#map)
            if ("popup_text" in m){
                new_marker.bindPopup(m.popup_text)
            }

            new_marker.on('click', this.#onItemClick.bind(this))
        })
    }

    // Add circle's markers to the map
    #create_circle_markers(circle_markers){
        circle_markers.forEach(cm => {
            if ('name' in cm){
                cm.style['name'] = cm.name
            }
            var new_circle_marker = L.circleMarker(cm.center, cm.style).addTo(this.#map)

            if ("popup_text" in cm){
                new_circle_marker.bindPopup(cm.popup_text)
            }

            new_circle_marker.on('click', this.#onItemClick.bind(this))
        })
    }

    // Add polygons to the map
    #create_polygons(polygons){
        polygons.forEach(p => {
            if ('name' in p){
                p.style['name'] = p.name
            }
            var new_polygon = L.polygon(p.points, p.style).addTo(this.#map)

            if ("popup_text" in p) {
                new_polygon.bindPopup(p.popup_text)
            }

            if ("hover_view" in p && p.hover_view){
                new_polygon.setStyle({ opacity: 0, fillOpacity: 0 })

                if (!("opacity" in p.style)){
                    p.style.opacity = 1
                }if (!("fillOpacity" in p.style)){
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
    #create_circles(circles){
        circles.forEach(c => {
            if ('name' in c){
                c.style['name'] = c.name
            }
            var new_circle = L.circle(c.center,c.style).addTo(this.#map)

            if ("popup_text" in c) {
                new_circle.bindPopup(c.popup_text)
            }

            if ("hover_view" in c && c.hover_view){
                new_circle.setStyle({ opacity: 0, fillOpacity: 0 })

                if (!("opacity" in c.style)){
                    c.style.opacity = 1
                }if (!("fillOpacity" in c.style)){
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

    #put_default(){
        const def = {
            "latitude":47.46653288719405,
            "longitude":-0.5565456868413388,
            "zoom":12,
            "max_zoom":20,
            "dragable":true,
            "clickable":false,
            "custom_icons":[],
            "markers":[],
            "circle_markers":[],
            "polygons":[],
            "circles":[]
        }
        for(const key in def){
            if (!(key in this.#json)){
                this.#json[key] = def[key]
            }
        }
    }

    get_id(){
        return this.#id
    }
    

    #onMapClick(e) {
        // Use mouse'coords if you click on the map and want coords
        if (this.#orchest_map_callback){
            this.#orchest_map_callback(e.latlng)
            this.#orchest_map_callback = null
        }
        // Use "" in the callback if uou click on the map and want an item
        if (this.#orchest_item_callback){
            this.#orchest_item_callback(0)
            this.#orchest_item_callback = null
        }
    }

    #onItemClick(e){
        // Use the name of the item if you click on an item and want an item
        if (this.#orchest_item_callback){
            this.#orchest_item_callback(+(e.target.options.name === this.#wanted_item))
            this.#orchest_item_callback = null
        }
        // Use mouse'coords if you click on an item and want coords
        if (this.#orchest_map_callback){
            this.#orchest_map_callback(this.#map.mouseEventToLatLng(e.originalEvent))
            this.#orchest_map_callback = null
        }
    }


    notify(msg, payload) {
        switch (msg) {
            case "add_custom_icon":
                this.#create_custom_icons([payload])
                break
            case "add_marker":
                this.#create_markers([payload])
                break
            case "add_circle_marker":
                this.#create_circle_markers([payload])
                break
            case "add_polygon":
                this.#create_polygons([payload])
                break
            case "add_circle":
                this.#create_circles([payload])
                break
            case "authorize_map_click":
                this.#orchest_map_callback = payload
                break
            case "authorize_item_click":
                this.#orchest_item_callback = payload.callback
                this.#wanted_item = payload.wanted_item
                break
            default:
                console.error("Unknown message : " + msg)
                return
        }
    }
}
