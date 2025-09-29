# Ideas

## Interfaces
- Avatar
- Carte du monde
- Messagerie
- Effet machine à écrire
- Lecture d'audio / Vidéo
- Calendrier

## Réponses
- Messagerie
- Clic sur une carte
- Ajouter un event au calendrier


## Structure
- Grille 3x3 ou 5x5 ou 5x3 ou custom peu importe
    - Sur laquelle on place des modules
    - Les modules peuvent prendre plusieurs colonnes ou lignes
    - Sur téléphone, il peut y avoir un autre layout
    - Il est possible de superposer plusieurs modules
        - Ex: on peut mettre une map en fond et un module par dessus en haut a gauche
        - Les modules s'affichent dans l'ordre de la liste
- Modules flottants (ex: Popup messagerie)

## Données
- JSON qui contient les positions/configs des modules

## Exemple de JSON
```json
{
    "gridSize": [4, 5],
    "modules": [
        {
            "type": "Messages",
            "position": [0, 0],
            "size": [2, 3],
            "id": "abcdef"
        }
    ]
}
```
