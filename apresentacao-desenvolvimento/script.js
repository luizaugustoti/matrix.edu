document.addEventListener('DOMContentLoaded', () => {
  const yearNode = document.querySelector('.footer-inner p:last-child');
  if (yearNode) {
    const year = new Date().getFullYear();
    yearNode.textContent = `Desenvolvimento acadêmico em andamento • ${year}`;
  }
});
