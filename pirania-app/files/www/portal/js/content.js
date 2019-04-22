let content = {
  backgroundColor: 'white',
  title: '',
  welcome: '',
  body: '',
  logo: '',
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
      if (contentLogo) contentLogo.src = logo
      if (contentTitle) contentTitle.innerHTML = title
      if (contentWelcome) contentWelcome.innerHTML = welcome
      if (contentBody) contentBody.innerHTML = body
      document.querySelector('.sk-folding-cube').style.display = 'none'
      document.querySelector('.main').style.display = 'block'
      document.querySelector('.main').style.opacity = '1'
    })
    .catch(err => {
      document.getElementById('error').innerHTML = 'Erro no Ubus'
    })
}

getContent()