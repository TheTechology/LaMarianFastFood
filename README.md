# La Marian FastFood - Website de prezentare + sistem oferte centralizat

Proiect realizat de Marian Dumitru pentru prezentare brand, comenzi rapide si administrare oferte sincronizate pe toate dispozitivele.

## 1. Obiectiv proiect
- prezentare profesionala a meniului (burger, shaorma, doner, crispy, portii)
- conversie rapida catre comanda telefonica/WhatsApp
- experienta premium pe mobil, tableta si desktop
- sistem de oferte administrabil din panou intern, cu afisare publica automata

## 2. Tehnologii folosite
- `HTML5` - pagini si structura semantica
- `CSS3` - design premium, responsive, dark/light theme
- `JavaScript (Vanilla)` - logica UI, filtre, countdown, admin
- `Netlify Functions (Node.js)` - API serverless pentru oferte
- `Netlify Blobs` - stocare centralizata oferte (cross-device)
- `Git + GitHub` - versionare si colaborare
- `Netlify` - hosting + deployment production

## 3. Structura proiectului
- `index.html` - homepage cu hero, oferte, produse vedeta, contacte
- `meniu.html` - meniu complet + zona de oferte in partea de sus
- `admin-oferte.html` - panou intern login + management oferte
- `assets/css/styles.css` - stiluri globale, responsive, componente premium
- `assets/js/main.js` - functionalitate frontend + integrare API oferte
- `netlify/functions/offers.js` - endpoint `GET/PUT` pentru oferte
- `netlify.toml` - configurare functions directory
- `package.json` - dependinte serverless (`@netlify/blobs`)

## 4. Functionalitati principale implementate
- meniu mobil responsive
- dark/light mode cu persistenta
- filtrare + cautare produse in meniu
- reveal animations si parallax
- banner cookies
- galerie lightbox
- CTA-uri telefon/WhatsApp/harta
- SEO on-page (meta, OG, JSON-LD, sitemap, robots)

## 5. Sistemul de oferte (implementare tehnica)

### 5.1 Backend API
- endpoint public citire: `GET /.netlify/functions/offers`
- endpoint admin update: `PUT /.netlify/functions/offers`
- fisier: `netlify/functions/offers.js`
- stocare: Netlify Blobs (`offers.json`)

### 5.2 Validare date oferta
- `discount` intre `1` si `95`
- `start` si `end` valide
- `end` strict mai mare decat `start`
- sanitizare map oferte inainte de persistare

### 5.3 Autentificare admin
- `PUT` autorizat prin headere:
  - `X-Admin-User`
  - `X-Admin-Pass`
- creditele sunt verificate fata de variabilele de mediu:
  - `ADMIN_USER`
  - `ADMIN_PASS`

### 5.4 Sincronizare cross-device
- ofertele sunt citite de pe server la incarcare
- refresh periodic server-side pentru continut actual
- afisare in:
  - `index.html` (zona Oferte actuale)
  - `meniu.html` (zona Oferte in partea superioara)
  - carduri de produs (`data-product-id`) cu badge/stare oferta

## 6. Panoul de administrare (`admin-oferte.html`)
- login intern cu user/parola
- selectare produs din catalog
- setare reducere + data/ora start + data/ora final
- salvare, modificare, stergere oferta
- lista oferte existente cu editare in-line
- status UI pentru succes/eroare

## 7. UX/UI oferte (premium marketing)
- carduri promo cu:
  - stare: `Activa acum` / `Programata`
  - badge reducere accentuat (`-XX%`)
  - perioada evidentiata
  - countdown live (`Expira in` / `Porneste in`)
  - mesaj „Valabila in limita stocului disponibil”
  - CTA orientat pe conversie
- empty-state premium pentru campanii inactive
- copy reformulat in ton profesional de vanzare
- design coerent in ambele teme (dark/light)

## 8. Responsive (mobil/tableta/desktop)
- desktop: grid ofertare 3 coloane
- tableta: 2 coloane
- mobil: 1 coloana
- ajustari dedicate pentru:
  - dimensiune badge
  - lizibilitate countdown
  - evitarea cliparii imaginilor
  - stabilitate vizuala (fara flicker)

## 9. Configurare Netlify (obligatoriu pentru oferte)
Seteaza variabilele in Netlify:
- `BLOBS_SITE_ID`
- `BLOBS_TOKEN`
- `ADMIN_USER`
- `ADMIN_PASS`

Observatie:
- fara variabilele BLOBS, API-ul de oferte returneaza eroare de configurare.

## 10. Deploy
- repository: `https://github.com/TheTechology/LaMarianFastFood`
- deploy production pe Netlify
- URL productie: `https://shaoramadjud.netlify.app`

## 11. Rulare locala
1. Clone repo
2. Ruleaza local static (ex: `python3 -m http.server`)
3. Pentru functionalitate completa oferte cross-device, foloseste deploy Netlify cu variabilele setate.

## 12. Beneficii rezultate
- administrare simpla a promotiilor fara editare manuala in pagini
- afisare automata si sincronizata pe toate dispozitivele
- prezentare premium, orientata pe conversie
- baza tehnica scalabila pentru campanii viitoare

## Autor
Marian Dumitru
