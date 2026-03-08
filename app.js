const API = "http://localhost:3000"

async function login(){

const res = await fetch(API+"/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:email.value,
password:password.value
})
})

const data = await res.json()

localStorage.token = data.token

location.href="solicitudes.html"
}

async function cargar(){

const res = await fetch(API+"/solicitudes",{
headers:{
Authorization:"Bearer "+localStorage.token
}
})

const data = await res.json()

tabla.innerHTML=""

data.forEach(s=>{

tabla.innerHTML+=`
<tr>
<td>${s.id}</td>
<td>${s.titulo}</td>
<td>${s.estatus}</td>
<td>
<button onclick="cerrar(${s.id})">Cerrar</button>
<button onclick="eliminar(${s.id})">Eliminar</button>
</td>
</tr>
`

})

}

async function crear(){

const titulo = prompt("Titulo")
const descripcion = prompt("Descripcion")

await fetch(API+"/solicitudes",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+localStorage.token
},
body:JSON.stringify({titulo,descripcion})
})

cargar()

}

async function cerrar(id){

await fetch(API+"/solicitudes/"+id+"/close",{
method:"PATCH",
headers:{
Authorization:"Bearer "+localStorage.token
}
})

cargar()

}

async function eliminar(id){

if(!confirm("¿Eliminar solicitud?")) return;

await fetch(API+"/solicitudes/"+id,{
method:"DELETE",
headers:{
Authorization:"Bearer "+localStorage.token
}
})

cargar()

}