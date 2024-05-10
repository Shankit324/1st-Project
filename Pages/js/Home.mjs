const slider = document.querySelector('.overflow');
let slideIndex = 0;

let arrow1 = document.getElementsByClassName("arrowleft")[0];
arrow1.addEventListener("click", () => { prevSlide() })
arrow1.addEventListener("mouseenter", () => { arrow1.style.opacity = 1; })
arrow1.addEventListener("mouseleave", () => { arrow1.style.opacity = 0.2; })

let arrow2 = document.getElementsByClassName("arrowright")[0];
arrow2.addEventListener("click", () => { nextSlide1() })
arrow2.addEventListener("mouseenter", () => { arrow2.style.opacity = 1; })
arrow2.addEventListener("mouseleave", () => { arrow2.style.opacity = 0.2; })

function prevSlide() {
    if (slideIndex > 0) {
        slideIndex--;
    }
    else {
        slideIndex = slider.children.length - 1;
    }
    const slideWidth = (slider.clientWidth) / 5;
    slider.style.transform = `translateX(${-1 * (slideIndex * slideWidth)}px)`;
}
function nextSlide1() {
    if (slideIndex < slider.children.length - 1) {
        slideIndex++;
    }
    else {
        slideIndex = 0;
    }
    const slideWidth = (slider.clientWidth) / 5;
    slider.style.transform = `translateX(${-1 * (slideIndex * slideWidth)}px)`;
}

function nextSlide() {
    if (slideIndex < slider.children.length - 1) {
        slideIndex++;
    }
    else {
        slideIndex = 0;
    }
    updateSlidePosition();
}

function updateSlidePosition() {
    const slideWidth = (slider.clientWidth) / 5;
    slider.style.transform = `translateX(${-1 * (slideIndex * slideWidth)}px)`;
}

setInterval(nextSlide, 6000);

document.getElementById("sbut").addEventListener("click", (e) => {
    e.preventDefault();
    var searchTerm = document.getElementById('search').value.trim();
    var contentDiv = document.childNodes[1].childNodes[2].children[1].childNodes;

    if (searchTerm !== '') {
        for (let i = 0; i < contentDiv.length; i++) {
            // Remove previous highlights
            var contentText = contentDiv[i].innerHTML;
            if (contentText) {
                var regex1 = new RegExp(/<span class="highlight">/gi);
                var isPhrasePresent = regex1.test(contentText);
                if (isPhrasePresent) {
                    contentText = contentText.replace(/<span class="highlight">|<\/span>/gi, '');
                }

                // Perform search and highlight
                var regex = new RegExp('(' + searchTerm + ')', 'gi');
                contentText = contentText.replace(regex, '<span class="highlight">$1</span>');
                contentDiv[i].innerHTML = contentText;
            }
        }
    }
    else {
        // Clear highlights if search term is empty
        for (let i = 0; i < contentDiv.length; i++) {
            contentDiv[i].innerHTML = contentDiv[i].innerHTML.replace(/<span class="highlight">|<\/span>/gi, '');
        }
    }
});
