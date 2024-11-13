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
        const fecha = noticia.fecha ? new Date(noticia.fecha.seconds * 1000).toLocaleDateString() : '';
    
        noticiaEl.innerHTML = `
            <img src="${noticia.imagen || 'https://via.placeholder.com/300x200'}" alt="${noticia.titulo}">
            <div class="noticia-content">
                <h3>${noticia.titulo}</h3>
                <p>${noticia.descripcion}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <a href="noticia.html?slug=${slug}" class="leer-mas">Leer más</a>
                    <span class="noticia-fecha">${fecha}</span>
                </div>
            </div>
        `;
    
        // Agregar evento de clic en la tarjeta completa
        noticiaEl.addEventListener('click', () => {
            window.location.href = `noticia.html?slug=${slug}`;
        });
    
        return noticiaEl;
    }      

    // Función para obtener y mostrar todas las noticias
    function getNoticias(categoria = null) {
        const ahora = firebase.firestore.Timestamp.now();
    
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
    
                    // Verificar si la noticia debe mostrarse
                    const esPublicada = noticia.publicada === true;
                    const sinProgramacion = noticia.programada === undefined;
                    const programacionPasada = noticia.programada && noticia.programada.toDate() <= ahora.toDate();
    
                    // Mostrar la noticia si es publicada o si no tiene programación o si la programación ya pasó
                    if (esPublicada || sinProgramacion || programacionPasada) {
                        if (categoria && noticia.categoria !== categoria) return;
    
                        const noticiaEl = createNoticiaElement(noticia);
                        noticiasContainer.appendChild(noticiaEl);
    
                        // Si la noticia es programada y debe mostrarse ahora, actualizar el campo `publicada`
                        if (programacionPasada && !esPublicada) {
                            db.collection('noticias').doc(noticia.id).update({ publicada: true });
                        }
                    }
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
