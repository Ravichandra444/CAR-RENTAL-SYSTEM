const defaultCars=[
{id:1,brand:"Toyota",model:"Camry",type:"Sedan",price:2200,emoji:"🚘",available:true},
{id:2,brand:"Hyundai",model:"Creta",type:"SUV",price:2600,emoji:"🚙",available:true},
{id:3,brand:"Honda",model:"City",type:"Sedan",price:2000,emoji:"🚗",available:true},
{id:4,brand:"Kia",model:"Seltos",type:"SUV",price:2500,emoji:"🚙",available:true},
{id:5,brand:"Mahindra",model:"Thar",type:"SUV",price:3000,emoji:"🚙",available:true},
{id:6,brand:"Tata",model:"Nexon",type:"SUV",price:2300,emoji:"🚗",available:true}
];

if(!localStorage.getItem("cars")) localStorage.setItem("cars",JSON.stringify(defaultCars));
if(!localStorage.getItem("users")) localStorage.setItem("users",JSON.stringify([]));
if(!localStorage.getItem("bookings")) localStorage.setItem("bookings",JSON.stringify([]));

const $=s=>document.querySelector(s);
const get=k=>JSON.parse(localStorage.getItem(k)||"[]");
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const currentUser=()=>localStorage.getItem("currentUser");

function openModal(html){$("#modalContent").innerHTML=html;$("#modal").classList.remove("hidden")}
function closeModal(){$("#modal").classList.add("hidden")}
$("#closeModal").onclick=closeModal;

function renderCars(filter=""){
  const cars=get("cars").filter(c=>(c.brand+" "+c.model).toLowerCase().includes(filter.toLowerCase()));
  $("#carGrid").innerHTML=cars.map(c=>`<article class="card">
    <div class="car-img">${c.emoji}</div><div class="card-body">
    <h3>${c.brand} ${c.model}</h3><p class="muted">${c.type} • ${c.available?"Available":"Unavailable"}</p>
    <div class="price">₹${c.price}<span class="muted">/day</span></div>
    <button class="btn" onclick="bookCar(${c.id})" ${c.available?"":"disabled"}>${c.available?"Book Now":"Unavailable"}</button>
    </div></article>`).join("");
}
$("#search").oninput=e=>renderCars(e.target.value);

function loginForm(){
 openModal(`<form class="form" onsubmit="login(event)"><h2>User Login</h2><input id="email" type="email" placeholder="Email" required><input id="password" type="password" placeholder="Password" required><button class="btn">Login</button><p>New user? <a href="#" onclick="signupForm()">Create account</a></p></form>`);
}
function signupForm(){
 openModal(`<form class="form" onsubmit="signup(event)"><h2>Create Account</h2><input id="name" placeholder="Full name" required><input id="email" type="email" placeholder="Email" required><input id="password" type="password" placeholder="Password" required><button class="btn">Sign Up</button></form>`);
}
function signup(e){e.preventDefault();let u=get("users");let email=$("#email").value;if(u.some(x=>x.email===email))return alert("Account already exists.");u.push({name:$("#name").value,email,password:$("#password").value});set("users",u);alert("Signup successful. Please login.");loginForm()}
function login(e){e.preventDefault();let u=get("users").find(x=>x.email===$("#email").value&&x.password===$("#password").value);if(!u)return alert("Invalid email or password.");localStorage.setItem("currentUser",u.email);closeModal();$("#authBtn").textContent="Logout";alert("Login successful!")}
$("#authBtn").onclick=()=>currentUser()?(localStorage.removeItem("currentUser"),$("#authBtn").textContent="Login",alert("Logged out.")):loginForm();

function bookCar(id){
 if(!currentUser()){alert("Please login first.");return loginForm()}
 const car=get("cars").find(c=>c.id===id);
 openModal(`<form class="form" onsubmit="confirmBooking(event,${id})"><h2>Book ${car.brand} ${car.model}</h2><label>Start Date</label><input id="start" type="date" required><label>End Date</label><input id="end" type="date" required><button class="btn">Confirm Booking</button></form>`);
}
function confirmBooking(e,id){
 e.preventDefault();const start=$("#start").value,end=$("#end").value;
 if(new Date(end)<new Date(start))return alert("End date must be after start date.");
 let b=get("bookings");const car=get("cars").find(c=>c.id===id);
 b.push({id:Date.now(),user:currentUser(),car:`${car.brand} ${car.model}`,start,end,status:"Confirmed"});
 set("bookings",b);closeModal();renderBookings();alert("Booking confirmed!");
}
function renderBookings(){
 const b=get("bookings").filter(x=>x.user===currentUser());
 $("#bookingList").innerHTML=b.length?b.map(x=>`<div class="booking"><div><b>${x.car}</b><br><span class="muted">${x.start} → ${x.end}</span></div><span class="status">${x.status}</span></div>`).join(""):`<div class="empty">Login to view your bookings.</div>`;
}

function adminLogin(){
 openModal(`<form class="form" onsubmit="admin(event)"><h2>Admin Login</h2><input id="auser" placeholder="Username" required><input id="apass" type="password" placeholder="Password" required><button class="btn">Open Dashboard</button><p class="muted">Demo: admin / admin123</p></form>`);
}
$("#adminBtn").onclick=adminLogin;

function admin(e){
 e.preventDefault();if($("#auser").value!=="admin"||$("#apass").value!=="admin123")return alert("Invalid admin credentials.");
 closeModal();openAdmin();
}
function openAdmin(){
 const cars=get("cars"),b=get("bookings");
 openModal(`<div class="admin"><h2>Admin Dashboard</h2><p><b>${cars.length}</b> vehicles • <b>${b.length}</b> bookings</p>
 <h3>Vehicle Inventory</h3><table class="admin-table"><tr><th>Car</th><th>Price/day</th><th>Action</th></tr>${cars.map(c=>`<tr><td>${c.brand} ${c.model}</td><td>₹${c.price}</td><td><button class="btn small" onclick="deleteCar(${c.id})">Delete</button></td></tr>`).join("")}</table>
 <br><button class="btn" onclick="addCarForm()">+ Add Vehicle</button></div>`);
}
function addCarForm(){openModal(`<form class="form" onsubmit="addCar(event)"><h2>Add Vehicle</h2><input id="brand" placeholder="Brand" required><input id="model" placeholder="Model" required><input id="price" type="number" placeholder="Price/day" required><select id="type"><option>Sedan</option><option>SUV</option></select><button class="btn">Add Vehicle</button></form>`)}
function addCar(e){e.preventDefault();let c=get("cars");c.push({id:Date.now(),brand:$("#brand").value,model:$("#model").value,type:$("#type").value,price:Number($("#price").value),emoji:"🚘",available:true});set("cars",c);openAdmin();renderCars()}
function deleteCar(id){set("cars",get("cars").filter(c=>c.id!==id));openAdmin();renderCars()}

renderCars();renderBookings();if(currentUser())$("#authBtn").textContent="Logout";
