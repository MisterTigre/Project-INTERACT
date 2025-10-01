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
    "delay": "number", // The time in miliseconds to wait before doing the action
    "msg": "str", // The message to send the module (see module messages)
    "payload": "object" // The payload of the message (see module messages)
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

#### - `close`
Closes the app window

**Parameters**  
This instruction does not have any parameters.