const express = require("express");
const cors = require("cors");

const app = express();
const db = require("./database");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "secretkey";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API funcionando");
});

app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});

app.post("/login", (req,res)=>{

    const {email,password} = req.body;

    db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err,user)=>{

            if(!user){
                return res.status(401).json({error:"Usuario no encontrado"});
            }

            const valid = await bcrypt.compare(password,user.password);

            if(!valid){
                return res.status(401).json({error:"Password incorrecto"});
            }

            const token = jwt.sign({
                id:user.id,
                role:user.role,
                accountId:user.accountId
            }, SECRET);

            res.json({token});
        }
    );
});

function auth(req,res,next){

    const header = req.headers.authorization;

    if(!header){
        return res.status(401).json({error:"Token requerido"});
    }

    const token = header.split(" ")[1];

    try{
        const decoded = jwt.verify(token,SECRET);
        req.user = decoded;
        next();
    }
    catch{
        res.status(401).json({error:"Token inválido"});
    }
}

app.post("/solicitudes", auth, (req,res)=>{

    const {titulo,descripcion} = req.body;

    if(req.user.role !== "client"){
        return res.status(403).json({error:"Solo clientes"});
    }

    db.run(`
    INSERT INTO solicitudes
    (titulo,descripcion,estatus,createdAt,ownerId,accountId)
    VALUES (?,?,?,?,?,?)
    `,
    [
        titulo,
        descripcion,
        "open",
        new Date().toISOString(),
        req.user.id,
        req.user.accountId
    ],
    function(err){

        res.json({
            id:this.lastID
        });
    });

});

app.get("/solicitudes", auth, (req,res)=>{

    if(req.user.role === "client"){

        db.all(
        "SELECT * FROM solicitudes WHERE accountId = ?",
        [req.user.accountId],
        (err,rows)=>{

            res.json(rows);
        });

    }else{

        db.all(
        "SELECT * FROM solicitudes",
        [],
        (err,rows)=>{

            res.json(rows);
        });

    }

});

app.patch("/solicitudes/:id/close", auth, (req,res)=>{

    if(req.user.role === "client"){
        return res.status(403).json({error:"No permitido"});
    }

    db.run(
        "UPDATE solicitudes SET estatus='closed' WHERE id=?",
        [req.params.id],
        function(){

            res.json({updated:this.changes});
        }
    );

});

app.patch("/solicitudes/:id/open", auth, (req,res)=>{

    if(req.user.role === "client"){
        return res.status(403).json({error:"No permitido"});
    }

    db.run(
        "UPDATE solicitudes SET estatus='open' WHERE id=?",
        [req.params.id],
        function(){
            res.json({updated:this.changes});
        }
    );

});

app.delete("/solicitudes/:id", auth, (req,res)=>{

    if(req.user.role !== "admin"){
        return res.status(403).json({error:"Solo admin"});
    }

    db.run(
        "DELETE FROM solicitudes WHERE id=?",
        [req.params.id],
        function(){

            res.json({deleted:this.changes});
        }
    );

});