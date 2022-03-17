const v8 = require('v8')
const fs = require('fs')
const path = require('path')
const FILE = path.resolve('data', 'historico-simples.json')
const PORT = process.env.PORT || 8080
const MAX_IN_SET = 50
const TS  = () => {return String(new Date().toISOString())}

const memUsage = function (label) {
  const TS = () => new Date().toISOString()
  const used = Math.floor(v8.getHeapStatistics().used_heap_size / (1024 * 1024))
  const total = Math.floor(v8.getHeapStatistics().heap_size_limit / (1024 * 1024))
  const perc = ((used / total) * 100).toFixed(0).padStart(3, ' ')

  return `=> ${TS()} Heap[${perc}%](${used}/${total}) ${label}`
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





loadParse(FILE, (error, names) => {
  if (error) {
    console.error(error)
    process.exit(1)

  } else {
    console.log(`${names.length} Names Loaded from ${FILE}`)
    console.log(memUsage('/'))

    let quantity = 1
    let name
    let circa
      
	for (let i = 0; i < 100000; i++) {
      getNames(names, quantity, name, circa, (error, data) => {
        if (error) {
          console.error(error.message)
        } else {
          //console.dir(data)
          console.log(memUsage(data[0].name))
        }
      })
    }
    
  }
})
