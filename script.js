const adminBtn = document.getElementById('adminBtn');
const adminPanel = document.getElementById('adminPanel');
const adminPassword = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const publicacionForm = document.getElementById('publicacionForm');
const tituloPublicacion = document.getElementById('tituloPublicacion');
const nuevaPublicacion = document.getElementById('nuevaPublicacion');
const mediaInput = document.getElementById('mediaInput');
const publicarBtn = document.getElementById('publicarBtn');
const publicaciones = document.getElementById('publicaciones');

// Añadir elementos para el control de fuente y negrita
const fontSelector = document.createElement('select');
fontSelector.id = 'fontSelector';
['Arial', 'Helvetica', 'Times New Roman', 'Courier'].forEach(font => {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font;
    fontSelector.appendChild(option);
});

const boldToggle = document.createElement('button');
boldToggle.id = 'boldToggle';
boldToggle.textContent = 'Negrita';

const formatControls = document.createElement('div');
formatControls.id = 'formatControls';
formatControls.appendChild(fontSelector);
formatControls.appendChild(boldToggle);

publicacionForm.insertBefore(formatControls, mediaInput);

let isBold = false;

boldToggle.addEventListener('click', () => {
    isBold = !isBold;
    nuevaPublicacion.style.fontWeight = isBold ? 'bold' : 'normal';
    boldToggle.style.fontWeight = isBold ? 'bold' : 'normal';
});

fontSelector.addEventListener('change', (e) => {
    nuevaPublicacion.style.fontFamily = e.target.value;
});

const PASSWORD = 'Pas_pepeS3cur1ty';
let intentosFallidos = 0;
let ultimoIntento = 0;

adminBtn.addEventListener('click', () => {
    adminPanel.classList.toggle('hidden');
});

loginBtn.addEventListener('click', () => {
    const ahora = Date.now();
    if (ahora - ultimoIntento < 24 * 60 * 60 * 1000 && intentosFallidos >= 5) {
        alert('Has excedido el número de intentos. Por favor, espera 24 horas antes de intentar nuevamente.');
        return;
    }

    if (adminPassword.value === PASSWORD) {
        publicacionForm.classList.remove('hidden');
        adminPassword.value = '';
        intentosFallidos = 0;
        document.body.classList.add('autenticado');
        cargarPublicaciones();
    } else {
        intentosFallidos++;
        ultimoIntento = ahora;
        alert(`Contraseña incorrecta. Intentos restantes: ${5 - intentosFallidos}`);
    }
});

function crearPublicacion(titulo, contenido, archivos, fecha = new Date(), font, bold) {
    const publicacion = document.createElement('div');
    publicacion.classList.add('publicacion');
    
    if (titulo) {
        const tituloElement = document.createElement('h2');
        tituloElement.textContent = titulo;
        publicacion.appendChild(tituloElement);
    }
    
    if (contenido) {
        const texto = document.createElement('p');
        texto.textContent = contenido;
        texto.style.fontFamily = font;
        texto.style.fontWeight = bold ? 'bold' : 'normal';
        publicacion.appendChild(texto);
    }
    
    if (archivos && archivos.length > 0) {
        for (const archivo of archivos) {
            if (archivo.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(archivo);
                publicacion.appendChild(img);
            } else if (archivo.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(archivo);
                video.controls = true;
                publicacion.appendChild(video);
            }
        }
    }

    const fechaElement = document.createElement('p');
    fechaElement.classList.add('fecha-publicacion');
    fechaElement.textContent = `Publicado el: ${fecha.toLocaleString()}`;
    publicacion.appendChild(fechaElement);

    const acciones = document.createElement('div');
    acciones.classList.add('acciones');

    const editarBtn = document.createElement('button');
    editarBtn.textContent = 'Editar';
    editarBtn.addEventListener('click', () => editarPublicacion(publicacion));

    const borrarBtn = document.createElement('button');
    borrarBtn.textContent = 'Borrar';
    borrarBtn.addEventListener('click', () => borrarPublicacion(publicacion));

    acciones.appendChild(editarBtn);
    acciones.appendChild(borrarBtn);
    publicacion.appendChild(acciones);

    return publicacion;
}

