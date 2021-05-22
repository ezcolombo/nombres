const fs = require('fs')
const path = require('path')
const express = require('express')
const FILE = path.resolve('data', 'historico-simples.json')
const PORT = process.env.PORT || 8080
const MAX_IN_SET = 5

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

const getNames = function (names, quantity = 1, callback) {
  if (!names || quantity === 0 || quantity > MAX_IN_SET) {
    return callback(new Error(`q params MUST be between 1 and ${MAX_IN_SET}`), null)
  }
  let nameset = []

  for (let i = 0; i < quantity; ++i) {
    nameset.push(names[getRandomMinMax(0, names.length -1)])
  }
  
  callback(null, nameset)
}

loadParse(FILE, (error, names) => {
  if (error) {
    console.error(error)
    process.exit(1)

  } else {
    console.log(`${names.length} Names Loaded from ${FILE}`)
    namesObject = names
    
    app.use('/assets', express.static('assets'));

    app.get('/',function(req,res) {
      res.sendFile(path.resolve('index.html'));
    })
    
    app.get('/api', (req, res) => {
      let quantity = 1
      
      if (Number.isSafeInteger(Number(req.query.q))) {
        quantity = req.query.q
      }

      getNames(namesObject, quantity, (error, data) => {
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
