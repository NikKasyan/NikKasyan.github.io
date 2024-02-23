

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


}

const removeActiveClass = (links) => {
    links.forEach(link => {
        link.classList.remove("active");
    });
}

document.body.onload = init; 

