LIMBO WEBSITE — COME PERSONALIZZARLO

1) TESTI
Apri i file .html con un editor di testo (consigliati Visual Studio Code o Zed).
- index.html = homepage
- projects.html = archivio progetti
- project-japan.html = pagina del progetto Japan
- about.html = pagina About
- custom.html = pagina Custom Frames
- contact.html = pagina Contact

I testi sono direttamente nell'HTML: cerca la frase da cambiare e sostituiscila, senza eliminare i tag <p>, <h1>, <h2>, ecc.

2) IMMAGINI
Le immagini sono nella cartella assets.
Per sostituire una foto mantenendo lo stesso nome, basta mettere la nuova immagine in assets al posto di quella esistente.
In alternativa modifica il percorso dentro l'attributo src="assets/nome-file.jpg" nel file HTML.
Consigli: JPG/WebP per fotografie, PNG per loghi o immagini con trasparenza. Mantieni immagini grandi (circa 1800–2400 px sul lato lungo) e ottimizzate per il web.

3) FONT E DIMENSIONI
Il sito usa DM Sans. La scelta del font è all'inizio di styles.css, nella riga @import e nella proprietà font-family del body.
Per cambiare le dimensioni in modo centralizzato, modifica i valori nel blocco finale di styles.css chiamato “QUICK TYPE CONTROLS”.
Le variabili principali sono:
- --hero-copy-size: testo introduttivo della homepage su desktop
- --chapter-title-size: titoli grandi delle sezioni della homepage
- --page-title-size: titoli delle pagine interne (About, Projects, ecc.)
- --page-lead-size: testo introduttivo sotto il titolo delle pagine
- --body-copy-size: testi normali su desktop
- --mobile-hero-copy-size: testo introduttivo homepage su smartphone
- --mobile-chapter-title-size: titoli delle sezioni su smartphone
- --mobile-page-title-size: titoli delle pagine interne su smartphone
- --mobile-page-lead-size: testo introduttivo su smartphone
- --mobile-body-copy-size: testi normali su smartphone

Esempio: per ingrandire il testo introduttivo mobile, cambia --mobile-hero-copy-size: 25px in 27px.

4) COLORI E SPAZIATURE
Sempre in cima a styles.css:
--yellow = giallo LIMBO
--ink = quasi nero
--paper = fondo chiaro
--pad = margini laterali responsive

5) PUBBLICAZIONE
Questa è una versione statica: per ora si modifica lavorando sui file HTML/CSS e poi si ricarica la cartella sul servizio di hosting. Non c'è un pannello CMS tipo WordPress: per aggiornare contenuti e immagini bisogna intervenire sui file.
