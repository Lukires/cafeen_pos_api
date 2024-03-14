const express = require('express')
const axios = require('axios');
const app = express()
const port = 9963
const swaggerUi = require('swagger-ui-express');
const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';

axios.defaults.headers = {
  'token': 'secret',
  'firmaid': 'secret',
  'accept': 'application/json'
};

axios.defaults.baseURL = 'https://api.onlinepos.dk/api'

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const get_sales = async (from, to) => {
  const body = {
    'from': parseInt(from),
    'to': parseInt(to),
  };
  return (await axios.post('/exportSales', body)).data;
}

app.get('/tequilatoday', async (req, res) => {
  let from = new Date();
  from.setHours(from.getHours() - 18);
  from = from.getTime() / 1000;
  const to = new Date().getTime() / 1000
  
  const sales = await get_sales(from, to);
  let jarana_amount = 0

  for (let i = 0; i < sales['sales'].length; i++) {
    sale = sales["sales"][i]
    if (sale['line']['product'] == 'Jerana Tequila') {
      jarana_amount += sale['line']['amount']
    }
  }

  return res.json({count: jarana_amount})
});

app.get('/products', (req, res) => { 
  axios.get('/getProducts').then(response => {res.json(response.data)})
});


swaggerAutogen(outputFile, ['app.js']).then(() => {
  // Serve Swagger UI at the root path '/'
  app.use('/', swaggerUi.serve);
  app.get('/', swaggerUi.setup(require('./swagger_output.json')));
});
