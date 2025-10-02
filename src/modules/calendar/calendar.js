class calendarModule {

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
    #addEvt
    #clearForm
    #view
    #events
    #selectionStart


    constructor(id, data){
        // Simple calendrier/agenda
        this.#id = id
        this.#daysGrid = document.getElementById('daysGrid')
        this.#monthTitle = document.getElementById('monthTitle')
        this.#prevMonth = document.getElementById('prevMonth')
        this.#nextMonth = document.getElementById('nextMonth')
        this.#gotoDate = document.getElementById('gotoDate')
        this.#todayBtn = document.getElementById('todayBtn')

        this.#startDateInput = document.getElementById('startDate')
        this.#endDateInput = document.getElementById('endDate')
        this.#startTime = document.getElementById('startTime')
        this.#endTime = document.getElementById('endTime')
        this.#allDay = document.getElementById('allDay')
        this.#evtTitle = document.getElementById('evtTitle')
        this.#evtDesc = document.getElementById('evtDesc')
        this.#addEvt = document.getElementById('addEvt')
        this.#clearForm = document.getElementById('clearForm')

        this.#view = new Date()
        this.#events = JSON.parse(localStorage.getItem('agenda_events')||'[]')
        this.#selectionStart = null // Date

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
            const date = new Date(this.#view.getFullYear(), this.#view.getMonth(), day)
            const iso = this.#formatDateISO(date)
            const cell = document.createElement('div') 
            cell.className='cell' 
            cell.setAttribute('role','gridcell')
            const btn = document.createElement('button') 
            btn.className='daybtn' 
            btn.setAttribute('data-date', iso)
            btn.innerHTML = `<div class="date-num">${day}</div>`

            // mark today
            const today = new Date()
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
        Array.from(document.querySelectorAll('.cell .range-highlight')).forEach(n=>n.remove())
        const start = a < b ? a : b 
        const end = a < b ? b : a
        // loop over day buttons
        document.querySelectorAll('button.daybtn').forEach(btn=>{
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
            this.#view = new Date() 
            this.#renderMonth() 
        })

        // add event
        this.#addEvt.addEventListener('click', ()=>{
            const s = this.#startDateInput.value 
            const e = this.#endDateInput.value || s
            if(!s){ 
                alert('Choisis au moins une date de début') 
                return 
            }
            const ev = {
                id: Date.now(),
                title: this.#evtTitle.value.trim(),
                desc: this.#evtDesc.value.trim(),
                start: s,
                end: e || s,
                startTime: this.#allDay.checked ? '' : (this.#startTime.value||''),
                endTime: this.#allDay.checked ? '' : (this.#endTime.value||''),
                allDay: this.#allDay.checked
            }
            this.#saveEv(ev)
        })
        this.#clearForm.addEventListener('click', this.#clearFormFunc)
            
        // initial setup: set gotoDate default
        this.#gotoDate.value = this.#formatDateISO(new Date())

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
        Array.from(document.querySelectorAll('.cell .range-highlight')).forEach(n=>n.remove()) }


    #clearAll(){
        this.#events=[]
        this.#saveEvents()
        this.#renderMonth()
    }

    #saveEv(ev){
        console.log(ev)
        this.#events.push(ev) 
        this.#saveEvents() 
        this.#renderMonth() 
        this.#clearFormFunc()
    }

    notify(msg, payload) {
        switch (msg) {
            case "addPeriode":
                this.#saveEv(payload)
                break
            case "authorizeCallback":
                break
            default:
                console.error("Unknown message : " + msg)
                return
        }
    }
}

let cal = new calendarModule("123456789",undefined)

