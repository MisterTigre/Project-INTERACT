# Story Documentation

The story object is an array of events and specials instructions.

```json
[
    {  // A story event (see Story Event)
        "type": "event",
        ...
    },
    { // Or a choice (see Story Choice)
        "type": "choice",
        ...
    },
    { // Or an answer (see Story Answer)
        "type": "answer",
        ...
    },
    { // Or a stop
        "type": "stop"
    },
    { // Or a goto
        "type": "goto",
        "destination": "eventId"
    },
    ...
]
```

## Story Event

```json
{

    "type": "event",
    "id": "str", // Optional, an identifier to this event (can be used with goto)
    "moduleId": "str", // The identifier of a module
    "delay": "number", // The time in miliseconds to wait before doing the action
    "msg": "str", // The message to send the module (see module messages)
    "payload": "object", // The payload of the message (see module messages)
    "choicesDestinations": ["str", ...] // Required if choice is true. A list of story event ids. The id of the event to jump to depending on the choice result
}
```

## Story Choice

```json
{
    "type": "choice",
    "id": "str", // Optional, an identifier to this event (can be used with goto)
    "moduleId": "str",
    "delay": "number",
    "msg": "str", // The message to send the module (see module messages)
    "payload": "object", // The payload of the message (see module messages)
    "choicesDestinations": ["str", ...] // A list of story event ids. The id of the event to jump to depending on the choice result
}
```

## Story Answer

```json
{
    "type": "answer",
    "id": "str", // Optional, an identifier to this event (can be used with goto)
    "moduleId": "str", // The identifier of a module
    "delay": "number", // The time in miliseconds to wait before doing the action
    "msg": "str", // The message to send the module (see module messages)
    "payload": "object", // The payload of the message (see module messages)
    "jumpOnIncorrect": "str" // The id of the event to jump to if the answer is incorrect
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
```json
{
    "callback":"callback" // callback that will be executed when the user clicks
}
```

#### - `authorize_item_click`
Waits a click on an item. The callback gets 1 `(int)` as argument if the user clicks on the right item or 0 otherwise. 

**Payload**
```json
{
    "callback":"callback", // callback that will be executed when the user clicks
    "wanted_item":"str" // Name of the item where the user must click
}
```

#### - `go_to`
Goes to the latitude and the longitude given

**Payload**
```json
{
    "coords":["float","flaot"], // Latitude and longitude of the target
    "zoom":"int" // Zoom you want
}
```


#### - `remove`
Removes an item from the map

**Payload**
```json
{
    "name":"str" // Name of the item ⚠️ you can't remove an item if you didn't give it a name
}
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
