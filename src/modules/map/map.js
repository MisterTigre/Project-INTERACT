var map
var popup
var custom_icons = {}


async function createMap() {
    const response = await fetch('map.json')
    const json = await response.json()
    console.log(json)

    // Create the base map
    map = L.map('map').setView([json.latitude, json.longitude], json.zoom)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)
    popup = L.popup()

    // Desactive all movements if you want it
    if (json.dragable != true){
        map.removeControl(map.zoomControl)
        map.dragging.disable()
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.boxZoom.disable()
        map.keyboard.disable()
    }

    // create custom icons
    json.custom_icons.forEach(ci => {
        custom_icons[ci.name] = L.icon({
            iconUrl: ci.iconUrl,  
            iconSize: ci.iconSize,              
            iconAnchor: ci.iconAnchor,            
            popupAnchor: ci.popupAnchor           
        })
    })


    // Add markers to the map
    json.markers.forEach(m => {
        var icon = L.Icon.Default.prototype
        if (m.icon in custom_icons){
            icon = custom_icons[m.icon]
        }else if (m.icon != "default"){
            console.error(`The icon "${m.icon}" has not been declared`)
        }
        var new_marker = L.marker([m.latitude, m.longitude], {icon: icon}).addTo(map)
        if (m.popup_text != ""){
            new_marker.bindPopup(m.popup_text)
        }
    })


    // Add polygons to the map
    json.polygons.forEach(p => {
        var new_polygon = L.polygon(p.points, p.style).addTo(map)

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



    // Add cicrcles to the map
    json.circles.forEach(c => {
        var new_circle = L.circle(c.center,c.style).addTo(map)

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


function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map)
}


createMap()
map.on('click', onMapClick)