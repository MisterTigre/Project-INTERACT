class CalendarModule {

    #id
    #daysGrid
    #monthTitle
    #prevMonth
    #nextMonth
    #gotoDate
    #todayBtn
    #startDateInput
    #endDateInput
    #startTime
    #endTime
    #allDay
    #evtTitle
    #evtDesc
    #clearForm
    #view
    #events
    #selectionStart
    #data
    #callback
    #validateBtn
    #container
    #listeningToClick


    constructor(id, data, callback){
        // Simple calendrier/agenda
        this.#callback = callback
        this.#id = id
        this.#data = data
        this.#container = document.getElementById(this.#id)
        this.#daysGrid = this.#container.querySelector('.-daysGrid')
        this.#monthTitle = this.#container.querySelector('.-monthTitle')
        this.#prevMonth = this.#container.querySelector('.-prevMonth')
        this.#nextMonth = this.#container.querySelector('.-nextMonth')
        this.#gotoDate = this.#container.querySelector('.-gotoDate')
        this.#todayBtn = this.#container.querySelector('.-todayBtn')

        this.#startDateInput = this.#container.querySelector('.-startDate')
        this.#endDateInput = this.#container.querySelector('.-endDate')
        this.#startTime = this.#container.querySelector('.-startTime')
        this.#endTime = this.#container.querySelector('.-endTime')
        this.#allDay = this.#container.querySelector('.-allDay')
        this.#evtTitle = this.#container.querySelector('.-evtTitle')
        this.#evtDesc = this.#container.querySelector('.-evtDesc')
        this.#clearForm = this.#container.querySelector('.-clearForm')

        this.#view = new Date(this.#data.startDay)
        this.#events = JSON.parse(localStorage.getItem('agenda_events')||'[]')
        this.#selectionStart = null // Date


        if (this.#data === undefined){
            this.#data = {
                size:"big"
            }
        }
        let card = this.#container.getElementsByClassName('wrap')
        if (this.#data.size == "little"){
            card[0].classList.add('little-card')
            let side = this.#container.getElementsByClassName('-card sidebar')
            side[0].parentNode.removeChild(side[0])
            this.#validateBtn = this.#container.querySelector(".little")
        }else{
            card[0].classList.add('big-card')
            this.#validateBtn = this.#container.querySelector(".big")
        }
        Array.from(this.#container.getElementsByClassName('primary')).forEach(btn =>{
            btn.classList.add('hidden')
        })

        this.#initialize()
        this.#clearAll()
    }


    #saveEvents(){ 
        localStorage.setItem('agenda_events', JSON.stringify(this.#events)) 
    }

    #formatDateISO(d){ 
        return d.toISOString().slice(0,10) 
    }

    #parseISO(s){ 
        const t = new Date(s+'T00:00:00') 
        if(isNaN(t)){
            return null 
        }
        return t
    }

    #startOfMonth(d){ 
        return new Date(d.getFullYear(), d.getMonth(), 1) 
    }

    #endOfMonth(d){ 
        return new Date(d.getFullYear(), d.getMonth()+1, 0)
    }

    #renderMonth(){
        this.#daysGrid.innerHTML = ''
        const first = this.#startOfMonth(this.#view)
        const last = this.#endOfMonth(this.#view)
        const startWeekday = (first.getDay() + 6) % 7 // 0 = Monday
        const total = last.getDate()

        this.#monthTitle.textContent = first.toLocaleString('fr-FR', { month:'long', year:'numeric' })

        // leading blanks
        for(let i=0; i<startWeekday; i++){
            const blank = document.createElement('div')
            blank.className='cell' 
            this.#daysGrid.appendChild(blank)
        }

        for(let day=1; day<=total; day++){
            const date = new Date(this.#view.getFullYear(), this.#view.getMonth(), day, 2)
            const iso = this.#formatDateISO(date)
            const cell = document.createElement('div') 
            cell.className='cell' 
            cell.setAttribute('role','gridcell')
            const btn = document.createElement('button') 
            btn.className='daybtn' 
            btn.setAttribute('data-date', iso)
            btn.innerHTML = `<div class="date-num">${day}</div>`

            // mark today
            const today = new Date(this.#data.startDay)
            if(this.#formatDateISO(today) === iso){
                 btn.classList.add('today')
            }
            // events for day (start <= day <= end)
            const evts = this.#events.filter(e => { return e.start <= iso && e.end >= iso })
            if(evts.length){
                const eventsWrap = document.createElement('div')
                eventsWrap.className='events'
                evts.slice(0,3).forEach(ev=>{ 
                    const el = document.createElement('div') 
                    el.className='evt' 
                    el.textContent = ev.title || '(sans titre)' 
                    eventsWrap.appendChild(el) })
                cell.appendChild(eventsWrap)
            }

            // click to select date / range
            btn.addEventListener('click', ()=>{
                if(!this.#selectionStart){ 
                    this.#selectionStart = iso 
                    this.#startDateInput.value = iso 
                    this.#endDateInput.value = iso 
                    this.#highlightRange(this.#selectionStart, iso) 
                }else {
                // if clicked same day, single date else set end
                const start = this.#selectionStart
                const end = iso
                if(start <= end){ 
                    this.#startDateInput.value = start 
                    this.#endDateInput.value = end 
                }else { 
                    this.#startDateInput.value = end 
                    this.#endDateInput.value = start 
                }
                this.#highlightRange(start, end)
                this.#selectionStart = null
                }
            })

        cell.appendChild(btn)
        this.#daysGrid.appendChild(cell)
        }

        // trailing blanks to fill week
        const children = this.#daysGrid.children.length
        const extra = (7 - (children %7)) %7
        for(let i=0;i<extra;i++){ 
            const b=document.createElement('div') 
            b.className='cell' 
            this.#daysGrid.appendChild(b) }
    }


    #highlightRange(a,b){
        // remove old highlights
        Array.from(this.#container.querySelectorAll('.cell .range-highlight')).forEach(n=>n.remove())
        const start = a < b ? a : b 
        const end = a < b ? b : a
        // loop over day buttons
        this.#container.querySelectorAll('button.daybtn').forEach(btn=>{
            const d = btn.getAttribute('data-date')
            if(!d) return
            if(d >= start && d <= end){
                const hl = document.createElement('div') 
                hl.className='range-highlight' 
                btn.parentElement.style.position='relative' 
                btn.parentElement.appendChild(hl)
            }
        })
    }

    #initialize(){
        // controls
        this.#prevMonth.addEventListener('click', ()=>{ 
            this.#view = new Date(this.#view.getFullYear(), this.#view.getMonth()-1, 1) 
            this.#renderMonth() 
        })
        this.#nextMonth.addEventListener('click', ()=>{ 
            this.#view = new Date(this.#view.getFullYear(), this.#view.getMonth()+1, 1) 
            this.#renderMonth() 
        })
        
        this.#gotoDate.addEventListener('change', ()=>{ 
            if(this.#gotoDate.value){ 
                const d = new Date(this.#gotoDate.value) 
                this.#view = new Date(d.getFullYear(), d.getMonth(), 1)
                this.#renderMonth() 
            }
        })
        this.#todayBtn.addEventListener('click', ()=>{
            this.#view = new Date(this.#data.startDay)
            this.#renderMonth() 
        })

        // add event
        this.#validateBtn.addEventListener('click', ()=>{
            if (this.#listeningToClick){
                const s = this.#startDateInput.value 
                const e = this.#endDateInput.value || s
                if(!s){ 
                    alert('Choisis au moins une date de début') 
                    return 
                }
                let ev = {
                    id: Date.now(),
                    title: this.#evtTitle.value.trim(),
                    desc: this.#evtDesc.value.trim(),
                    start: s,
                    end: e || s,
                    startTime: this.#allDay.checked ? '' : (this.#startTime.value||''),
                    endTime: this.#allDay.checked ? '' : (this.#endTime.value||''),
                    allDay: this.#allDay.checked
                }
                this.#callback({"answer":[ev.start, ev.end]})
                this.#listeningToClick = false
                this.#validateBtn.classList.add('hidden')
                this.#validateBtn.classList.remove('visible')
            }
        })
        this.#clearForm.addEventListener('click', this.#clearFormFunc.bind(this))
            //https://nominatim.openstreetmap.org/reverse?lat=48.8566&lon=2.3522&format=json
        // initial setup: set gotoDate default
        this.#gotoDate.value = this.#formatDateISO(this.#view)

        // keyboard accessibility: navigate months with left/right
        window.addEventListener('keydown', (e)=>{
            if(e.key==='ArrowLeft'){ 
                this.#view = new Date(this.#view.getFullYear(), this.#view.getMonth()-1,1) 
                this.#renderMonth() 
            }
            if(e.key==='ArrowRight'){ 
                this.#view = new Date(this.#view.getFullYear(), this.#view.getMonth()+1,1) 
                this.#renderMonth() 
            }
        })
    }


    #clearFormFunc(){ 
        this.#evtTitle.value='' 
        this.#evtDesc.value='' 
        this.#startDateInput.value='' 
        this.#endDateInput.value='' 
        this.#startTime.value='' 
        this.#endTime.value='' 
        this.#allDay.checked=false 
        this.#selectionStart=null 
        Array.from(this.#container.querySelectorAll('.cell .range-highlight')).forEach(n=>n.remove()) }


    #clearAll(){
        this.#events=[]
        this.#saveEvents()
        this.#renderMonth()
    }

    #saveEv(ev){
        this.#events.push(ev) 
        this.#saveEvents() 
        this.#renderMonth() 
        this.#clearFormFunc()
    }

    notify(msg, payload) {
        switch (msg) {
            case "addPeriode":
                this.#saveEv(payload)
                this.#callback()
                break
            case "selectDates":
                this.#listeningToClick = true
                this.#validateBtn.classList.remove('hidden')
                this.#validateBtn.classList.add('visible')
                break
            default:
                console.error("Unknown message : " + msg)
                return
        }
    }
}


