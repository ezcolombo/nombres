let url_params = (new URL(document.location)).searchParams;
let q  = url_params.get('q') || '2'
let w  = Number(url_params.get('w'))

let d = document.getElementById("display")
let f = document.getElementById("foot")

function udateDisplay(data) {
  let names = []
  let foot = []

  if (Array.isArray(data)) {
    data.forEach((e) => {
      names.push(e.name)
      foot.push(e.year)
    })

    d.innerText = names.join(' | ')
    f.innerText = foot.join(' | ')

  } else {
    d.innerText = JSON.stringify(data)
  }

  return
}

function getNames() {
  fetch('/api?q='+String(q)).then((response) => {
    if (response.status !== 200) {
      console.log('Code: ' + response.status + 'Type: ' + response.type);
      return;
    }
  
    response.json().then((data) => {
        udateDisplay(data)
      })
  
    }).catch(function(err) {
      console.log('Error fetching API:', err);
    })
  return
}
getNames()
setInterval(() => { getNames() }, (w >= 1 ? w : 5) * 1000)