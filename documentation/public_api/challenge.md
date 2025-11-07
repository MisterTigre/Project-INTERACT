# Challenge object

````json
{
    "title": "str", // Ttitle of the challenge
    "difficulty": "str", // Difficulty of the challenge
    "color": "str", // Otional, color on css color of the difficulty, Recommendation: easy=>lime, medium=>yellow, hard=>orange, extreme=>red, initiation=>grey Default=>grey
    "points": "int", // Value of the challenge
    "image":{
        "available": "str", // Image when you can do the challenge
        "completed": "str", // Optional, image when completed (filter green if not specified)
        "locked": "str" // Optional, image when locked (filter grey/black if not specified)
    },
    "status": "str", // Actual status of the challenge (available, completed, locked)
    "url": "str", // Optianal, URL where the challenge redirects (dont specified if the challenge is locked)
    "releaseDate": "str" // Optional, date for the timer (ex: "Nov 7, 2025 10:48")
}
```