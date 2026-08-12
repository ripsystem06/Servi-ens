# Servi-Ens — Prompts unificados para generación de imágenes

**Herramienta:** Nano Banana (o cualquier generador compatible)  
**Estilo visual:** Editorial documental · cálido · local · no corporativo  
**Formato:** 1:1 cuadrado (1080×1080px)  
**Regla de oro:** Mismo prompt maestro, cambia solo la escena y espacio negativo

---

## Prompt maestro (template base)

```
Editorial documentary photograph, [ESCENA]. Natural diffused daylight, soft shadows. Color palette: deep teal accents, warm beige, cream whites, light wood tones, muted sage green. Shot on 35mm film with slight grain. Shallow depth of field where appropriate. Warm, inviting, trustworthy atmosphere. Intentional negative space occupying 35% of the frame — on the [LADO] side. No text, no logos, no watermarks. No people facing the camera. No glossy 3D renders. No harsh studio lighting. Editorial quality, like a feature in a local independent magazine. --ar 1:1
```

---

## SE-01 — Quiénes somos

**Escena:** A warm overhead flat lay on a light wooden table: a smartphone displaying a clean minimalist interface with subtle service icons, a small potted plant with soft round leaves, a linen notebook with a pen resting beside it, and a ceramic cup of coffee. Natural daylight from a large window on the left casting soft shadows.

**Espacio negativo:** right side  
**Overlay:** "Conectamos a Ensenada con el talento local"

---

## SE-02 — El problema de encontrar servicios

**Escena:** A quiet interior at dusk. A wooden kitchen table seen from a slight angle. A laptop open with a dimly lit screen, a phone next to it showing a social media feed. A hand resting near the phone, not typing, just waiting. Warm amber light from the screen contrasting with the cool blue twilight through a window. Atmosphere: patient waiting, not drama.

**Espacio negativo:** right side  
**Overlay:** "El servicio que buscas está más cerca de lo que imaginas"

---

## SE-03 — Cómo funciona (3 imágenes)

**Escena común (variar layout):** Three separate compositions, each a clean editorial still life. A small card or piece of textured paper on a desk surface. Next to it, a single meaningful object that tells the step without words.

**Imagen 1:** A hand placing a blank profile card onto a clean warm beige surface. Next to it, a simple pen. The card catches soft window light.
**Imagen 2:** A hand hovering over a set of neatly arranged category tabs or folders in muted teal and beige tones.
**Imagen 3:** Two hands about to shake, framed from the side, warm light, soft focus background.

**Espacio negativo:** mixed (top for img1, bottom for img2, right for img3)  
**Overlays:** "Crea tu perfil" / "Elige tu categoría" / "Te descubren"

---

## SE-04 — Presencia digital

**Escena:** A split composition diptych style. Left half: a small storefront at dusk with the lights off, a CLOSED sign visible, warm fading sunset light. Right half: the same storefront concept but shown as a clean, illuminated digital interface card on a phone screen resting on a wooden table. The transition between analog and digital feels natural, not forced.

**Espacio negativo:** top  
**Overlay:** "Tu negocio no cierra cuando tú descansas"

---

## SE-05 — Alguien te busca

**Escena:** An aerial overhead view of two hands reaching toward each other across a warm wooden surface — they don't touch yet, fingers extended, a gentle tension of almost-connection. Between them, soft morning light creates a natural highlight path. Out of focus in the background: subtle hints of a neighborhood street (blurred trees, pavement texture).

**Espacio negativo:** top  
**Overlay:** "Alguien está buscando tu servicio ahora mismo"

---

## SE-06 — 5 minutos

**Escena:** A tight close-up on hands resting on a laptop keyboard, one finger gently pressing a single key. On the desk beside the laptop, a simple wall clock with a clean face, the minute hand pointing near the top. Warm morning light from a window, casting long soft shadows across the desk. The scene feels calm, unhurried, achievable.

**Espacio negativo:** top  
**Overlay:** "5 minutos. Registro gratis. Sin permanencia."

---

## SE-07 — Talento de Ensenada

**Escena:** An editorial flat lay of artisan tools arranged in a loose circle on a warm wooden surface — not perfectly aligned, slightly organic. Among the tools: a well-worn wooden hammer handle, a fabric measuring tape coiled, a pencil sharpened to a stub, a small paintbrush with dried paint, a metal wrench with patina. All tools show honest use. Warm light pools in the center. The arrangement feels like a quiet tribute, not a product shot.

