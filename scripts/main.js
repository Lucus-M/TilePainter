import User from './User.js';

function main(){
    const user = new User();
    window.user = user; 
}

window.onload = main;