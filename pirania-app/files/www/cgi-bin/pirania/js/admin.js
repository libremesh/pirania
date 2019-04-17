let session = null
let uploadedLogo = null

function makeid(length) {
  var text = ""
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789"
  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}

function compress(e) {
  const fileName = e.target.files[0].name;
  const reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = event => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const elem = document.createElement('canvas');
      const width = 50;
      const scaleFactor = width / img.width;
      elem.width = width;
      elem.height = img.height * scaleFactor;
      const ctx = elem.getContext('2d');
      ctx.drawImage(img, 0, 0, width, img.height * scaleFactor);              
      ctx.canvas.toBlob((blob) => {
        const file = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now()
        });
      }, 'image/jpeg', 1);
      console.log(ctx.canvas.toDataURL("image/jpeg"))
      uploadedLogo = ctx.canvas.toDataURL("image/jpeg")
      document.getElementById("logo-upload").appendChild(elem)
    },
    reader.onerror = error => console.log(error)

  }
}

function createVoucher () {
  const key = document.getElementById('adminInputKey').value
  const secret = makeid(8)
  const days = document.getElementById('adminInputDays').value
  const daysInMs = days * 86400000
  const epoc = new Date().getTime() + daysInMs
  const form = {
    id: 99,
    jsonrpc: '2.0',
    method: 'call',
    params:[
      session,
      'pirania',
      'add_voucher',
      {
        epoc,
        key,
        upload: 10,
        download: 10,
        amountofmacsallowed: 3,
        secret,
      },
    ]
  }
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(form),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    },
  })
  .then(parseJSON)
  .then(res => {
    console.log('RES', res)
    if (res.result[1]) {
      document.getElementById('adminInputKey').value = ''
      document.getElementById('adminInputDays').value  = ''
      document.getElementById('voucherSecret').innerHTML = secret
    }
  })
  .catch(err => console.log(err))
}

function removeVoucher (name) {
  const form = {
    id: 99,
    jsonrpc: '2.0',
    method: 'call',
    params:[
      session,
      'pirania',
      'remove_voucher',
      {
        name,
      },
    ]
  }
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(form),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    },
  })
  .then(parseJSON)
  .then((res) => {
    if (res && res.result[1]) {
      console.log(res.result[1])
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

function listVouchers () {
  const form = {
    id: 99,
    jsonrpc: '2.0',
    method: 'call',
    params:[
      session,
      'pirania',
      'list_vouchers',
      {},
    ]
  }
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(form),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    },
  })
  .then(parseJSON)
  .then((res) => {
    if (res && res.result[1]) {
      const vouchers = res.result[1].vouchers
      console.log(vouchers)
      document.getElementById('voucher-list-button').style.display = 'none'
      vouchers.map(v => {
        const elem = document.createElement('div');
        elem.innerHTML = v.name+' : '+v.voucher+` <a onclick="removeVoucher('${v.name}')">X</a>`
        document.getElementById("voucher-list").appendChild(elem)
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

function updateContent () {
  const backgroundColor = document.getElementById('adminInputBackground').value
  const title = document.getElementById('adminInputTitle').value
  const welcome = document.getElementById('adminInputWelcome').value
  const body = document.getElementById('adminInputBody').value
  let logo = uploadedLogo || content.logo
  const form = {
    id: 99,
    jsonrpc: '2.0',
    method: 'call',
    params:[
      session,
      'pirania-app',
      'write_content',
      {
        backgroundColor,
        title,
        welcome,
        body,
        logo,
      },
    ]
  }
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(form),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    },
  })
  .then(parseJSON)
  .then((res) => {
    if (res && res.result[1]) {
      content = res.result[1]
      const { backgroundColor, title, welcome, body, logo } = content
      document.body.style.backgroundColor = backgroundColor
      const contentLogo = document.getElementById('content-logo')
      const contentTitle = document.getElementById('content-title')
      const contentWelcome = document.getElementById('content-welcome')
      const contentBody = document.getElementById('content-body')
      if (contentLogo) contentLogo.src = logo
      if (contentTitle) contentTitle.innerHTML = title
      if (contentWelcome) contentWelcome.innerHTML = welcome
      if (contentBody) contentBody.innerHTML = body
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

function adminAuth () {
  const password = document.getElementById('adminInput').value
  const authAdminForm = {
    id: 99,
    jsonrpc: '2.0',
    method: 'call',
    params:[
      '00000000000000000000000000000000',
      'session',
      'login',
      {
        username: 'root',
        password,
        timeout: 5000,
      },
    ]
  }
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(authAdminForm),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    },
  })
  .then(parseJSON)
  .then((res) => {
    if (res.result[1]) {
      session = res.result[1].ubus_rpc_session
      const login = document.querySelector('.admin-login')
      login.style.display = 'none'
      const admin = document.querySelector('.admin-form')
      admin.style.display = 'block'
      const adminContent = document.querySelector('.admin-content')
      adminContent.style.display = 'block'
      const { backgroundColor, title, welcome, body } = content
      document.getElementById('adminInputTitle').value = title
      document.getElementById('adminInputWelcome').value = welcome
      document.getElementById('adminInputBody').value = body
      document.getElementById('adminInputBackground').value = backgroundColor

    }
  })
  .catch(err => console.log(err))
}

document.getElementById("logo-file").addEventListener("change", function (event) {
  compress(event)
})