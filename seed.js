const bcrypt = require("bcrypt");
const db = require("./database");

const password = bcrypt.hashSync("123456",10);

db.serialize(()=>{

db.run(`INSERT INTO accounts(name) VALUES ('Empresa1')`);
db.run(`INSERT INTO accounts(name) VALUES ('Empresa2')`);

db.run(`
INSERT INTO users(email,password,role,accountId)
VALUES ('admin@test.com','${password}','admin',1)
`);

db.run(`
INSERT INTO users(email,password,role,accountId)
VALUES ('empleado@test.com','${password}','employee',1)
`);

db.run(`
INSERT INTO users(email,password,role,accountId)
VALUES ('cliente1@test.com','${password}','client',1)
`);

db.run(`
INSERT INTO users(email,password,role,accountId)
VALUES ('cliente2@test.com','${password}','client',2)
`);

});

console.log("Seed ejecutado");