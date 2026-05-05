import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCrg-aB6l0Y4Ym4mJuQnDsvTFgzQOttc7M",
  authDomain: "ahorro-familiar-f6050.firebaseapp.com",
  databaseURL: "https://ahorro-familiar-f6050-default-rtdb.firebaseio.com",
  projectId: "ahorro-familiar-f6050",
  storageBucket: "ahorro-familiar-f6050.firebasestorage.app",
  messagingSenderId: "814092497761",
  appId: "1:814092497761:web:b3c3847e4b75623ec18b20"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const reglas = [
    "NO JETEAR SIN CONSENTIMIENTO", "NO DEJAR LA LUZ, TELEVISOR, CARGADOR ENCENDIDO",
    "MANTENER LOS CUARTOS LIMPIOS", "LEVANTARSE TEMPRANO", "DESPUES DE LAVAR ROPA LIMPIAR EL PISO",
    "PONER LAS COSAS EN SU LUGAR", "LAS COSAS QUE SE UTILIZAN DEJAR LIMPIAS",
    "NO URGAR CELULARES EN LA MESA MIENTRAS SE COME", "LIMPIAR EL BAÑO DESPUES DE BAÑARSE",
    "HIGIENE EN EL BAÑO", "ACABAR LAS COMIDAS", "NO DEJAR LA ROPA EN EL TENDEDERO POR DIAS",
    "PEDIR LAS COSAS PRESTADAS", "NO AGARRARSE CON COSAS AJENAS", "NO GRITAR NI AMOTINARSE",
    "HACER LA LIMPIEZA DE CALLADO", "NO MENTIR (PRUEBAS)", "NO NEGAR LAS SITUACIONES MALAS QUE SE HACE",
    "NO FALTAR EN RESPETO ENTRE TODOS", "LIMPIAR LA MESA ANTES DE ACOMODAR",
    "CUANDO SE SACA VIVERES NO ECHAR AL SUELO", "NO ENSUCIAR LA ALFOMBRA/AUTO CUANDO SE COME"
];

const familiares = ["SELENA", "VANESA", "ALEJANDRA", "GUSTAVO", "FIDEL", "RUTH"];
const inicialesFam = ["F", "R", "V", "S", "G", "A"];
let encargadoSemanal = "";

// 1. Obtener encargado actual
onValue(ref(db, 'configuracion/encargado_actual'), (snapshot) => {
    encargadoSemanal = snapshot.val();
});

// 2. Dibujar Tabla
const cuerpo = document.getElementById('cuerpo-tabla');
reglas.forEach((regla, rIndex) => {
    let fila = `<tr><td class="regla-texto">${rIndex + 1}. ${regla}</td>`;
    familiares.forEach((_, fIndex) => {
        inicialesFam.forEach((letra) => {
            const id = `r${rIndex}_f${fIndex}_${letra}`;
            fila += `<td id="${id}" onclick="manejarClick('${id}', 1)" oncontextmenu="manejarClick('${id}', -1); return false;">0</td>`;
        });
    });
    fila += `</tr>`;
    cuerpo.innerHTML += fila;
});

// 3. Modificar datos y CALCULAR DINERO
window.manejarClick = (id, cambio) => {
    const user = auth.currentUser;
    if (!user || user.email !== encargadoSemanal) {
        alert(`❌ ACCESO DENEGADO. Solo el encargado (${encargadoSemanal}) puede anotar.`);
        return;
    }
    const celda = document.getElementById(id);
    const nuevoValor = Math.max(0, parseInt(celda.innerText) + cambio);
    set(ref(db, 'faltas/' + id), nuevoValor);
};

// Sincronización y Suma Total
onValue(ref(db, 'faltas'), (snapshot) => {
    const datos = snapshot.val() || {};
    let sumaFaltas = 0;
    
    // Resetear celdas visualmente antes de cargar (por si se borró algo)
    document.querySelectorAll('td:not(.regla-texto)').forEach(td => td.innerText = "0");

    Object.keys(datos).forEach(id => {
        const celda = document.getElementById(id);
        if(celda) {
            celda.innerText = datos[id];
            sumaFaltas += parseInt(datos[id]);
        }
    });

    // CÁLCULO DE DINERO: Aquí cambias el 1 por el valor de la multa
    const valorMulta = 1; 
    document.getElementById('total-dinero').innerText = sumaFaltas * valorMulta;
});

// 4. Autenticación
window.iniciarSesion = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert("Error: " + err.message));
};

window.cerrarSesion = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    const loginForm = document.getElementById('login-form');
    const adminInfo = document.getElementById('admin-info');
    if (user) {
        loginForm.style.display = 'none';
        adminInfo.style.display = 'block';
        document.getElementById('user-email').innerText = user.email;
        if(user.email === "jesus@familia.com") document.getElementById('btn-reinicio').style.display = 'inline-block';
    } else {
        loginForm.style.display = 'block';
        adminInfo.style.display = 'none';
    }
});

window.reiniciarCiclo = () => {
    if(confirm("¿Seguro que quieres perdonar las faltas? 😇")) {
        set(ref(db, 'faltas'), null);
        location.reload();
    }
};