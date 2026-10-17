# Expandir fotos para Hero OdonTeck — de vertical a 16:9

Estas 3 fotos son verticales. Las metemos a Flow para **expandirlas a horizontal 16:9** manteniendo el sujeto y extendiendo el fondo de manera natural.

## En Flow
- Sube la imagen → **Expand / Outpaint** → selecciona proporción **16:9 horizontal**.
- Pega el prompt correspondiente para que la IA sepa cómo llenar los lados.
- Guardar como: `hero-1`, `hero-2`, `hero-3`.

═══════════════════════════════════════

### Foto 1 · Cirujano con lupas en quirófano oscuro → `hero-1`
```
Seamlessly expand this image horizontally to 16:9 widescreen format. Extend the dark moody surgical environment on both sides: continue the deep navy-black blurred clinical background, the same dramatic low-key lighting, matching the existing shadows, bokeh and ambient tones. On the left side extend the dark out-of-focus foreground blur. On the right side continue the dark clinical wall with the same subtle equipment and ambient red indicator lights. Maintain the same cinematic color grading, dark dramatic mood, shallow depth of field and film grain throughout. The expanded areas should blend perfectly and seamlessly with the original image, no visible seams, no new subjects, no text, no logos.
```

### Foto 2 · Dentista con bata azul atendiendo paciente → `hero-2`
```
Seamlessly expand this image horizontally to 16:9 widescreen format. Extend the modern dental clinic environment on both sides: continue the clean light gray clinical walls, the same soft professional overhead lighting, matching the existing color temperature and ambient tones. On the left side extend the clinical space with more of the same blurred environment, perhaps a hint of dental cabinetry or wall. On the right side continue the dental equipment, monitors and clinical setting in soft focus. Maintain the same clean professional color grading, cool blue-gray tones, soft lighting and shallow depth of field throughout. The expanded areas should blend perfectly and seamlessly with the original image, no visible seams, no new people, no text, no logos.
```

### Foto 3 · Manos con guantes sosteniendo instrumental → `hero-3`
```
Seamlessly expand this image horizontally to 16:9 widescreen format. Remove all existing text, logos, watermarks and overlays completely — the result should have absolutely no text or graphics anywhere. Extend the clean light gray gradient studio background on both sides, continuing the same smooth soft gradient, same lighting direction and same subtle shadows. The blue-gloved hands holding the dental instruments should remain centered. The expanded background should be clean, minimal and uncluttered, matching the soft professional studio atmosphere. Maintain the same clean color grading, soft diffused lighting and product-photography feel throughout. The expanded areas should blend perfectly and seamlessly with the original, no visible seams, no text, no logos, no watermarks, no graphics of any kind.
```

═══════════════════════════════════════

## Tips
- Si Flow no tiene "Expand", usa **img2img / inpaint** con un canvas extendido a los lados y el prompt.
- Si alguna expansión se ve rara en las orillas, genera x2 y quédate con la mejor.
- La foto 3 tiene texto encima ("Feliz dia do dentista") — el prompt le pide que lo borre. Si no lo quita limpio, crop ese texto fuera antes de expandir.
