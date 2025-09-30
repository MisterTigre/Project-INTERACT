# Story API

```json
[
    { ... }, // A story event (see Story Event)
    ...
]
```

## Story Event

```json
{
    "id": "str", // The identifier of a module
    "msg": "str", // The message to send the module (see module messages)
    "payload": "object" // The payload of the message (see module messages)
}
```

## Module messages

### Map

Here are the different messages supported by the Map module

#### - `add_marker`
Adds a marker to the map

**Payload**
```json
{
    TODO
}
```

### Chat