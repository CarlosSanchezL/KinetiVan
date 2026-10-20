# KinetiVan — Landing page

Página web funcional (HTML + CSS + JavaScript puro, sin instalaciones).

## Estructura
```
kinetivan/
├── index.html
├── css/styles.css
├── js/main.js
└── img/          ← pon aquí tus imágenes (opcional)
    ├── hero.jpg      (foto de la van en la montaña)
    └── interior.jpg  (foto del interior con el piso)
```
Si no pones imágenes, la página usa fondos de color automáticamente.

## Abrir en VS Code
1. Descomprime la carpeta y ábrela en VS Code (File → Open Folder).
2. Instala la extensión **Live Server** (de Ritwick Dey).
3. Clic derecho en `index.html` → **Open with Live Server**.

## Funciones
- Menú responsive (hamburguesa en móvil) y link activo al hacer scroll
- Tienda con 3 productos y carrito (se guarda en el navegador)
- Checkout simulado y “My orders” (ícono de usuario)
- Demo interactiva de la app: toca las losetas para generar energía, apaga/enciende el USB-C
- Diagrama “How it works” interactivo
- FAQ desplegable y formulario de contacto con validación

## Desplegar gratis
- **Netlify:** entra a app.netlify.com/drop y arrastra la carpeta `kinetivan`.
- **GitHub Pages:** sube los archivos a un repositorio → Settings → Pages → Branch `main` → Save.
- **Vercel:** importa el repositorio en vercel.com (sin configuración).
