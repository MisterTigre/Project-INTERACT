class ImageDisplayModule {

    constructor(id, data, callback) { 

        document.getElementById("modules").insertAdjacentHTML("beforeend",`
            <div class="${id} modal">
                <span class="close">&times;</span>
                <img class="modalImg">
            </div>
        `)

        const modal = document.querySelector(`.${id}.modal`)
        const modalImg = document.querySelector(`.${id}.modal .modalImg`)
        const closeBtn = document.querySelector(`.${id}.modal .close`)
        const imgDiv = document.querySelector(`#${id} .image-display .image`)


        // Quand on clique sur la div
        imgDiv.addEventListener('click', () => {
            const imageUrl = imgDiv.src
            modalImg.src = imageUrl
            modal.style.display = 'flex'
        })

        // Fermer la modale
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none'
        })

        // Fermer en cliquant en dehors de l'image
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none'
        })
    }
}