**Espacio negativo:** center (tools frame the text area)  
**Overlay:** "El talento que Ensenada necesita ya está en Ensenada"

---

## SE-08 — Carrusel de categorías (6 slides)

**Nota:** Estos 6 slides comparten exactamente el mismo prompt base, solo cambia el objeto central y el color del fondo. Son ideales para generación batch.

**Slide base (template por slide):**
```
Minimal editorial composition. Centered on a soft [COLOR] gradient background, a single [OBJETO] rendered as a clean matte object, casting a very subtle shadow. The object is small relative to the frame, leaving generous breathing room. Museum-like negative space. No texture on the background — smooth, matte, calming. --ar 1:1
```

| Slide | Color fondo | Objeto |
|-------|-------------|--------|
| 1 | warm beige (#F5F0E8) | vintage brass wrench with slight patina |
| 2 | muted teal (#B2D8D0) | well-used wooden pencil, sharpened |
| 3 | warm beige (#F5F0E8) | simple matte calculator, slightly angled |
| 4 | muted teal (#B2D8D0) | classic glass thermometer |
| 5 | warm beige (#F5F0E8) | small cast iron dumbbell |
| 6 | muted teal (#B2D8D0) | a single hand-painted question mark on textured cream paper |

**Overlays por slide:** "Oficios" / "Creatividad" / "Profesionales" / "Técnicos" / "Personales" / "¿Falta la tuya?"

---

## SE-09 — Preguntas frecuentes

**Escena:** An intimate desk corner in soft morning light. A linen notebook open to a page with subtle handwritten marks (visible but not legible). A ceramic mug of coffee with a wisp of steam. A pen resting at an angle across the notebook. The light creates a gentle diagonal across the scene. Calm, patient, reassuring.

**Espacio negativo:** right side  
**Overlay:** "Todo lo que necesitas saber antes de registrarte"

---

## SE-10 — Gratis para siempre

**Escena:** A minimal composition. A hand placing a small white card with subtle rounded corners onto a warm wooden surface. The card has no visible text — just a tiny embossed checkmark catching the light. The hand is gentle, deliberate. Background is a soft blurred interior with warm natural light. No price tags, no money, no coins.

**Espacio negativo:** top  
**Overlay:** "Gratis hoy. Gratis siempre. Sin letra chica."

---

## SE-11 — Categorías más buscadas

**Escena:** A smartphone lying flat on light wood, screen facing up but at a slight angle. On the screen: a clean search interface with subtle category icons barely visible (not a real screenshot — abstract UI). Next to the phone, a classic magnifying glass with a brass frame, resting casually, catching window light and creating a small focused beam on the wood grain.

**Espacio negativo:** top  
**Overlay:** "Las categorías con más búsquedas. ¿Apareces en ellas?"

---

## SE-12 — Cierre de mes

**Escena:** An exterior shot of a community bulletin board on a quiet Ensenada street. The board is wooden, slightly weathered, mounted on a sun-warmed wall. A few white notes and cards are pinned to it — not many, just enough to show it's beginning to fill. In the background: trees filtering sunlight, a hint of blue sky, a bicycle leaning against a wall. The board faces the camera directly or at a slight angle. The feeling: optimistic, early days, something growing.

**Espacio negativo:** top (sky area above the board)  
**Overlay:** "Esto apenas comienza. Gracias por ser parte."

---

## Notas técnicas para Nano Banana

1. **Todas las imágenes comparten el prompt maestro** — solo cambian la escena y el lado del espacio negativo
2. **El overlay de texto NUNCA va en la imagen generada** — se monta después en Canva, Figma o similar
3. **Si Nano Banana tiende a saturar colores**, agregar al prompt: `Desaturated by 10%. Muted tones. No vivid colors.`
4. **Si las imágenes salen con caras mirando a cámara**, reforzar: `No faces. No eye contact. No portraits.`
5. **Si salen muy "perfectas"**, agregar: `Slight imperfections. Honest. Real texture. Not polished.`
6. **Proporción fija:** `--ar 1:1` para todas las imágenes del feed

---

## Flujo de trabajo recomendado

1. Probar primero con **SE-01** o **SE-06** (son las más simples de evaluar)
2. Verificar que el estilo se mantiene consistente
3. Si se desvía, ajustar el prompt maestro (no los prompts individuales)
4. Una vez clavado el estilo, generar el resto en lote
5. Montar overlays de texto en herramienta de diseño (Canva/Figma)
6. Exportar a 1080×1080px JPG calidad 85%

---

*Generado para Servi-Ens · 2026-08-10*
