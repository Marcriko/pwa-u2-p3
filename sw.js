console.log("SW: Limpio");



const CACHE_NAME = 'cache-v1'
const CACHE_STATIC_NAME = 'static-v1' //elementos que son parte del appshell, pueden cambiar
const CACHE_DYNAMIC_NAME = 'dynamic-v1' //solicitudes que suelen ser llamadas dinámicas

const CACHE_INMUTABLE_NAME = 'inmutable-v1' // almacenar recursos que no estarán cambiando como librerias de bootstrap





function clearCache(cacheName, sizeItems) {
    caches.open(cacheName).then((response) => {
        response.keys().then(keys => {
            console.log(keys);
            if (keys >= sizeItems) {
                response.delete(keys[0]).then(()=>{
                    clearCache(cacheName,sizeItems)
                }
                
                );
            }
        })
    })

}






self.addEventListener('install', (event) => {
    console.log("instalado");
    //crear cache y almacenar AppShell
    const promesaCache = caches.open(CACHE_STATIC_NAME)
        .then((cache) => {
            return cache.addAll([
                '/',
                'index.html',
                'css/page.css',
                'img/inicio.png',
                'js/app.js'
            ]);
        });


    const promInmutable = caches.open(CACHE_INMUTABLE_NAME)
        .then(cacheInmutable => {
            return cacheInmutable.addAll([
                'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'
            ])
        });


    event.waitUntil(Promise.all([promesaCache, promInmutable]));

});


self.addEventListener('fetch', (event) => {
    //console.log(caches.match(event.request.url));
    //1.- Only cache
    //event.respondWith(caches.match(event.request));

    //Estrategia de cache network
    const respuestaCache = caches.match(event.request)
        .then((response) => {
            //si response existe en cache
            if (response) {
                //responde cache

                return response;
            }
            console.log("no está en caché", event.request.url);
            return fetch(event.request)
                .then((respuestaNetwork) => {
                    //abrir caché
                    caches.open(CACHE_DYNAMIC_NAME)
                        .then(responseNetwork => {
                            // Guardar la respuesta de red en cache
                            responseNetwork.put(event.request, respuestaNetwork)
                                .then(clearCache(CACHE_DYNAMIC_NAME, 3));

                        });
                    return respuestaNetwork.clone();
                });
        });
    event.respondWith(respuestaCache);
});