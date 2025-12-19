let bTT = document.getElementById("bTT");

window.onscroll =  function() {scrollEvent()};

function scrollEvent() {
    if (document.body.scrollTop > 25 || document.documentElement.scrollTop > 25) {
        bTT.classList.remove("isHidden")
        bTT.classList.add("isShow")
    } else {
        bTT.classList.remove("isShow")
        bTT.classList.add("isHidden")
    }
}

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
} 
