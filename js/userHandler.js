

const mysql = require('mysql2');
const connection = require('./config'); // Путь к вашему файлу с конфигурацией БД

module.exports = {
    // Получение всех пользователей и отображение в виде таблицы
    getAllUsers: function (req, res) {
        var self = this;
        self.tableRows = ``;

        connection.query("SELECT * FROM users", function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("Ошибка базы данных");
                return;
            }

            results.forEach(function(row) {
                self.tableRows += `<tr>
                    <td>${row.name}</td>
                    <td>${row.login}</td>
                    <td>${row.password}</td>
                </tr>`;
            });

            console.log('show_users');
            res.render('users', { data: self.tableRows });
        });
    }
};
