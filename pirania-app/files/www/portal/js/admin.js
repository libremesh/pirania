let session = null
let uploadedLogo = null


function xDaysFromNow (days) {
  let date = new Date()
  let newDate = date.setDate(date.getDate() + parseInt(days))
  return newDate.toString()
}



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

function createManyVouchers () {
  const key = document.getElementById('adminManyInputKey').value
  const days = document.getElementById('adminManyInputDays').value
  const numberVouchers = document.getElementById('adminManyInputVouchers').value
  const epoc = xDaysFromNow(days)
  const vouchers = []
  for (let index = 0; index < numberVouchers; index++) {
    vouchers.push({
      key: `${key}-${makeid(3)}`,
      voucher: makeid(8),
      epoc,
    })
  }
  console.log('VOUCHERS', vouchers)
  ubusFetch('pirania', 'add_many_vouchers', { vouchers }, session)
    .then(res => {
      if (res.success) {
        document.getElementById('adminManyInputKey').value = ''
        document.getElementById('adminManyInputDays').value  = 1
        document.getElementById('adminManyInputVouchers').value  = 1
        document.getElementById('many-result').innerHTML = 'Sucesso!'
      }
    })
    .catch(err => console.log(err))
}

function createVoucher () {
  const key = document.getElementById('adminInputKey').value
  const secret = makeid(8)
  const days = document.getElementById('adminInputDays').value
  const epoc = xDaysFromNow(days)
  ubusFetch(
    'pirania',
    'add_voucher',
    {
      epoc,
      key,
      upload: 10,
      download: 10,
      amountofmacsallowed: 1,
      secret,
    },
    session
  )
  .then(res => {
    document.getElementById('adminInputKey').value = ''
    document.getElementById('adminInputDays').value  = ''
    document.getElementById('voucherSecret').innerHTML = secret
  })
  .catch(err => console.log(err))
}

function removeVoucher (name) {
  ubusFetch('pirania', 'remove_voucher', { name }, session)
  .then(res => console.log(res))
  .catch(err => {
    console.log(err)
    show(errorElem)
  })
}

function listVouchers () {
  ubusFetch('pirania', 'list_vouchers', {}, session)
  .then(res => {
    const vouchers = res.vouchers
    document.getElementById('voucher-list-button').style.display = 'none'
    vouchers
    .sort((a, b) => {
      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;
    })  
    .map(v => {
      const elem = document.createElement('div')
      const date = new Date (parseInt(v.expires))
      let dd = date.getDate()
      let mm = date.getMonth() + 1
      let yyyy = date.getFullYear()
      if (dd < 10) {
        dd = '0' + dd
      } 
      if (mm < 10) {
        mm = '0' + mm
      } 
      elem.innerHTML = `${v.name} : ${v.voucher} - ${dd}/${mm}/${yyyy} <a onclick="removeVoucher('${v.name}')">X</a>`
      document.getElementById("voucher-list").appendChild(elem)
    })
  })
  .catch(err => {
    errorElem.innerHTML = int[lang].error
    show(errorElem)
  })
}

function updateContent () {
  const backgroundColor = document.getElementById('adminInputBackground').value
  const title = document.getElementById('adminInputTitle').value
  const welcome = document.getElementById('adminInputWelcome').value
  const body = document.getElementById('adminInputBody').value
  let logo = uploadedLogo || content.logo
  ubusFetch(
    'pirania-app',
    'write_content',
    {
      backgroundColor,
      title,
      welcome,
      body,
      logo,
    },
    session
  )
  .then(res => {
    content = res
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
  })
  .catch(err => {
    errorElem.innerHTML = int[lang].error
    show(errorElem)
  })
}

function adminAuth () {
  const password = document.getElementById('adminInput').value
  ubusFetch(
    'session',
    'login',
    {
      username: 'root',
      password,
      timeout: 5000,
    }
  )
  .then(res => {
    hide(errorElem)
    session = res.ubus_rpc_session
    document.querySelector('.admin-login').style.display = 'none'
    document.querySelector('.admin-form').style.display = 'block'
    document.querySelector('.admin-create-many').style.display = 'block'
    const adminContent = document.querySelector('.admin-content')
    adminContent.style.display = 'block'
    const { backgroundColor, title, welcome, body } = content
    document.getElementById('adminInputTitle').value = title
    document.getElementById('adminInputWelcome').value = welcome
    document.getElementById('adminInputBody').value = body
    document.getElementById('adminInputBackground').value = backgroundColor
  })
  .catch(err => {
    console.log(err)
    show(errorElem)
    errorElem.innerHTML = int[lang].wrongPassword
  })
}

document.getElementById("logo-file").addEventListener("change", function (event) {
  compress(event)
})