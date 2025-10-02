# Config Documentation

```json
{
    "title": "str", // The title of the page
    "gridSize": ["int", "int"], // The number of columns and rows in the grid
    "modules": [ ... ], // The configuration of modules (see Modules)
    "story": [ ... ] // The initial story script (see documentation/public_api/story.md)
}
```

## Modules

The module object is an array of modules configuration. The module are added in back to front order (the first module of the array will be placed behind the last module)

```json
{
    "type": "str", // The type of the module (see Modules Types)
    "id": "str", // A unique identifier for the module
    "position": ["int", "int"], // The position of the top left part of the module in the grid in the range [0:gridSize[
    "size": ["int", "int"], // The number of columns and rows the module spans over
    "data": { ... } // Optional, the starting data of the module (see Modules Types)
}
```

### Modules Types

#### Map

type: `map`

data:
```json
{
    "latitude":"float", // Latitude of the center of the map
    "longitude":"float", // Longitude of the center of the map
    "zoom":"int", // Default zoom value
    "max_zoom":"int", // The maxed value the user can get zoom
    "dragable":"bool", // Optional, if you want to be able to move on the map
    "mouse_pointer":{
        "mouse_marker":"bool", // if an icon spawn where you click (take the custom icon 'mouse_icon' if it exists)
        "mouse_circle":"bool", // if a circle spawn around where you click
        "mouse_radius":"int" // Optional, radius of the circle, meter (default: 5m)
    },
    "custom_icons":["custom_icon",...], // Optional, icons if you don't want to use the default one
    "matkers":["marker",...], // Optional, markers to put on the map
    "circle_markers":["circle_marker",...], // Optional, markers in form of a dot
    "polygons":["polygon",...], // Optional, draw a polygon on the map
    "circles":["circle",...], // Optional, draw a circle on the map
}
```