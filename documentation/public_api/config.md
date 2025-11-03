# Config Documentation

```json
{
    "title": "str", // The title of the page
    "gridSize": ["int", "int"], // The number of columns and rows in the grid. This is optional if both columnWidths and rowHeights are set
    "columnWidths": ["str", ...], // The size of each column, can be any valid css size (ex: "50%", "10px", "1fr", ...)
    "rowHeights": ["str", ...], // The size of each row, can be any valid css size (ex: "50%", "10px", "1fr", ...)
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
    "maxZoom":"int", // The maxed value the user can zoom in
    "dragable":"bool", // Optional, if you want to be able to move on the map
    "customIcons":["custom_icon",...], // Optional, icons if you don't want to use the default one
    "matkers":["marker",...], // Optional, markers to put on the map
    "circleMarkers":["circle_marker",...], // Optional, markers in form of a dot
    "polygons":["polygon",...], // Optional, draws a polygon on the map
    "circles":["circle",...], // Optional, draws a circle on the map
}
```

#### Calendar

type: `calendar`

data:
```json
{
    "size":"little" | "big", // The size of the calendar (big has a more detailed module to add a periode)
    "startDay":"2025-10-03" // Select the base day of the calendar
}
```
#### Chat

type: `chat`

data:
There is no data.

