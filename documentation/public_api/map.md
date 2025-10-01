# Template for map's object

### Icon
```json
{
    "name": "str", // Name used to call this icon
    "iconUrl": "str", // Path to the picture  
    "iconSize": ["int", "int"], // Size of the icon              
    "iconAnchor": ["int", "int"], // Point that is the main point of the icon (ex: tip of an arrow)            
    "popupAnchor": ["int", "int"] //  Base point for the spawn of a popup message
}
```

### Marker
```json
{
    "latitude":"float", // Latitude of the marker
    "longitude":"float", // Longitude of the marker
    "icon":"str", // Optional, name of the icon if you don't use the default's one
    "popup_text":"str" // Optional, text of the popup if you want one
}
```

### Circle_marker
```json
{
    "center":["float","float"], // Latitude and longitude of the center
    "radius":"int", // center of the circle (meter)
    "style":{
        ... // Optional, the Leaflet's options => https://leafletjs.com/reference.html#circle-option
    },
    "popup_text":"str" // Optional, text of the popup if you want one
}
```

### Polygon
```json
{
    "points":[
        ["float","float"], // Latitude and longitude of each point 
        ["float","float"],
        ["float","float"],
        ...
    ],
    "style":{
        ... // Optional, the Leaflet's options => https://leafletjs.com/reference.html#circle-option
    },
    "popup_text":"str", // Optional, text of the popup if you want one
    "hover_view":"bool", // Optional, only see the polygon if you have your mouse over it
    "name":"str" // Optional, name of the polygon
}

```

### Circle
```json
{
    "center":["float","float"], // Latitude and longitude of the center
    "radius":"int", // center of the circle (meter)
    "style":{
        ... // Optional, the Leaflet's options => https://leafletjs.com/reference.html#circle-option
    },
    "popup_text":"str", // Optional, text of the popup if you want one
    "hover_view":"bool", // Optional, only see the circle if you have your mouse over it
    "name":"str" // Optional, name of the circle
}
```