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

function prepareResult (res) {
  if (res.error) {
    console.log(res.error)
    errorElem.innerHTML = res.error
    show(errorElem)
    ubusError = true
  } else if (res && res.result[1]) return res.result[1]
  else return false
}

function authVoucher () {
  let mac
  mac = document.getElementById('stations').value || userMac
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
    .then(prepareResult)
    .then(res => {
      hide(loader)
      if (res && res.success) {
        result.innerHTML = int[lang].success
        show(result)
        hide(errorElem)
        init()
        const urlTo = window.location.href.split('=')[1]
        if (urlTo) {
          window.location.href = `http://${urlTo}`
        }
      } else if (res && !res.success) {
        errorElem.innerHTML = int[lang].invalid
        show(errorElem)
      }
      voucherElem.value = ''
    })
    .catch(err => {
      console.log('UBUS error:', err)
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
          .then(prepareResult)
          .then(res => {
            if (res) {
              userIp = res
            }
          })
          .catch(err => {
            console.log('UBUS error:', err)
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
    .then(prepareResult)
    .then(res => {
      if (res && !ubusError) {
        document.getElementById('stations').innerHTML = ''
        res.clients.map(i => {
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
          textnode.nodeValue = valid
            ? isIp + i.station + ' ✅'
            : isIp + i.station
          node.value = i.mac
          node.appendChild(textnode)
          document.getElementById('stations').appendChild(node)
        })
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
