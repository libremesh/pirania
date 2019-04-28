const  userLang = navigator.language || navigator.userLanguage
const lang = userLang.split('-')[0] || userLang || 'en'

const int = {
  pt: {
    selectVoucher: 'Selecione o aparelho e entre o voucher',
    createNewVoucher: 'Criar novo voucher',
    createManyVouchers: 'Criar muitos vouchers',
    changeContent: 'Mudar o conteúdo',
    title: 'Título',
    welcome: 'Bem vindo',
    body: 'Texto principal',
    backgroundColor: 'Cor de fundo',
    listVouchers: 'Listar vouchers',
    success: 'Sucesso',
    error: 'Erro',
    invalid: 'Código incorreto',
    wrongPassword: 'Senha incorreta',
    name: 'Nome',
    days: 'Dias',
    numberOfVouchers: 'Número de vouchers',
  },
  es: {
    selectVoucher: 'Selecione el dispositivo',
    createNewVoucher: 'Crear nuevo voucher',
    createManyVouchers: 'Crear muchos vouchers',
    changeContent: 'Cambiar el contenido',
    title: 'Título',
    welcome: 'Bienvenido',
    body: 'Texto principal',
    backgroundColor: 'Color de fondo',
    listVouchers: 'Listar vouchers',
    success: 'Sucesso',
    error: 'Erro',
    invalid: 'Código incorrecto',
    wrongPassword: 'Contraseña incorrecta',
    name: 'Nombre',
    days: 'Dias',
    numberOfVouchers: 'Cantidad de vouchers',
  },
  en: {
    selectVoucher: 'Select a device and enter a voucher',
    createNewVoucher: 'Create new voucher',
    createManyVouchers: 'Create many vouchers',
    changeContent: 'Change content',
    title: 'Title',
    welcome: 'Welcome text',
    body: 'Main text',
    backgroundColor: 'Background color',
    listVouchers: 'List vouchers',
    success: 'Success',
    error: 'Error',
    invalid: 'Invalid voucher',
    wrongPassword: 'Wrong password',
    name: 'Nome',
    days: 'Dias',
    numberOfVouchers: 'Number of vouchers',
  }
}

Object.keys(int[lang]).map(text => {
  Array.from(document.getElementsByClassName(`int-${text}`)).map(element => element.innerHTML = int[lang][text])
})