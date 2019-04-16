const url = 'http://thisnode.info/ubus'
let ubusError = false
let content = {
  backgroundColor: 'white',
  title: '',
  welcome: '',
  body: '',
  logo: '',
}

function parseJSON(response) {
  return response.json()
}

const contentForm = {
  id: 99,
  jsonrpc: '2.0',
  method: 'call',
  params:[
    '00000000000000000000000000000000',
    'pirania-app',
    'read_content',
    {},
  ]
}

function getContent () {
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(contentForm),
    headers: {
      'Access-Control-Allow-Origin': 'http://thisnode.info'
    },
  })
  .then(parseJSON)
  .then((res) => {
    if (res && res.result[1]) {
      console.log(res.result[1])
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
      document.querySelector('.sk-folding-cube').style.display = 'none'
      document.querySelector('.main').style.display = 'block'
      document.querySelector('.main').style.opacity = '1'
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

getContent()