document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nueva-noticia-form');
    const deleteMessage = document.getElementById('delete-message');
    const yearSpan = document.getElementById('year');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const loginSection = document.getElementById('login-section');
    const adminOptions = document.getElementById('admin-options');
    const adminSection = document.getElementById('admin-section');
    const modifySection = document.getElementById('modify-section');
    const deleteSection = document.getElementById('delete-section');
    const noticiasListaModificar = document.getElementById('noticias-lista-modificar');
    const noticiasListaBorrar = document.getElementById('noticias-lista-borrar');

    const btnCrear = document.getElementById('btn-crear');
    const btnModificar = document.getElementById('btn-modificar');
    const btnBorrar = document.getElementById('btn-borrar');
    const btnRegresarCrear = document.getElementById('btn-regresar-crear');
    const btnRegresarModificar = document.getElementById('btn-regresar-modificar');
    const btnRegresarBorrar = document.getElementById('btn-regresar-borrar');
    const formTitle = document.getElementById('form-title');

    // Variables para el modal de confirmación
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    let noticiaIdToDelete = null;

    let selectedNoticiaId = null;

    // Actualizar el año en el pie de página
    yearSpan.textContent = new Date().getFullYear();

    // Inicializar el editor de texto enriquecido Quill
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Escribe el cuerpo de la noticia aquí...',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline'], 
                ['link', 'blockquote'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }]
            ]
        }
    });

    // Manejo de autenticación
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            loginMessage.textContent = 'Inicio de sesión exitoso';
            loginSection.style.display = 'none';
            adminOptions.style.display = 'block';
        } catch (error) {
            console.error("Error al iniciar sesión: ", error);
            loginMessage.textContent = 'Usuario incorrecto';
            setTimeout(() => {
                loginMessage.textContent = '';
            }, 5000);
        }
    });

    // Botones para mostrar y regresar de cada sección
    btnCrear.addEventListener('click', () => {
        formTitle.textContent = 'Crear Nueva Noticia';
        adminOptions.style.display = 'none';
        adminSection.style.display = 'block';
        selectedNoticiaId = null;
        form.reset();
        quill.setContents([]);
    });

    btnModificar.addEventListener('click', () => {
        formTitle.textContent = 'Modificar Noticia';
        adminOptions.style.display = 'none';
        modifySection.style.display = 'block';
        cargarListaNoticiasParaModificar();
    });

    btnBorrar.addEventListener('click', () => {
        adminOptions.style.display = 'none';
        deleteSection.style.display = 'block';
        cargarListaNoticiasParaBorrar();
    });

    // Botones de "Regresar" para cada sección
    btnRegresarCrear.addEventListener('click', () => {
        adminSection.style.display = 'none';
        adminOptions.style.display = 'block';
    });

    btnRegresarModificar.addEventListener('click', () => {
        modifySection.style.display = 'none';
        adminOptions.style.display = 'block';
    });

    btnRegresarBorrar.addEventListener('click', () => {
        deleteSection.style.display = 'none';
        adminOptions.style.display = 'block';
    });

    async function cargarListaNoticiasParaModificar() {
        noticiasListaModificar.innerHTML = "<p>Cargando noticias...</p>";
        try {
            const querySnapshot = await db.collection('noticias').get();
            noticiasListaModificar.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const noticia = doc.data();
                const noticiaEl = document.createElement('div');
                noticiaEl.classList.add('noticia-item');
                noticiaEl.innerHTML = `
                    <img src="${noticia.imagen || 'https://via.placeholder.com/300x200'}" alt="Imagen de la noticia" class="noticia-img">
                    <div class="noticia-content">
                        <h3 class="noticia-title">${noticia.titulo}</h3>
                        <button onclick="seleccionarNoticiaParaModificar('${doc.id}')" class="noticia-btn">Modificar</button>
                    </div>
                `;
                noticiasListaModificar.appendChild(noticiaEl);
            });
        } catch (error) {
            console.error("Error al cargar las noticias: ", error);
            noticiasListaModificar.innerHTML = "<p>Error al cargar noticias.</p>";
        }
    }

    async function cargarListaNoticiasParaBorrar() {
        noticiasListaBorrar.innerHTML = "<p>Cargando noticias...</p>";
        try {
            const querySnapshot = await db.collection('noticias').get();
            noticiasListaBorrar.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const noticia = doc.data();
                const noticiaEl = document.createElement('div');
                noticiaEl.classList.add('noticia-item');
                noticiaEl.innerHTML = `
                    <img src="${noticia.imagen || 'https://via.placeholder.com/300x200'}" alt="Imagen de la noticia" class="noticia-img">
                    <div class="noticia-content">
                        <h3 class="noticia-title">${noticia.titulo}</h3>
                        <button onclick="mostrarConfirmacionBorrar('${doc.id}')" class="noticia-btn borrar-btn">Borrar</button>
                    </div>
                `;
                noticiasListaBorrar.appendChild(noticiaEl);
            });
        } catch (error) {
            console.error("Error al cargar las noticias: ", error);
            noticiasListaBorrar.innerHTML = "<p>Error al cargar noticias.</p>";
        }
    }

    // Función para mostrar el modal de confirmación
    window.mostrarConfirmacionBorrar = (id) => {
        noticiaIdToDelete = id; // Almacenar el ID de la noticia a borrar
        confirmationModal.style.display = 'flex';
    };

    // Manejo del botón "Aceptar" en el modal de confirmación
    confirmDeleteBtn.addEventListener('click', async () => {
        if (noticiaIdToDelete) {
            try {
                await db.collection('noticias').doc(noticiaIdToDelete).delete();
                deleteMessage.textContent = 'Noticia borrada con éxito';
                cargarListaNoticiasParaBorrar(); // Actualizar la lista después de borrar
            } catch (error) {
                console.error("Error al borrar la noticia: ", error);
                deleteMessage.textContent = 'Error al borrar la noticia: ' + error.message;
            }
        }
        confirmationModal.style.display = 'none'; // Cerrar el modal
    });

    // Manejo del botón "Cancelar" en el modal de confirmación
    cancelDeleteBtn.addEventListener('click', () => {
        confirmationModal.style.display = 'none'; // Cerrar el modal sin borrar
        noticiaIdToDelete = null; // Resetear la ID de la noticia a borrar
    });

    // Función para seleccionar una noticia y cargar sus datos en el formulario
    window.seleccionarNoticiaParaModificar = async (id) => {
        selectedNoticiaId = id;
        formTitle.textContent = 'Modificar Noticia';
        modifySection.style.display = 'none';
        adminSection.style.display = 'block';

        try {
            const doc = await db.collection('noticias').doc(id).get();
            if (doc.exists) {
                const noticia = doc.data();
                form.titulo.value = noticia.titulo;
                form.descripcion.value = noticia.descripcion;
                quill.root.innerHTML = noticia.cuerpo;
                form.imagen.value = noticia.imagen;
                form.categoria.value = noticia.categoria;
            } else {
                console.error("No se encontró la noticia");
            }
        } catch (error) {
            console.error("Error al cargar la noticia para modificar: ", error);
        }
    };

    // Manejo del formulario de crear/modificar noticia
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = form.titulo.value;
        const descripcion = form.descripcion.value;
        const cuerpo = quill.root.innerHTML;
        const imagen = form.imagen.value;
        const categoria = form.categoria.value;
        const slug = createSlug(titulo);

        if (!titulo || !descripcion || !cuerpo || !categoria) {
            mensaje.textContent = 'Por favor, completa todos los campos obligatorios.';
            return;
        }

        try {
            const noticiasRef = db.collection('noticias');
            if (selectedNoticiaId) {
                // Actualizar noticia existente
                await noticiasRef.doc(selectedNoticiaId).update({
                    titulo,
                    descripcion,
                    cuerpo,
                    imagen,
                    categoria,
                    slug,
                    fecha: firebase.firestore.FieldValue.serverTimestamp()
                });
                mensaje.textContent = 'Noticia actualizada con éxito';
            } else {
                // Crear nueva noticia
                await noticiasRef.add({
                    titulo,
                    descripcion,
                    cuerpo,
                    imagen,
                    categoria,
                    slug,
                    fecha: firebase.firestore.FieldValue.serverTimestamp()
                });
                mensaje.textContent = 'Noticia agregada con éxito';
            }

            form.reset();
            quill.setContents([]);
            selectedNoticiaId = null;

            // Volver a las opciones principales después de guardar
            adminSection.style.display = 'none';
            adminOptions.style.display = 'block';
        } catch (error) {
            console.error("Error al guardar la noticia: ", error);
            mensaje.textContent = 'Error al guardar la noticia: ' + error.message;
        }
    });

    // Función para crear el slug del título de la noticia
    function createSlug(titulo) {
        return titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
});
