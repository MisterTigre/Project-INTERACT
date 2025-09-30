class Map {
    #id
    #json
    #popup
    #custom_icons
    #map

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
            this.desactivate_movement()
        }

        this.create_custom_icons(this.#json.custom_icons)
        this.create_markers(this.#json.markers)
        this.create_circle_markers(this.#json.circle_markers)
        this.create_polygons(this.#json.polygons)
        this.create_circles(this.#json.circles)

        this.popup = L.popup()
        if (this.#json.clickable){
            this.#map.on('click', this.onMapClick.bind(this))
        }
    }

    // Create the base map
    #create_base_map(){
        this.#map = L.map('map').setView([this.#json.latitude, this.#json.longitude], this.#json.zoom)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: this.#json.max_zoom,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.#map)
    }

    // Desactive all movements if you want it
    desactivate_movement(){
        this.#map.removeControl(this.#map.zoomControl)
        this.#map.dragging.disable()
        this.#map.touchZoom.disable()
        this.#map.doubleClickZoom.disable()
        this.#map.scrollWheelZoom.disable()
        this.#map.boxZoom.disable()
        this.#map.keyboard.disable()
    }


    // create custom icons
    create_custom_icons(icons){
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
    create_markers(markers){
        markers.forEach(m => {
            var icon = L.Icon.Default.prototype
            if (m.icon in this.#custom_icons){
                icon = this.#custom_icons[m.icon]
            }else if (m.icon != "default"){
                console.error(`The icon "${m.icon}" has not been declared`)
            }
            var new_marker = L.marker([m.latitude, m.longitude], {icon: icon}).addTo(this.#map)
            if (m.popup_text != ""){
                new_marker.bindPopup(m.popup_text)
            }
        })
    }

    // Add circle's markers to the map
    create_circle_markers(circle_markers){
        circle_markers.forEach(cm => {
            var new_circle_marker = L.circleMarker(cm.center, cm.style).addTo(this.#map)

            if (cm.popup_text != ""){
                new_circle_marker.bindPopup(cm.popup_text)
            }
        })
    }

    // Add polygons to the map
    create_polygons(polygons){
        polygons.forEach(p => {
            var new_polygon = L.polygon(p.points, p.style).addTo(this.#map)

            if (p.popup_text != "") {
                new_polygon.bindPopup(p.popup_text)
            }

            if (p.hover_view){
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
        })
    }


    // Add cicrcles to the map
    create_circles(circles){
        circles.forEach(c => {
            var new_circle = L.circle(c.center,c.style).addTo(this.#map)

            if (c.popup_text != "") {
                new_circle.bindPopup(c.popup_text)
            }

            if (c.hover_view){
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

    onMapClick(e) {
        this.popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(this.#map)
    }
}


async function test(){
    const response = await fetch('map.json')
    const json = await response.json()
    const data = undefined
    let mymap = new Map(1234, data)
}

test()