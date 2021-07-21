const express = require('express');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');
const xlsx = require('xlsx');
const app = express();
const os = require('os');
const port = 3000;
const interfaces = os.networkInterfaces();
const ips = Object.keys(interfaces);
let localIP;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  limit   : '150mb',
  extended: false,
}));

app.get('/', (req, res, next) => {
  let contents = `<!DOCTYPE html>
    <html lang="ko">
    <body>
      <form action="/" method="POST" enctype="multipart/form-data">
        <input type="file" name="xlsx">
        <input type="submit">
      </form>
    </body>
    </html>`;
  res.send(contents);
});

app.post('/', (req, res, next) => {
  const resData = {data: []};
  const {data} = resData;

  const form = new multiparty.Form({
    autoFiles: true,
  });

  form.on('file', (name, file) => {
    const workbook = xlsx.readFile(file.path);
    const sheetNames = Object.keys(workbook.Sheets).filter(sheet => sheet !== 'guide');

    sheetNames.map((sheet, i) => {
      const products = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

      products.sort((a, b) => {
        return +(a.index > b.index) || +(a.index === b.index) - 1;
      });

      products.map(product => {
        product.price = {
          origin: product.origin === undefined ? 0 : product.origin,
          sale: product.sale === undefined ? 0 : product.sale
        }

        product.badge = product.badge ? product.badge.split(',') : [];

        delete product.origin;
        delete product.sale
      });

      console.log(products)
      data[i] = {
        category: sheet,
        products
      };
    })

  });

  form.on('close', () => {
    // console.log(resData)
    res.send(resData);
  });

  form.parse(req);
});

ips.map(ip => {
  interfaces[ip].filter(_ip => {
    if (_ip.family === 'IPv4' && _ip.internal === false) {
      localIP = _ip.address;
    }
  });
});

app.listen(port, _ => {
  console.log(`
(\\_(\\   ~ server started 🔥
(=' :')   http://${localIP}:${port}   
(,(')(')  http://localhost:${port}`);
});
