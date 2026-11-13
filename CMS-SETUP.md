LIMBO — CMS
===========

Il sito è predisposto per Decap CMS. Il pannello sarà raggiungibile da /admin e consente di gestire testi delle pagine, progetti e immagini. I contenuti vengono salvati in JSON dentro il repository GitHub; il frontend legge questi file e li mostra nelle pagine.

REPOSITORY
- GitHub: https://github.com/oiboy200/limbo-website
- Branch: main

PUBBLICAZIONE E ACCESSO
1. Pubblicare il repository su Netlify collegando GitHub.
2. Configurare l'autenticazione OAuth richiesta dal backend GitHub di Decap CMS. Tutti gli editor devono avere accesso in scrittura al repository, oppure va configurato un provider OAuth intermediario.
3. Aggiornare site_url e display_url in admin/config.yml con l'indirizzo Netlify effettivo.
4. Verificare /admin, login, salvataggio di una pagina, caricamento immagine e aggiornamento del sito.
5. Solo dopo i test, collegare il dominio Aruba modificando i DNS indicati da Netlify.

NOTA
Il CMS non è attivo finché hosting e autenticazione non sono configurati. Il backend Git Gateway di Netlify è deprecato per nuove configurazioni; per questo pacchetto è impostato il backend GitHub. Richiede una configurazione OAuth e account GitHub con permesso di scrittura.
