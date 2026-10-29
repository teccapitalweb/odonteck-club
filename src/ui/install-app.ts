// Installation is always user initiated; browsers without a prompt get a persistent guide.
type InstallPrompt = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function installButtonHTML() {
  return `<button class="topbar__install" type="button" data-install data-install-btn aria-label="Instalar OdonTeck en tu dispositivo" title="Lleva OdonTeck en tu celular"><i data-lucide="smartphone" class="i" aria-hidden="true"></i><span>Instalar app</span></button>`;
}

function showInstallGuide() {
  if (document.querySelector<HTMLDialogElement>('#install-app-guide')?.open) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /android/i.test(navigator.userAgent);
  const iphoneSteps = `<li>Abre OdonTeck en <strong>Safari</strong>.</li><li>Toca <strong>Compartir</strong> en el menú del navegador.</li><li>Elige <strong>Agregar a pantalla de inicio</strong> y confirma en <strong>Agregar</strong>. Si aparece «Abrir como app web», déjalo activado.</li>`;
  const androidSteps = `<li>Abre OdonTeck en <strong>Chrome</strong>.</li><li>Toca el menú <strong>⋮</strong> de la esquina superior.</li><li>Elige <strong>Agregar a pantalla principal → Instalar</strong> y confirma.</li>`;
  const dialog = document.createElement('dialog');
  dialog.id = 'install-app-guide';
  dialog.className = 'install-guide';
  dialog.setAttribute('aria-labelledby', 'install-app-title');
  dialog.innerHTML = `<form method="dialog" class="install-guide__close"><button type="submit" aria-label="Cerrar instrucciones de instalación">×</button></form>
    <img class="install-guide__icon" src="/brand/app-white-192.png" alt="" width="72" height="72" />
    <span class="eyebrow">ODONTECK EN TU BOLSILLO</span><h2 id="install-app-title">Tu Club, a un toque</h2>
    <p>Agrega OdonTeck a tu inicio y entra desde su icono. Instalar la app no tiene costo adicional; tus accesos siguen según tu plan.</p>
    ${ios || android ? `<h3>${ios ? 'En iPhone o iPad' : 'En Android'}</h3><ol>${ios ? iphoneSteps : androidSteps}</ol>` : `<p class="install-guide__desktop">En tu computadora, busca «Instalar OdonTeck» en la barra de direcciones o en el menú de Chrome o Edge.</p><h3>¿La quieres en tu teléfono?</h3><p>Abre <strong>www.odonteckconsulting.com</strong> en tu celular y sigue estos pasos:</p><details open><summary>Android · Chrome</summary><ol>${androidSteps}</ol></details><details><summary>iPhone · Safari</summary><ol>${iphoneSteps}</ol></details>`}
    <p class="install-guide__note">Si abriste el enlace desde WhatsApp o Instagram, ábrelo primero en el navegador. Si ya la instalaste, búscala en tus aplicaciones.</p>
    <form method="dialog"><button class="btn btn--brand" type="submit">Entendido</button></form>`;
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  document.body.append(dialog);
  dialog.showModal();
}

export function initAppInstallation(onInstalled: () => void) {
  let deferred: InstallPrompt | null = null;
  let busy = false;
  let installed = false;
  const standalone = window.matchMedia('(display-mode: standalone)');
  const sync = () => document.documentElement.classList.toggle('pwa-installed', installed || standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
  sync();
  standalone.addEventListener('change', sync);
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e as InstallPrompt; });
  window.addEventListener('appinstalled', () => {
    installed = true; deferred = null; sync();
    document.querySelector<HTMLDialogElement>('#install-app-guide')?.close();
    onInstalled();
  });
  document.addEventListener('click', async e => {
    if (!(e.target instanceof Element) || !e.target.closest('[data-install-btn]') || busy) return;
    if (!deferred) { showInstallGuide(); return; }
    const prompt = deferred;
    deferred = null;
    busy = true;
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { showInstallGuide(); }
    finally { busy = false; }
  });
}
