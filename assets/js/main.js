

const init = () => {
    const burgerMenu = document.querySelector(".burger-menu");
    const nav = document.querySelector("nav");
    (function injectBurgerMenu(){
        burgerMenu.addEventListener("click", function(){
            nav.classList.toggle("open");
            burgerMenu.classList.toggle("open");
        });
    })();




}


document.body.onload = init; 

