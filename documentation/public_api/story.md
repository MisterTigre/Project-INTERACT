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
    ["goto", ...] // Or a special instruction (see Special Instructions)
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

#### - `add_marker`
Adds a marker to the map.

**Payload**
```json
{
    TODO
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

#### - `end`
Stops the story, without closing the window

**Parameters**  
This instruction does not have any parameters.

#### - `close`
Closes the app window

**Parameters**  
This instruction does not have any parameters.