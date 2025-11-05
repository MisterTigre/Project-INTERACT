class ChallengeArray {
    #data
    #id



    constructor(id, data, callback) { 
        this.#id =id
        this.#data = data
        this.#countDownDate()
        setInterval(() => this.#countDownDate(), 1000)
    }


    notify(msg, payload) { }

    #countDownDate() {
        var now = new Date().getTime()

        for (const [index, challenge] of this.#data.challenges.entries()) {
            if (!challenge.releaseDate){
                continue
            }

            var element = document.getElementsByClassName("releaseDate " + index)[0]

            var releaseDate = new Date(challenge.releaseDate).getTime()
            var distance = releaseDate - now

            if (distance < 0) {
                element.innerHTML = "Recharger la page"
                continue
            }

            var days = Math.floor(distance / (1000 * 60 * 60 * 24))
            if (days >= 1){
                element.innerHTML = challenge.releaseDate
                continue
            }

            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            var seconds = Math.floor((distance % (1000 * 60)) / 1000)


            element.innerHTML = hours + "h "+ minutes + "m " + seconds + "s "

        }

    }
}
