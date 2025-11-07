class ChallengeBook {
    #data
    #id



    constructor(id, data, callback) { 
        $(".flipbook").turn()
        this.#id =id
        this.#data = data
        this.#countDownDate()
        setInterval(() => this.#countDownDate(), 1000)
    }


    notify(msg, payload) { }

    #countDownDate() {
        var now = new Date().getTime()
        for (const [indexP, page] of this.#data.pages.entries()) {
            for (const [indexC, challenge] of (page.challenges ?? []).entries()) {
                if (!challenge.releaseDate){
                    continue
                }

                var element = document.getElementsByClassName("releaseDate " + indexP + "" + indexC)[0]

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
}
