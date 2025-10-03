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
    { // Or the end of the story
        "type": "end"
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
Waits a click on the map.

**Payload**
```json
{
    "mouse_pointer":{
        "mouse_marker":"bool", // if an icon spawns where you click (take the custom icon 'mouse_icon' if it exists)
        "mouse_circle":"bool", // if a circle spawns around where you click
        "mouse_radius":"int" // Optional if 'mouse_circle' is false, radius of the circle, meter
    },
}
```

#### - `authorize_item_click`
Waits a click on an item.

**Payload**
```json
{
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

### Chat

Here are the different messages supported by the Chat module.

#### - `addDiscussion`
Adds a discussion to the chat. It appears in the message feed and can be opened to chat with "people".

**Payload**
```json
"id" : "str" // Id of the discussion, unique to each
"name" : "str" // Name that will appear in the message feed and at the top of the chat page
"icon":"str" // Link to the icon source
```

#### - `addContact`
Adds a contact to the Chat. There is no display for contacts. It is used when receiving messages to show the name and icon with the message.

**Payload**
```json
"id": "str" // Id of the contact, unique to each
"name": "str"
"icon": "str" // Link to the icon source
```

#### - `send`
Sends a message from a contact in a discussion.

**Payload**
```json
"id": "str" // Id of the contact, unique to each
"name": "str" // Name to be displayed
"icon": "str" // Link to the icon source
```

#### - `answer`
Allows the user to answer in a discussion.

**Payload**
```json
"discussionId": "str" // Id of the discussion where the user can answer
```

#### - `choice`
Allows the user to choose between answers in a discussion.

**Payload**
```json
"discussionId": "str" // Id of the discussion where the user can choose
"choices":["str"] // List of possible answers
```
