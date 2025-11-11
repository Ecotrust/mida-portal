document.addEventListener('DOMContentLoaded', () => {

  const tabs = Array.from(document.querySelectorAll('.tab-button'));
  const cards = Array.from(document.querySelectorAll('.tabs-link-container'));
  if (!tabs.length || !cards.length) return;

  function activate(index) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.classList.toggle('is-active', active);
      cards[i]?.classList.toggle('is-active', active);
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      if (tab.getAttribute('aria-selected') === 'true') return;
      activate(index);
    });
  });

  activate(0);
});