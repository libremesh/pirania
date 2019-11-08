let loader = document.createElement('div')
loader.className = 'lds-ring'
loader.appendChild(document.createElement('div'))
loader.appendChild(document.createElement('div'))
loader.appendChild(document.createElement('div'))
loader.appendChild(document.createElement('div'))

let errorElem = document.getElementById('error')
let result = document.getElementById('result')
const show = elem => elem.classList.remove('hidden')
const hide = elem => (elem.className += ' hidden')

let content = {
  backgroundColor: 'white',
  title: '',
  welcome: '',
  body: '',
  logo: ''
}

function getContent () {
  ubusFetch('pirania-app', 'read_content')
    .then(res => {
      content = res
      const { backgroundColor, title, welcome, body, logo } = content
      document.body.style.backgroundColor = backgroundColor
      const contentLogo = document.getElementById('content-logo')
      const contentTitle = document.getElementById('content-title')
      const contentWelcome = document.getElementById('content-welcome')
      const contentBody = document.getElementById('content-body')
      if (contentLogo) {
        show(contentLogo)
        contentLogo.src = logo
      }
      if (contentTitle) contentTitle.innerHTML = title
      if (contentWelcome) contentWelcome.innerHTML = welcome
      if (contentBody) contentBody.innerHTML = body
    })
    .catch(err => {
      document.getElementById('error').innerHTML = int[lang].error
    })
}

getContent()
