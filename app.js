const fs = require('fs')
const path = require('path')
const express = require('express')
const FILE = path.resolve('data', 'historico-simples.json')
const PORT = process.env.PORT || 8080
const MAX_IN_SET = 50
const TS  = () => {return String(new Date().toISOString())}

let namesObject
const app = express();

const getRandomMinMax = function (_min = 0, _max = Number.MAX_SAFE_INTEGER) {
  _min = Math.ceil(_min);
  _max = Math.floor(_max);
  
  return Math.floor(Math.random() * (_max - _min + 1) + _min);
}

const loadParse = function (_f, callback) {
  let p = {}

  fs.readFile(_f, (error, data) => {
    if (error) callback(error, null)

    try {
      p = JSON.parse(data.toString())
      callback(null, p)
    } catch(e) {
      callback(e, null)
    }

  })
}

const getNames = function (nameset, quantity, name, circa, callback) {
  if (!nameset || quantity === 0 || quantity > MAX_IN_SET) {
    return callback(new Error(`q params MUST be between 1 and ${MAX_IN_SET}`), null)
  }
  let result = []
  let registry = nameset
  
  if (name) {
    registry = registry.filter((n) => n.name === name)
  }

  if (circa) {
    registry = registry.filter((n) => n.year === circa)
  }

  for (let i = 0; i < quantity; ++i) {
    let pick = registry[getRandomMinMax(0, registry.length -1)]
    let nset = nameset.filter((d)=> d.name === pick.name)

    nset.sort((y, z) => {return y.count - z.count})
    pick.topYear = nset[nset.length - 1].year
    pick.topCount = nset[nset.length - 1].count

    result.push(pick)
  }
  
  callback(null, result)
}

loadParse(FILE, (error, names) => {
  if (error) {
    console.error(error)
    process.exit(1)

  } else {
    console.log(`${names.length} Names Loaded from ${FILE}`)
    namesObject = names
    
    app.use('/assets', express.static('assets'));

    app.get('/', (req, res) => {

      let srcIP   = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(/\s*,\s*/)[0] : req.socket.remoteAddress
      let country = req.headers['x-appengine-country'] || 'N/A'
      let region  = req.headers['x-appengine-region'] || 'N/A'
      let city    = req.headers['x-appengine-city'] || 'N/A'
      let latlon  = req.headers['x-appengine-citylatlong'] || 'N/A'

      console.log(`${TS()} GET / IP:${srcIP} Country:${country} Region:${region} City:${city} Lat-Lon:${latlon}`)
      res.sendFile(path.resolve('index.html'));
    })
    
    app.get('/api', (req, res) => {
      let quantity = 1
      let name
      let circa
      
      if (Number.isSafeInteger(Number(req.query.q))) {
        quantity = req.query.q
      }
      
      if (typeof(req.query.nombre) === 'string' 
          && /(^[A-Za-z]+$)/.test(req.query.nombre)) {

          name = req.query.nombre
      }
      
      if (Number.isSafeInteger(Number(req.query.circa))
          && /(^[0-9][0-9][0-9][0-9]$)/.test(req.query.circa)) {

          circa = req.query.circa
      }

      getNames(namesObject, quantity, name, circa, (error, data) => {
        if (error) {
          res.json({error: error.message})
        } else {
          res.json(data)
        }
      })

    })
    
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}...`);
    });
    
  }
})
