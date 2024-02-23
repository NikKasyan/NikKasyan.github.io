

const init = () => {
    const burgerMenu = document.querySelector(".burger-menu");
    const nav = document.querySelector("nav");
    (function injectNavLinks(){
        const links = document.querySelectorAll("nav>ul>li>a");

        links.forEach(link => {
            link.setAttribute("target", "htmz");
            link.addEventListener("click", function(){
                burgerMenu.classList.remove("open");
                nav.classList.remove("open");
                removeActiveClass(links);
                link.classList.add("active");
            });
        });
    })();
    (function injectBurgerMenu(){
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

