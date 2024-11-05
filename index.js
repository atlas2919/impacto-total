document.addEventListener('DOMContentLoaded', () => {
    const noticiasContainer = document.getElementById('noticias-container');
    const yearSpan = document.getElementById('year');

    // Actualizar el año en el pie de página
    yearSpan.textContent = new Date().getFullYear();

    // Función para crear el slug del título de la noticia
    function createSlug(titulo) {
        return titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    // Función para crear el elemento HTML de cada noticia
    function createNoticiaElement(noticia) {
        const noticiaEl = document.createElement('div');
        noticiaEl.className = 'noticia';
        const slug = noticia.slug || createSlug(noticia.titulo); // Usa el slug existente o crea uno si falta
        
        noticiaEl.innerHTML = `
            <img src="${noticia.imagen || 'https://via.placeholder.com/300x200'}" alt="${noticia.titulo}">
            <div class="noticia-content">
                <h3>${noticia.titulo}</h3>
                <p>${noticia.descripcion}</p>
                <a href="noticia.html?slug=${slug}" class="leer-mas">Leer más</a>
            </div>
        `;
        return noticiaEl;
    }

    // Función para obtener y mostrar todas las noticias
    function getNoticias(categoria = null) {
        db.collection('noticias')
            .orderBy('fecha', 'desc')
            .get()
            .then((querySnapshot) => {
                noticiasContainer.innerHTML = '';

                if (querySnapshot.empty) {
                    noticiasContainer.innerHTML = '<p>No hay noticias disponibles.</p>';
                    return;
                }

                querySnapshot.docs.forEach((doc) => {
                    const noticia = { id: doc.id, ...doc.data() };

                    // Filtrar por categoría si se especifica una
                    if (categoria && noticia.categoria !== categoria) {
                        return;
                    }

                    const noticiaEl = createNoticiaElement(noticia);
                    noticiasContainer.appendChild(noticiaEl);
                });
            })
            .catch((error) => {
                console.error("Error obteniendo noticias: ", error);
                noticiasContainer.innerHTML = '<p>Error al cargar las noticias.</p>';
            });
    }

    // Cargar todas las noticias al inicio
    getNoticias();
});
