document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function() {
            this.classList.toggle('is-active');
            nav.classList.toggle('is-open');
            this.setAttribute('aria-expanded', this.classList.contains('is-active'));
        });
    }
});
