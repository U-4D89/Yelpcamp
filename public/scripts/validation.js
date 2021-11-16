
let email = document.querySelector('#email').value;
let field = document.querySelector('#textValidation');
const pattern = /^[^ ]+@[^]+\.[a-z]{2,3}$/;
if ( !email.match(pattern) ) {

    field.classList.add('invalid');
    field.classList.remove('valid');
}else{
    field.classList.add('valid')
    field.classList.remove('invalid');
}