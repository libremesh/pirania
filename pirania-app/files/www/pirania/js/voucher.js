let validMacs = []
let userIp = null

const validMacsForm = {
  id: 99,
  jsonrpc: '2.0',
  method: 'call',
  params:[
    '00000000000000000000000000000000',
    'pirania',
    'print_valid_macs',
    {},
  ]
}

const validGetClients = {
  id: 99,
  jsonrpc: '2.0',
  method: 'call',
  params:[
    '00000000000000000000000000000000',
    'pirania-app',
    'get_clients',
    {},
  ]
}

function authVoucher () {
  const mac = document.getElementById('stations').value
  const voucherElem = document.getElementById('voucherInput')
  const voucher = voucherElem.value
  const authVoucherForm = {
    id: 99,
    jsonrpc: '2.0',
    method: 'call',
    params:[
      '00000000000000000000000000000000',
      'pirania',
      'auth_voucher',
      {
        voucher,
        mac,
      },
    ]
  }
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(authVoucherForm),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    },
  })
  .then(parseJSON)
  .then((res) => {
    // debugger
    console.log('res', res)
    if (res && res.result[1] && res.result[1].success) {
      document.getElementById('result').innerHTML = 'Sucesso!'
      init()
    } else if (res && res.result[1] && !res.result[1].success) {
      document.getElementById('result').innerHTML = 'Senha incorreta!'
    } else if (res.error) {
      console.log(res.error)
      document.getElementById('error').innerHTML = res.error
      ubusError = true
    }
    voucherElem.value = ''
  })
  .catch((err) => {
    console.log('Erro no Ubus', err)
    document.getElementById('error').innerHTML = err
    ubusError = true
  })

}

function getIp() {
  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;//compatibility for Firefox and chrome
  var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
  pc.createDataChannel('');//create a bogus data channel
  pc.createOffer(pc.setLocalDescription.bind(pc), noop);// create offer and set local description
  pc.onicecandidate = function(ice) {
    if (ice && ice.candidate && ice.candidate.candidate) {
      var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
      pc.onicecandidate = noop;
      if (myIP) userIp = myIP
      else {
        fetch('http://thisnode.info/cgi-bin/client_ip')
        .then(i => {
          console.log(i)
          return JSON.parse(i) 
        })
        .then((res) => {
          console.log('Ubus res: ', res)
          if (res && res.result[1]) {
            userIp = res.result[1]
          } else if (res.error) {
            userIp = res.error
            ubusError = true
          }
        })
        .catch((err) => {
          console.log('Erro no Ubus', err)
          ubusError = true
        })
      }
    }
  }
}

function getValidClients() {
  if (!ubusError) {
    const myDiv = document.getElementById("station-list")
    const exists = document.getElementById("stations")
    if (!exists) {
      const select = document.createElement("select")
      select.id="stations"
      myDiv.appendChild(select)
    }
  }
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(validGetClients),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    },
  })
  .then(parseJSON)
  .then((res) => {
    if (res && res.result[1] && !ubusError) {
      res.result[1].clients.map(i => {
        const valid = validMacs.filter(valid => i.mac === valid).length > 0
        const node = document.createElement("option")
        let textnode
        const isIp = userIp ===  i.ip ? '* ' : ''
        if (isIp === '* ') node.selected = true
        if (valid) {
          textnode = document.createTextNode(isIp+i.station+' ✅')
        } else {
          textnode = document.createTextNode(isIp+i.station)
        }
        node.value = i.mac
        node.appendChild(textnode)
        document.getElementById('stations').appendChild(node)
      })
    } else if (res.error) {
      console.log(res.error)
      document.getElementById('error').innerHTML = 'Erro no Ubus'
      ubusError = true
    }
  })
  .catch((err) => {
    console.log('Erro no Ubus', err)
    document.getElementById('error').innerHTML = 'Erro no Ubus'
    ubusError = true
  })
}

function getValidMacs () {
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(validMacsForm),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    },
  })
  .then(parseJSON)
  .then((res) => {
    if (res && res.result[1]) {
      validMacs = res.result[1].macs
    } else if (res.error) {
      console.log(res.error)
      document.getElementById('error').innerHTML = 'Erro no Ubus'
      ubusError = true
    }
  })
  .catch((err) => {
    console.log('Erro no Ubus', err)
    document.getElementById('error').innerHTML = 'Erro no Ubus'
    ubusError = true
  })
}

function init() {
  getIp()
  getValidClients()
  getValidMacs()
}

init()