var express  = require('express'); 
var connection = require('./config');
var app = express();
var port = 8080; 
var path = require('path');
var bodyParser = require('body-parser'); 
var userHandler = require('./userHandler');


// middleware для обработки данных в формате JSON 
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); 

// Маршрут для отображения пользователей
app.get('/users', function(req, res) {
    userHandler.getAllUsers(req, res); // Вызов функции для получения всех пользователей
});


app.listen(port, function() { 
	console.log('app listening on port: 8080'); 
}); 



app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '../html/home.html'));
});


app.get('/login', function(req, res){
    res.sendFile(path.join(__dirname, '../html/login.html'));
});

app.get('/register', function(req, res){
    res.sendFile(path.join(__dirname, '../html/register.html'));
});


app.get('/news', function(req, res){
    res.sendFile(path.join(__dirname, '../html/news.html'));
});

// Маршрут для отображения пользователей
app.get('/users', function(req, res) {
    userHandler.getAllUsers(req, res); // Вызов функции для получения всех пользователей
});



app.post('/submit-login', function(req, res){
	var login = req.body.login;
	var password = req.body.password;

	// Сначала проверяем, есть ли учетные данные в таблице admins
var adminSql = 'SELECT * FROM admins WHERE login = ? AND password = ?';
connection.execute(adminSql, [login, password], (err, results) => {
	if (err) {
		console.error(err);
		return res.status(500).send('Ошибка при входе в систему');
	}

	if (results.length > 0) {
		// Если пользователь - администратор, добавляем его в таблицу users
		var insertSql = 'INSERT INTO users (login, password) VALUES (?, ?)';
		connection.execute(insertSql, [login, password], (err) => {
			if (err) {
				console.error(err);
				return res.status(500).send('Ошибка при добавлении пользователя');
			}
			return res.send('Вы вошли как администратор и добавлены в users!');
		});
	} else {
		// Если нет, перенаправляем на главную страницу
		return res.redirect('/');
	}
});
});





app.post('/submit-register', (req, res) => {
    var name = req.body.name;
    var login = req.body.login;
    var password = req.body.password;


	console.log('Логин:', login, 'Пароль:', password); 
 
    // Проверка, существует ли уже логин
    var checkSql = 'SELECT * FROM users WHERE login = ?';
    connection.execute(checkSql, [login], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Ошибка при проверке логина');
            return;
        }

        if (results.length > 0) {
            // Логин уже существует
            res.status(409).send('Логин уже существует');
            return;
        }

        // Если логин не существует, добавляем нового пользователя
        var insertSql = 'INSERT INTO users (name, login, password) VALUES (?, ?, ?)';
        connection.execute(insertSql, [name, login, password], (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Ошибка при регистрации');
                return;
            }

            res.send('Регистрация успешна!')
        });
    });
});


process.on('SIGINT', function() {
    connection.end(function(err) {
        if (err) throw err;
        console.log('Пул соединений закрыт.');
        process.exit(0);
    });
});

