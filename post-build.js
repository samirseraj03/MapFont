import { move } from 'fs-extra';

// Mueve el contenido de dist/browser a dist
move('www/browser', 'www', (err) => {
if (err) {
 return console.error('Error al mover la carpeta:', err);
}
console.log('Archivos movidos exitosamente de www/browser a www');
});