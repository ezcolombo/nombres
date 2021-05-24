let nameFilter = null
let yearFilter = null
let api = '/api?q=1'

const params = (new URL(document.location)).searchParams;
const n  = params.get('nombre') || undefined
const c  = params.get('circa') || undefined
const delay  = Number(params.get('delay'))
const INTERVAL = delay >= 1 ? delay : 10
const progressChar = '_'

let progress = INTERVAL

if (n) {
  nameFilter = `&nombre=${n}`
  api = api + nameFilter
}

if (c) {
  yearFilter = `&circa=${c}`
  api = api + yearFilter
}

let name = document.getElementById("name")
let year = document.getElementById("year")
let info = document.getElementById("info")
let help = document.getElementById("help")

function updateNextIn() {
  timer.innerText = progressChar.repeat(progress)
  return
}

function udateDisplay(data) {

  if (Array.isArray(data) && data.length >= 1) {
    let peopleborn = (data[0].count == 1)? 'Sola persona nació' : 'Personas nacieron'

    name.innerText = `${data[0].name}`
    year.innerText = `${data[0].year}`
    info.innerText = `${data[0].count} ${peopleborn} ese año con el nombre de ${data[0].name}, el cual tuvo su mayor popularidad en ${data[0].topYear} con ${data[0].topCount} registros.`

  } else {
    infoinnerText = JSON.stringify(data)
  }

  return
}

function getNames(url) {
  fetch(url).then((response) => {
    if (response.status !== 200) {
      console.error('Code: ' + response.status + 'Type: ' + response.type);
      return;
    }
    
    response.json().then((data) => {
        console.debug(data)
        udateDisplay(data)
      })
  
    }).catch(function(err) {
      console.error('Error fetching API:', err);
    })
  return
}

function onDisplayOver() {
  if (nameFilter) {
    help.innerText = 'haga click para volver al modo aleatorio'
  } else {
    help.innerText = 'haga click para fijar el nombre actual'
  }
  return
}

function onDisplayClick() {
  if (nameFilter) {
    api = api.replace(nameFilter, '')
    name.style.opacity = 1
    nameFilter = null
  } else {
    nameFilter = `&nombre=${name.innerText}`
    name.style.opacity = 0.5
    api = api.concat(nameFilter)
  }
  console.debug('onDisplayClick: ', api)
  return getNames(api)
}

function onYearOver() {
  if (yearFilter) {
    help.innerText = 'haga click para volver al modo aleatorio'
  } else {
    help.innerText = 'haga click para fijar el año actual'
  }
  return
}

function onYearClick() {
  if (yearFilter) {
    api = api.replace(yearFilter, '')
    year.style.opacity = 1
    yearFilter = null
  } else {
    yearFilter = `&circa=${year.innerText}`
    year.style.opacity = 0.5
    api = api.concat(yearFilter)
  }
  console.debug('onYearClick: ', api)
  return getNames(api)
}

function hideHelp() { help.innerText = ''}

getNames(api)

setInterval(() => { 
  getNames(api)
  progress = INTERVAL
}, INTERVAL * 1000)

setInterval(() => { 
  --progress
  updateNextIn()
}, 1000)

