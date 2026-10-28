require('dotenv').config();

console.log('=== Test des Variables d\'Environnement ===\n');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD);
console.log('SMTP_PASSWORD (length):', process.env.SMTP_PASSWORD?.length);
console.log('SMTP_FROM:', process.env.SMTP_FROM);
console.log('SMTP_SECURE:', process.env.SMTP_SECURE);

console.log('\n=== Mot de passe attendu ===');
console.log('Attendu: #devCode21#');
console.log('Longueur attendue: 12');
console.log('Match:', process.env.SMTP_PASSWORD === '#devCode21#' ? '✅ OUI' : '❌ NON');
