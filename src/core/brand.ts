// Datos de marca y contacto de OdonTeck. Los editables (precios, descuento, WhatsApp, Praxia) vienen de Ajustes del admin.
import { Datos } from './datos';

export const BRAND = {
  nombre: 'OdonTeck',
  club: 'OdonTeck Club',
  sitio: 'https://www.odonteckconsulting.com',
  whatsappSoporte: '',
  canalWhatsApp: '',
  praxia: '',
  descuentoVIP: 20,
  planes: [] as { id: 'mensual' | 'anual'; nombre: string; precio: number; periodo: string; ahorro?: string }[],
};

function aplicarConfig() {
  const c = Datos.config();
  BRAND.whatsappSoporte = c.whatsappSoporte;
  BRAND.canalWhatsApp = c.canalWhatsApp;
  BRAND.praxia = c.praxiaUrl;
  BRAND.descuentoVIP = c.descuentoVIP;
  const ahorro = c.precioMensual * 12 - c.precioAnual;
  BRAND.planes = [
    { id: 'mensual', nombre: 'VIP Mensual', precio: c.precioMensual, periodo: 'mes' },
    { id: 'anual', nombre: 'VIP Anual', precio: c.precioAnual, periodo: 'año', ahorro: ahorro > 0 ? `Ahorras $${ahorro.toLocaleString('es-MX')} al año` : undefined },
  ];
}
aplicarConfig();
window.addEventListener('datos:cambio', aplicarConfig);

export const wa = (texto: string, num = BRAND.whatsappSoporte) => `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
