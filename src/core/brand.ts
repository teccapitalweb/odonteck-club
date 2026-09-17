// Datos de marca y contacto de OdonTeck (rescatados del panel actual)
export const BRAND = {
  nombre: 'OdonTeck',
  club: 'OdonTeck Club',
  whatsappSoporte: '5212361139827',
  canalWhatsApp: 'https://whatsapp.com/channel/0029VbCQbyVISTkPMfD7hz0N',
  sitio: 'https://www.odonteckconsulting.com',
  praxia: 'https://app.praxiamedical.com/?utm_source=odonteck-club&utm_medium=panel',
  descuentoVIP: 20,
  planes: [
    { id: 'mensual', nombre: 'VIP Mensual', precio: 199, periodo: 'mes' },
    { id: 'anual', nombre: 'VIP Anual', precio: 1899, periodo: 'año', ahorro: 'Ahorras $489 · 2 meses gratis' },
  ],
};

export const wa = (texto: string, num = BRAND.whatsappSoporte) => `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
