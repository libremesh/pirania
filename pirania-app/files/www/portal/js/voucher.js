let validMacs = []
let userIp = null
let userMac = null
let userIsValid = null

const validMacsForm = {
  id: 99,
  jsonrpc: '2.0',
  method: 'call',
  params: [
    '00000000000000000000000000000000',
    'pirania',
    'print_valid_macs',
    {}
  ]
}

const validGetClients = {
  id: 99,
  jsonrpc: '2.0',
  method: 'call',
  params: [
    '00000000000000000000000000000000',
    'pirania-app',
    'get_clients',
    {}
  ]
}

function authVoucher () {
  let mac
  if (document.getElementById('stations').value) {
    mac = document.getElementById('stations').value
  } else {
    mac = userMac
  }
  let voucherElem = document.getElementById('voucherInput')
  let voucher = voucherElem.value.toLowerCase()
  voucherElem.after(loader)
  show(loader)
  const authVoucherForm = {
    id: 99,
    jsonrpc: '2.0',
    method: 'call',
    params: [
      '00000000000000000000000000000000',
      'pirania',
      'auth_voucher',
      {
        voucher,
        mac
      }
    ]
  }
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(authVoucherForm),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    }
  })
    .then(parseJSON)
    .then(res => {
      hide(loader)
      // debugger
      if (res && res.result[1] && res.result[1].success) {
        result.innerHTML = int[lang].success
        show(result)
        hide(errorElem)
        init()
        const urlTo = window.location.href.split('=')[1]
        if (urlTo) {
          window.location.href = `http://${urlTo}`
        }
      } else if (res && res.result[1] && !res.result[1].success) {
        errorElem.innerHTML = int[lang].invalid
        show(errorElem)
      } else if (res.error) {
        console.log(res.error)
        errorElem.innerHTML = res.error
        show(errorElem)

        ubusError = true
      }
      voucherElem.value = ''
    })
    .catch(err => {
      console.log('Erro no Ubus', err)
      errorElem.innerHTML = err
      show(errorElem)
      ubusError = true
    })
}

function getIp () {
  window.RTCPeerConnection =
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection // compatibility for Firefox and chrome
  var pc = new RTCPeerConnection({ iceServers: [] })

  var noop = function () {}
  pc.createDataChannel('') // create a bogus data channel
  pc.createOffer(pc.setLocalDescription.bind(pc), noop) // create offer and set local description
  pc.onicecandidate = function (ice) {
    if (ice && ice.candidate && ice.candidate.candidate) {
      var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(
        ice.candidate.candidate
      )[1]
      pc.onicecandidate = noop
      if (myIP) userIp = myIP
      else {
        fetch('http://thisnode.info/cgi-bin/client_ip')
          .then(i => {
            console.log(i)
            return JSON.parse(i)
          })
          .then(res => {
            console.log('Ubus res: ', res)
            if (res && res.result[1]) {
              userIp = res.result[1]
            } else if (res.error) {
              userIp = res.error
              ubusError = true
            }
          })
          .catch(err => {
            console.log('Erro no Ubus', err)
            ubusError = true
          })
      }
    }
  }
}

function getValidClients () {
  if (!ubusError) {
    const myDiv = document.getElementById('station-list')
    const exists = document.getElementById('stations')
    if (!exists) {
      const select = document.createElement('select')
      select.id = 'stations'
      myDiv.appendChild(select)
    }
  }
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(validGetClients),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    }
  })
    .then(parseJSON)
    .then(res => {
      if (res && res.result[1] && !ubusError) {
        document.getElementById('stations').innerHTML = ''
        res.result[1].clients.map(i => {
          const valid = validMacs.filter(valid => i.mac === valid).length > 0
          const node = document.createElement('option')
          let textnode = document.createTextNode('')
          if (userIp === i.ip) {
            userMac = i.mac
            const userMacElement = document.getElementById('user-mac')
            const infoText = '📱 ' + i.station + ' ' + '<b>' + userMac + '</b>'
            userMacElement.innerHTML = valid ? infoText + ' ✅' : infoText
            node.selected = true
          }
          const isIp = userIp === i.ip ? '📱 ' : ''
          if (valid) {
            textnode.nodeValue = isIp + i.station + ' ✅'
          } else {
            textnode.nodeValue = isIp + i.station
          }
          node.value = i.mac
          node.appendChild(textnode)
          document.getElementById('stations').appendChild(node)
        })
      } else if (res.error) {
        console.log(res.error)
        errorElem.innerHTML = int[lang].error
        show(errorElem)
        ubusError = true
      }
    })
    .catch(err => {
      console.log(int[lang].error, err)
      errorElem.innerHTML = int[lang].error
      show(errorElem)
      ubusError = true
    })
}

function getValidMacs () {
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(validMacsForm),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    }
  })
    .then(parseJSON)
    .then(res => {
      if (res && res.result[1]) {
        validMacs = res.result[1].macs
        if (validMacs.length > 0) {
          getValidClients()
        }
      } else if (res.error) {
        console.log(res.error)
        errorElem.innerHTML = int[lang].error
        ubusError = true
      }
    })
    .catch(err => {
      console.log(int[lang].error, err)
      errorElem.innerHTML = int[lang].error
      ubusError = true
    })
}

function init () {
  getIp()
  getValidClients()
  getValidMacs()
}

init()
