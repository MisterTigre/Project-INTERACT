# Story Documentation

The story object is an array of events and specials instructions.

```json
[
    { ... }, // A story event (see Story Event)
    ["goto", ...] // Or a special instruction (see Special Instructions)
    ...
]
```

## Story Event

```json
{
    "id": "str", // Optional, an identifier to this event (can be used with goto)
    "moduleId": "str", // The identifier of a module
    "msg": "str", // The message to send the module (see module messages)
    "payload": "object" // The payload of the message (see module messages)
}
```

## Module messages

### Map

Here are the different messages supported by the Map module.

#### - `add_icon`
Adds an icon to the ones available.

**Payload**
```json
"icon" // Cf map.md
```

#### - `add_marker`
Adds a marker to the map.

**Payload**
```json
"marker" // Cf map.md
```

#### - `add_circle_marker`
Adds a circle_marker to the map.

**Payload**
```json
"circle_marker" // Cf map.md
```

#### - `add_polygon`
Adds a polygon to the map.

**Payload**
```json
"polygon" // Cf map.md
```

#### - `add_circle`
Adds a circle's form to the map.

**Payload**
```json
"circle" // Cf map.md
```

#### - `authorize_map_click`
Waits a click on the map. The callback gets the latitude and longitude (`["float","float"]`) as argument.

**Payload**
```js
"callback" // callback that will be executed when the user clicks
```

#### - `authorize_item_click`
Waits a click on an item. The callback gets 1 `(int)` as argument if the user clicks on the right item or 0 otherwise. 

**Payload**
```json
    "callback":"callback" // callback that will be executed when the user clicks
    "wanted_item":"str" // Name of the item where the user must click
```

#### TODO

### Chat

## Special Instructions

Specials instructions are used to control the flow of the story.

The syntax is the following:
```json
[ "instruction", "parameter1", "parameter2", ...]
```

### Special instruction list

#### - `goto`
Jumps to a position in the story.

**Parameters**
- eventId: `"str"`: The eventId where to go, the event will be played or replayed.

#### - `close`
Closes the app window

**Parameters**  
This instruction does not have any parameters.