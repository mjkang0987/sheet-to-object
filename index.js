const express = require('express');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');
const xlsx = require('xlsx');
const app = express();
const path = require('path');
const _fiber = require('fibers');
const fs = require('fs');
const os = require('os');
const sass = require('sass');
const port = 3000;
const interfaces = os.networkInterfaces();
const ips = Object.keys(interfaces);
let localIP;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  limit   : '150mb',
  extended: false,
}));

const STATES = {
  BEST     : 'best',
  BRAND    : 'brand',
  KEYWORD  : 'keyword',
  RECOMMEND: 'recommend'
};

const BOOLEAN = {
  isBest     : false,
  isBrand    : false,
  isKeyword  : false,
  isRecommend: false
};

app.get('/', (req, res, next) => {
  res.sendFile(`${__dirname}/src/views/index.html`);
});

const style = './src/styles/styles.scss';

const renderSass = _ => {
  return sass.renderSync({
    file: style,
    outputStyle: 'expanded',
    fiber: _fiber
  })
}

const changeWatch = _ => {
  fs.watchFile(style, async _ => {
    const changeStyle = await renderSass();
    await fs.writeFile('./src/styles/styles.css', changeStyle.css.toString(), _ => {});
  });
};

changeWatch()

app.use('/src/styles', express.static(path.join(__dirname, '/src/styles')));
app.use('/src/scripts', express.static(path.join(__dirname, '/src/scripts')));

app.post('/', (req, res, next) => {
  const resData = {data: []};
  const {data} = resData;

  const form = new multiparty.Form({
    autoFiles: true,
  });

  form.on('file', (name, file) => {
    const fileName = file.originalFilename;
    const workbook = xlsx.readFile(file.path);
    const sheetNames = Object.keys(workbook.Sheets).filter(sheet => sheet !== 'guide');

    Object.keys(STATES)
      .map(state => BOOLEAN[`is${state.toLowerCase()
        .replace(/(^|\s)\S/g, firstString => firstString.toUpperCase())}`] = fileName.includes(state.toLowerCase()));

    const {isBest, isBrand, isKeyword, isRecommend} = BOOLEAN;

    const generatorCuration = _ => {
      sheetNames.map((sheet, i) => {
        const products = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

        products.sort((a, b) => {
          return +(a.index > b.index) || +(a.index === b.index) - 1;
        });

        products.map(product => {
          product.price = {
            origin: product.origin === undefined ? 0 : product.origin,
            sale  : product.sale === undefined ? 0 : product.sale
          };

          product.badge = product.badge ? product.badge.replace(/(\s*)/g, '').split(',') : [];

          delete product.origin;
          delete product.sale;
        });

        data[i] = {
          category: sheet,
          products
        };
      });
    };

    const generatorBrand = _ => {
      const products = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

      products.map(product => {
        product.href = product.href.replace(/(\r\n\t|\n|\r\t)/gm, '').replace(/(\s*)/g, '').split(',');
        product.productImg = product.productImg.replace(/(\s*)/g, '').split(',');
      });

      data[0] = {
        products
      };
    };

    const generatorKeyword = _ => {
      const products = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

      products.sort((a, b) => {
        return +(a.index > b.index) || +(a.index === b.index) - 1;
      });

      data[0] = {
        products
      };
    };

    if (isRecommend || isBest) generatorCuration();
    if (isKeyword) generatorKeyword();
    if (isBrand) generatorBrand();
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
