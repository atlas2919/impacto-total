document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nueva-noticia-form');
    const mensaje = document.getElementById('mensaje');
    const yearSpan = document.getElementById('year');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');

    // Actualizar el año en el pie de página
    yearSpan.textContent = new Date().getFullYear();

    // Función para crear el slug del título de la noticia
    function createSlug(titulo) {
        return titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    // Manejo de autenticación al enviar el formulario de inicio de sesión
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            loginMessage.textContent = 'Inicio de sesión exitoso';
            loginMessage.className = 'success';
            loginSection.style.display = 'none';
            adminSection.style.display = 'block';
        } catch (error) {
            console.error("Error al iniciar sesión: ", error);
            loginMessage.textContent = 'Usuario incorrecto';
            loginMessage.className = 'error';
            loginMessage.style.display = 'block';

            // Ocultar el mensaje de error después de 10 segundos
            setTimeout(() => {
                loginMessage.style.display = 'none';
            }, 10000);
        }
    });

    // Verificar el estado de autenticación al cargar la página
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loginSection.style.display = 'none';
            adminSection.style.display = 'block';
        } else {
            loginSection.style.display = 'block';
            adminSection.style.display = 'none';
        }
    });

    // Cerrar sesión al abandonar o recargar la página
    window.addEventListener('beforeunload', () => {
        firebase.auth().signOut().then(() => {
            console.log('Sesión cerrada al salir de la página.');
        }).catch((error) => {
            console.error("Error al cerrar sesión: ", error);
        });
    });

    // Manejo del evento de envío del formulario de noticias
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = form.titulo.value;
        const descripcion = form.descripcion.value;
        const cuerpo = form.cuerpo.value;
        const imagen = form.imagen.value;
        const categoria = form.categoria.value;
        const slug = createSlug(titulo); // Generar slug a partir del título

        if (!titulo || !descripcion || !cuerpo || !categoria) {
            mensaje.textContent = 'Por favor, completa todos los campos obligatorios.';
            mensaje.className = 'error';
            return;
        }

        try {
            const noticiasRef = db.collection('noticias');
            await noticiasRef.add({
                titulo,
                descripcion,
                cuerpo,
                imagen,
                categoria,
                slug,  // Agregar el campo slug
                fecha: firebase.firestore.FieldValue.serverTimestamp()
            });
            mensaje.textContent = 'Noticia agregada con éxito';
            mensaje.className = 'success';
            form.reset();
        } catch (error) {
            console.error("Error al agregar la noticia: ", error);
            mensaje.textContent = 'Error al agregar la noticia: ' + error.message;
            mensaje.className = 'error';
        }
    });
});
