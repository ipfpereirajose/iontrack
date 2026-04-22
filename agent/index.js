const watcher = require('./watcher');
const sync = require('./sync');
const monitor = require('./monitor'); // Start the local web UI

console.log('====================================');
console.log('   I.O.N.T.R.A.C.K. LOCAL AGENT     ');
console.log('   Modulo de Ingesta y Supervivencia');
console.log('   Interfaz: http://localhost:4000  ');
console.log('====================================');

process.on('SIGINT', () => {
  console.log('[AGENT] Deteniendo servicios...');
  process.exit();
});