function editarPublicacion(publicacion) {
    const titulo = publicacion.querySelector('h2')?.textContent || '';
    const contenido = publicacion.querySelector('p:not(.fecha-publicacion)');
    const contenidoTexto = contenido?.textContent || '';
    const font = contenido?.style.fontFamily || 'Arial';
    const bold = contenido?.style.fontWeight === 'bold';

    tituloPublicacion.value = titulo;
    nuevaPublicacion.value = contenidoTexto;
    fontSelector.value = font;
    nuevaPublicacion.style.fontFamily = font;
    isBold = bold;
    nuevaPublicacion.style.fontWeight = bold ? 'bold' : 'normal';
    boldToggle.style.fontWeight = bold ? 'bold' : 'normal';

    publicarBtn.textContent = 'Actualizar';
    publicarBtn.onclick = () => {
        const nuevoTitulo = tituloPublicacion.value.trim();
        const nuevoContenido = nuevaPublicacion.value.trim();

        if (nuevoTitulo) {
            publicacion.querySelector('h2').textContent = nuevoTitulo;
        }
        if (nuevoContenido) {
            const contenidoElement = publicacion.querySelector('p:not(.fecha-publicacion)');
            contenidoElement.textContent = nuevoContenido;
            contenidoElement.style.fontFamily = fontSelector.value;
            contenidoElement.style.fontWeight = isBold ? 'bold' : 'normal';
        }

        tituloPublicacion.value = '';
        nuevaPublicacion.value = '';
        nuevaPublicacion.style.fontFamily = 'Arial';
        nuevaPublicacion.style.fontWeight = 'normal';
        isBold = false;
        boldToggle.style.fontWeight = 'normal';
        publicarBtn.textContent = 'Publicar';
        publicarBtn.onclick = publicarNuevo;
        
        guardarPublicaciones();
        cargarPublicaciones();
    };
}

function borrarPublicacion(publicacion) {
    if (confirm('¿Estás seguro de que quieres borrar esta publicación?')) {
        publicacion.remove();
        guardarPublicaciones();
        cargarPublicaciones();
    }
}

function publicarNuevo() {
    const titulo = tituloPublicacion.value.trim();
    const contenido = nuevaPublicacion.value.trim();
    const archivos = mediaInput.files;
    const font = fontSelector.value;

    if (titulo || contenido || archivos.length > 0) {
        const publicacion = crearPublicacion(titulo, contenido, archivos, new Date(), font, isBold);
        publicaciones.prepend(publicacion);
        tituloPublicacion.value = '';
        nuevaPublicacion.value = '';
        mediaInput.value = '';
        nuevaPublicacion.style.fontFamily = 'Arial';
        nuevaPublicacion.style.fontWeight = 'normal';
        isBold = false;
        boldToggle.style.fontWeight = 'normal';
        
        guardarPublicaciones();
        cargarPublicaciones();
    }
}

publicarBtn.onclick = publicarNuevo;

function cargarPublicaciones() {
    const publicacionesGuardadas = JSON.parse(localStorage.getItem('publicaciones')) || [];
    publicaciones.innerHTML = ''; // Limpia las publicaciones existentes
    publicacionesGuardadas.forEach(pub => {
        const publicacion = document.createElement('div');
        publicacion.classList.add('publicacion');
        publicacion.innerHTML = pub;
        publicaciones.appendChild(publicacion);
        
        // Restaurar los controles de video
        const videos = publicacion.querySelectorAll('video');
        videos.forEach(video => {
            video.controls = true;
        });

        // Solo añadir botones de editar y borrar si el usuario está autenticado
        if (document.body.classList.contains('autenticado')) {
            const editarBtn = publicacion.querySelector('.acciones button:first-child');
            const borrarBtn = publicacion.querySelector('.acciones button:last-child');
            if (editarBtn) editarBtn.addEventListener('click', () => editarPublicacion(publicacion));
            if (borrarBtn) borrarBtn.addEventListener('click', () => borrarPublicacion(publicacion));
        } else {
            const acciones = publicacion.querySelector('.acciones');
            if (acciones) acciones.remove();
        }
    });
}

function guardarPublicaciones() {
    const publicacionesActuales = Array.from(publicaciones.children).map(p => p.outerHTML);
    localStorage.setItem('publicaciones', JSON.stringify(publicacionesActuales));
}

// Configuración de particles.js
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 6,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
            resize: true
        },
        modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 }
        }
    },
    retina_detect: true
});

// Cargar publicaciones al iniciar la página
document.addEventListener('DOMContentLoaded', cargarPublicaciones);

// Efecto de desplazamiento suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
