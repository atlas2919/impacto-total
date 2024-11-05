document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria').toLowerCase(); // Normalizamos la categoría a minúsculas
    const yearSpan = document.getElementById('year');
    const categoriaTitulo = document.getElementById('categoria-titulo');
    const categoriaNoticiasContainer = document.getElementById('categoria-noticias-container');

    // Actualizar el año en el pie de página
    yearSpan.textContent = new Date().getFullYear();

    // Asignar título de la categoría con formato adecuado
    categoriaTitulo.textContent = `Noticias de ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`;

    function createNoticiaElement(noticia) {
        const noticiaEl = document.createElement('div');
        noticiaEl.className = 'noticia';
        const slug = noticia.slug;

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

    // Obtener y mostrar noticias por categoría
    function getNoticiasPorCategoria(categoria) {
        db.collection('noticias')
            .where("categoria", "==", categoria)
            .get()
            .then((querySnapshot) => {
                categoriaNoticiasContainer.innerHTML = '';

                if (querySnapshot.empty) {
                    categoriaNoticiasContainer.innerHTML = '<p>No hay noticias disponibles para esta categoría.</p>';
                    return;
                }

                querySnapshot.docs.forEach((doc) => {
                    const noticia = doc.data();
                    const noticiaEl = createNoticiaElement(noticia);
                    categoriaNoticiasContainer.appendChild(noticiaEl);
                });
            })
            .catch((error) => {
                console.error("Error al obtener noticias por categoría: ", error);
                categoriaNoticiasContainer.innerHTML = '<p>Error al cargar las noticias de esta categoría.</p>';
            });
    }

    if (categoria) {
        getNoticiasPorCategoria(categoria);
    } else {
        categoriaNoticiasContainer.innerHTML = '<p>No se ha especificado una categoría.</p>';
    }
});
