let url_params = (new URL(document.location)).searchParams;
let n  = url_params.get('nombre') || undefined
let c  = url_params.get('circa') || undefined
let w  = Number(url_params.get('delay'))

let api = '/api?q=1'
api = (n) ? `${api}&nombre=${n}` : api
api = (c) ? `${api}&circa=${c}` : api

let name = document.getElementById("name")
let year = document.getElementById("year")
let info = document.getElementById("info")

function udateDisplay(data) {

  if (Array.isArray(data) && data.length >= 1) {
    let peopleborn = (data[0].count == 1)? 'Sola persona nació' : 'Personas nacieron'

    name.innerText = `${data[0].name}`
    year.innerText = `{ ${data[0].year} }`
    info.innerText = `${data[0].count} ${peopleborn} en ${data[0].year} con el nombre de ${data[0].name}`

  } else {
    infoinnerText = JSON.stringify(data)
  }

  return
}

function getNames(url) {
  fetch(url).then((response) => {
    if (response.status !== 200) {
      console.log('Code: ' + response.status + 'Type: ' + response.type);
      return;
    }
    
    response.json().then((data) => {
        console.dir(data)
        udateDisplay(data)
      })
  
    }).catch(function(err) {
      console.log('Error fetching API:', err);
    })
  return
}

getNames(api)
setInterval(() => { getNames(api) }, (w >= 1 ? w : 5) * 1000)