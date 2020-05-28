let express = require('express');
let bodyparser = require('body-parser');
let cors = require('cors');
let path = require('path');
let hbs = require('express-handlebars');

let PORT = process.env.PORT || 4200;

let app = express();

//CONFIGURACION DE HANDLEBARS COMO MOTOR DE PLANTILLAS
app.engine('hbs', hbs({ defaultLayout: 'base', extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '/public')));

//MIDDLEWARES
app.use(cors());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: false }));

//ENRUTADORES
const indexRouter = require('./routes/index');
app.use('/index', indexRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})

