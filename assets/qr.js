document.addEventListener('DOMContentLoaded', () => {
  const target = document.getElementById('qr-page');
  if (!target || typeof qrcode !== 'function') return;

  const qr = qrcode(0, 'M');
  qr.addData('https://smartbudget-site.onrender.com/telecharger.html');
  qr.make();

  const n = qr.getModuleCount();
  const total = n + 8;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${total} ${total}`);
  svg.setAttribute('shape-rendering', 'crispEdges');

  const fond = document.createElementNS(svgNS, 'rect');
  fond.setAttribute('x', '0');
  fond.setAttribute('y', '0');
  fond.setAttribute('width', String(total));
  fond.setAttribute('height', String(total));
  fond.setAttribute('fill', '#FFFFFF');
  svg.appendChild(fond);

  let d = '';
  for (let ligne = 0; ligne < n; ligne += 1) {
    for (let colonne = 0; colonne < n; colonne += 1) {
      if (qr.isDark(ligne, colonne)) {
        d += `M${colonne + 4} ${ligne + 4}h1v1h-1z`;
      }
    }
  }

  const modules = document.createElementNS(svgNS, 'path');
  modules.setAttribute('d', d);
  modules.setAttribute('fill', '#000000');
  svg.appendChild(modules);
  target.replaceChildren(svg);
});
