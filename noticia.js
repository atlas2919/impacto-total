document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const yearSpan = document.getElementById('year');
    const tituloEl = document.getElementById('titulo');
    const imagenEl = document.getElementById('imagen');
    const cuerpoEl = document.getElementById('cuerpo');

    // Actualizar el año en el pie de página
    yearSpan.textContent = new Date().getFullYear();

    if (slug) {
        db.collection('noticias')
            .where("slug", "==", slug)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const noticia = doc.data();

                    tituloEl.textContent = noticia.titulo;
                    imagenEl.src = noticia.imagen || 'https://via.placeholder.com/300x200';
                    cuerpoEl.innerHTML = noticia.cuerpo;

                    const links = cuerpoEl.querySelectorAll('a');
                    links.forEach(link => {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    });
                } else {
                    cuerpoEl.textContent = "Noticia no encontrada.";
                }
            })
            .catch((error) => {
                console.error("Error al cargar la noticia: ", error);
                cuerpoEl.textContent = "Error al cargar la noticia.";
            });
    } else {
        cuerpoEl.textContent = "No se ha especificado una noticia.";
    }

    // Compartir en WhatsApp
    const shareWhatsAppBtn = document.getElementById('share-whatsapp');
    shareWhatsAppBtn.addEventListener('click', () => {
        const whatsappUrl = `https://wa.me/?text=Mira esta noticia: ${encodeURIComponent(window.location.href)}`;
        window.open(whatsappUrl, '_blank');
    });

    // Compartir en Instagram (mostrar enlace para copiar)
    const shareInstagramBtn = document.getElementById('share-instagram');
    shareInstagramBtn.addEventListener('click', () => {
        alert("Copia el enlace y compártelo en Instagram: " + window.location.href);
    });
});
