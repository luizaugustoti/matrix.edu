const slides = Array.from(document.querySelectorAll('.slide'));
const prevBtn = document.querySelector('.nav-prev');
const nextBtn = document.querySelector('.nav-next');
let current = 0;

function showSlide(index) {
  current = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === current);
  });
}

prevBtn.addEventListener('click', () => showSlide(current - 1));
nextBtn.addEventListener('click', () => showSlide(current + 1));

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
    showSlide(current + 1);
  }

  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    showSlide(current - 1);
  }
});

showSlide(0);
