const fs = require('fs-extra');

// Mueve el contenido de dist/browser a dist
fs.move('dist/browser', 'dist', (err) => {
if (err) {
 return console.error('Error al mover la carpeta:', err);
}
console.log('Archivos movidos exitosamente de dist/browser a dist');
});