import bcrypt, { hash } from 'bcryptjs';

const password = 'Helloworld20';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Hashed password:', hash);
    }
});