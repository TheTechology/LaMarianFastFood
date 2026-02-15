# La Marian Fast Food - Site web de prezentare

Proiect realizat de Marian Dumitru.

## Descriere generala
`La Marian Fast Food` este un website static, optimizat pentru prezentarea unui fast-food local din Adjud. Platforma pune accent pe informare rapida, accesibilitate, contact direct (telefon/WhatsApp), vizibilitate in cautari locale si experienta consistenta pe mobil si desktop.

## Scopul proiectului
- prezentarea brandului si a produselor principale (burger, shaorma, doner)
- facilitarea conversiei rapide catre comanda telefonica
- oferirea informatiilor esentiale: locatie, program, meniu, FAQ, politici
- consolidarea prezentei online locale prin SEO tehnic on-page

## Ce s-a realizat
- website multipagina complet:
  - `index.html` (home)
  - `meniu.html`
  - `retetar.html`
  - `galerie.html`
  - `despre.html`
  - `faq.html`
  - `contact.html`
  - pagini informative/legale: `termeni.html`, `confidentialitate.html`, `cookies.html`, `declaratie-nutritionala.html`
  - pagini SEO dedicate: `burger-adjud.html`, `shaorma-adjud.html`, `doner-adjud.html`, `fast-food-adjud-vrancea.html`
- integrare elemente SEO:
  - meta title/description/keywords
  - Open Graph + Twitter Card
  - date structurate JSON-LD (`Restaurant`, `LocalBusiness`, `FastFoodRestaurant`)
  - `robots.txt` si `sitemap.xml`
  - `canonical` + `manifest.webmanifest`
- optimizare UX:
  - navigatie responsive cu meniu mobil
  - apel rapid (`tel:`) si contact WhatsApp
  - carduri produse + call-to-action-uri clare
  - sectiuni de incredere (program, timpi, locatie)

## Limbaje si tehnologii folosite
- `HTML5` - structura paginilor
- `CSS3` - stilizare, layout responsive, variabile CSS, efecte vizuale
- `JavaScript (Vanilla)` - functionalitati interactive fara framework
- fara backend; proiect 100% static

## Functionalitati implementate (JavaScript)
- comutare tema `dark/light` cu persistenta in `localStorage`
- meniu mobil cu `aria-expanded`
- animatii de tip reveal la scroll (`IntersectionObserver`)
- filtrare meniu dupa categorie + cautare text
- galerie cu lightbox si inchidere la `Escape`
- banner cookies cu memorare consimtamant
- efect parallax pe elemente vizuale
- inserare automata nota legala pentru imaginile de produs

## Design implementat
Designul urmareste un stil modern, orientat pe conversie:
- layout pe grid-uri si carduri pentru citire rapida
- header sticky pentru acces permanent la navigatie
- CTA-uri vizibile pentru comanda imediata
- tipografie combinata:
  - `Sora` pentru titluri si elemente de brand
  - `Manrope` pentru text si lizibilitate
- accent pe ierarhie vizuala (headline puternic, badge-uri, etichete, sectiuni clar delimitate)

## Cromatica
Sistemul vizual foloseste variabile CSS centralizate in `:root`, cu suport dual-theme:

- Tema Dark (implicita):
  - fundal: `#0e1116`
  - fundal secundar: `#171b23`
  - card: `#1f2530`
  - text principal: `#f6f7fb`
  - text secundar: `#b6bdcc`
  - accent principal: `#ff5a1f`
  - accent secundar: `#ff8744`
  - accent de contrast: `#ff3d2e`

- Tema Light:
  - fundal: `#f6f8fc`
  - fundal/card: `#ffffff`
  - text principal: `#2d3c51`
  - text secundar: `#5a6a7f`
  - separatoare: `#d7deea`

Directia cromatica imbina tonuri inchise premium cu accente calde de portocaliu/rosu pentru energie vizuala si evidentierea actiunilor importante.

## Accesibilitate si bune practici
- structurare semantica HTML
- `alt` pe imagini
- link de skip (`Sari la continut`)
- etichete `aria` pentru controale interactive
- contrast bun intre fundal si text in ambele teme

## Structura proiectului
- `assets/css/styles.css` - stiluri globale, teme, responsive
- `assets/js/main.js` - logica interactiva
- `assets/img/` - imagini optimizate pentru produs si brand
- `Imagini_Produs/` - surse imagine suplimentare
- pagini `.html` in radacina proiectului

## Rulare locala
1. Deschide folderul proiectului.
2. Ruleaza pagina principala prin dublu-click pe `index.html` sau printr-un server local.
3. Pentru testare completa recomandat: server static local (ex. `python3 -m http.server`).

## Autor
Marian Dumitru
