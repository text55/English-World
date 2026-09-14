// Плавное появление элементов с классом .reveal при прокрутке до них.
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window) || revealElements.length === 0) {
        revealElements.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px',
    });

    revealElements.forEach((el) => observer.observe(el));
});
