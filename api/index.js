const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const config = {
  host: 'db',
  user: 'root',
  password: 'root',
  database: 'db',
  port: 3306,
};

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS people (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  )
`;

pool.query(createTableQuery, (err, results) => {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('Table created successfully');
  }
});

const fetchPerson = async () => {
  try {
    const response = await fetch('https://randomuser.me/api/');
    const data = await response.json();
    
    if(data.results.length) {
      return data.results[0];
    }

  } catch (err) {
    console.error(err);
    throw err
  }
};


const insertUser = async (callback) => {
  try {
    const person = await fetchPerson();
    const name = `${person.name.first} ${person.name.last}`;

    const query = 'INSERT INTO people(name) VALUES (?)';
    pool.query(query, [name], callback);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const selectUsers = (callback) => {
  const query = 'SELECT * FROM people';
  pool.query(query, callback);
};

app.get('/', async (req, res) => {
  await insertUser((err, results) => {
    if (err) {
      console.error('Error executing insert query:', err.message);
      return res.status(500).send('Internal Server Error');
    }

    selectUsers((err, results) => {
      if (err) {
        console.error('Error executing select query:', err.message);
        return res.status(500).send('Internal Server Error');
      }

      let table = '<table><tr><th>ID</th><th>Name</th></tr>';
      results.forEach((row) => {
        table += `<tr><td>${row.id}</td><td>${row.name}</td></tr>`;
      });

      table += '</table>';
      res.send('<h1>Full Cycle Rocks!</h1>' + table);    
    });
  });
});

process.on('exit', () => {
  pool.end((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.message);
    } else {
      console.log('Database connection closed');
    }
  });
});

process.on('SIGINT', () => {
  process.exit();
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
