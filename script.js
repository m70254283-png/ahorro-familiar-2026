// CONFIGURACIÓN DE TU IMAGEN image_3881ef.png
const firebaseConfig = {
  apiKey: "AIzaSyCrg-aB6l0Y4Ym4mJuQnDsvTFgzQOttc7M",
  authDomain: "ahorro-familiar-f6050.firebaseapp.com",
  databaseURL: "https://ahorro-familiar-f6050-default-rtdb.firebaseio.com", // URL corregida
  projectId: "ahorro-familiar-f6050",
  storageBucket: "ahorro-familiar-f6050.firebasestorage.app",
  messagingSenderId: "814092497761",
  appId: "1:814092497761:web:b3c3847e4b75623ec18b20",
  measurementId: "G-F7MHCHZTCX"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const listaReglas = [
    "1. NO JETEAR SIN CONSENTIMIENTO", "2. NO DEJAR LA LUZ, TELEVISOR, CARGADOR ENCENDIDO",
    "3. MANTENER LOS CUARTOS LIMPIOS", "4. LEVANTARSE TEMPRANO",
    "5. DESPUES DE LAVAR ROPA LIMPIAR EL PISO", "6. PONER LAS COSAS EN SU LUGAR",
    "7. LAS COSAS QUE SE UTILIZAN DEJAR LIMPIAS", "8. NO URGAR CELULARES EN LA MESA",
    "9. LIMPIAR EL BAÑO DESPUES DE BAÑARSE", "10. HIGIENE EN EL BAÑO",
    "11. ACABAR LAS COMIDAS", "12. NO DEJAR LA ROPA EN EL TENDEDERO",
    "13. PEDIR LAS COSAS PRESTADAS", "14. NO AGARRARSE CON COSAS AJENAS",
    "15. NO GRITAR NI AMOTINARSE", "16. HACER LA LIMPIEZA DE CALLADO",
    "17. NO MENTIR (PRUEBAS)", "18. NO NEGAR LAS SITUACIONES MALAS",
    "19. NO FALTAR EN RESPETO ENTRE TODOS", "20. LIMPIAR LA MESA ANTES DE ACOMODAR",
    "21. CUANDO SE SACA VIVERES NO HECHAR AL SUELO", "22. NO ENSUCIAR LA ALFOMBRA/AUTO"
];

const nombresColores = ["col-selena", "col-vanesa", "col-alejandra", "col-gustavo", "col-ruth", "col-fidel"];
const cuerpoTabla = document.getElementById('tabla-cuerpo');

// Crear la tabla con IDs para la sincronización
listaReglas.forEach((texto, fIdx) => {
    const fila = document.createElement('tr');
    let contenido = `<td class="regla-nombre">${texto}</td>`;
    
    for (let p = 0; p < 6; p++) {
        for (let d = 0; d < 6; d++) {
            const idCelda = `f${fIdx}_p${p}_d${d}`;
            contenido += `<td id="${idCelda}" class="celda-falta ${nombresColores[p]}" 
                              onclick="enviarAFirebase('${idCelda}', 1)" 
                              oncontextmenu="enviarAFirebase('${idCelda}', -1); return false;">
                          </td>`;
        }
    }
    fila.innerHTML = contenido;
    cuerpoTabla.appendChild(fila);
});

// Enviar a la nube
function enviarAFirebase(id, cambio) {
    const ref = database.ref('faltas/' + id);
    ref.once('value').then((snap) => {
        let valor = (snap.val() || 0) + cambio;
        if (valor < 0) valor = 0;
        ref.set(valor);
    });
}

// Sincronizar en tiempo real
database.ref('faltas/').on('value', (snap) => {
    const datos = snap.val() || {};
    document.querySelectorAll('.celda-falta').forEach(celda => {
        const valor = datos[celda.id] || 0;
        celda.innerText = valor === 0 ? "" : valor;
        valor > 0 ? celda.classList.add('con-falta') : celda.classList.remove('con-falta');
    });
    calcularAhorroTotal();
});

function calcularAhorroTotal() {
    let total = 0;
    document.querySelectorAll('.celda-falta').forEach(c => {
        if (c.innerText !== "") total += parseInt(c.innerText);
    });
    document.getElementById('total-dinero').innerText = total.toFixed(2) + " Bs.";
}