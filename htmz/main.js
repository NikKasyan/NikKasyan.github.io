

const init = () => {
    (function injectNavLinks(){
        const links = document.querySelectorAll("nav>ul>li>a");
        links.forEach(link => {
            link.setAttribute("target", "htmz");
            link.addEventListener("click", function(){
                removeActiveClass(links);
                link.classList.add("active");
            });
        });
    })();
    (function injectBurgerMenu(){
        const burgerMenu = document.querySelector(".burger-menu");
        const nav = document.querySelector("nav");
        burgerMenu.addEventListener("click", function(){
            nav.classList.toggle("open");
            burgerMenu.classList.toggle("open");
        });
    })();


}

const removeActiveClass = (links) => {
    links.forEach(link => {
        link.classList.remove("active");
    });
}

document.body.onload = init; 

