# API Osint4fun

## Précisions

Nous avons tenté de suivre l'API actuelle d'Osint4Fun, donc si cela vous arrange, vous pouvez peut être utiliser la même

### Vocabulaire utilisé
- Parcours: Un groupe de challenges (ex: Gnosint Return, Journey with Clara)
- Challenge: Équivalent d'une page d'Osint4Fun (ex: Gnosint Return: Étape1, Journey with Clara: La compagne de voyage, Phénomènes naturels)
- Question: L'une des question d'un challenge (ex: Gnosint Return: Étape1 a deux questions, Journey with Clara: La compagne de voyage a une question, Phénomènes naturels a 9 questions)

## Routes

2 routes par challenge, les deux routes peuvent être différentes

### GET

Pour chaque challenge, une route GET pour récupérer le challenge

Pas de payload

Réponse: le fichier JSON de la question où en est le joueur
ex: La première fois que l'on ouvre le challenge, on reçoit la question 1, si il valide la question 1, puis qu'il quitte et revient, il reçoit la question 2 directement

### POST

Pour chaque challenge, une route POST pour valider la réponse

Payload: la réponse
```json
{
    "answer": "str"
}
```

Réponse: Un bool pour indiquer si la réponse est valide, et si oui, le json de la question suivante
```json
{
    "success": false
}
```
ou
```json
{
    "sucess": true,
    "nextQuestion": { ... }
}
```

## Page de parcours

Notre site supporte maintenant aussi les pages de parcours qui listent les challenges, elles ont le même structure qu'un challenge, mais il n'y a pas de route POST (puisqu'il n'y a pas de réponse)
