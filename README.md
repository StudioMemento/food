# Memento Food · V3

Aggiornamento del 5 ottobre 2026, basato sulla versione pubblicata su mementofood.vercel.app.

## Pubblicazione su Vercel

La cartella contiene un sito statico completo. Usa la cartella che contiene `index.html` come root del progetto e il preset **Other**. Non serve un comando di build. Tutti i font e le immagini sono inclusi; non dipende dal vecchio sito.

Per una verifica locale: avvia `python -m http.server 8000` nella cartella, poi apri `http://localhost:8000`. Aprire direttamente index.html con `file://` non permette il caricamento dei dati JSON.

## Modifiche

- Hero con tre atmosfere selezionabili, parallax del puntatore e luce interattiva; rispetta la preferenza di movimento ridotto.
- Introduzioni con titoli a bastoni, copy in corsivo e animazione di ingresso.
- Catalogo a due colonne su mobile, prezzi più grandi, ingredienti a elenco e nuova riga allergeni/aggiunta.
- Player continuo di 72 prodotti: scorrimento fra tutte le categorie, chiusura circolare, navbar sincronizzata, thumbnail degli ultimi drink a sinistra del primo panino. Frecce verticali e invito gestuale animato; swipe e tastiera supportati.
- Header con logo rivisto, chiamata prima delle cinque lingue e blur progressivo senza gradiente nero.
- IT, EN, DE, FR, ES per interfaccia principale, ingredienti, allergeni, gallery, orari, prenotazione e social. I nomi di fantasia dei prodotti restano italiani nelle tre nuove lingue. I testi estesi delle informative privacy mantengono le versioni IT/EN.
- Sei scene nella gallery, didascalia centrale, avanzamento e pausa. Due nuove fotografie del locale e un nuovo render architettonico.
- Prenotazione in entrambi i sensi, con otto tavoli interattivi, 90 minuti per prenotazione, disponibilità simulata variabile, conferma, persistenza e cancellazione. Le prenotazioni bloccano anche gli slot sovrapposti.
- Tre slider distinti: sei post Instagram, sei recensioni Google e sei Tripadvisor, comprese recensioni da tre e quattro stelle. Contenuti dimostrativi.
- Chiusura rivista. Lunedì chiuso; martedì–giovedì 18:00–00:00; venerdì–domenica 18:00–02:00, con gestione del servizio oltre mezzanotte.

## Immagini e futura ottimizzazione

Sono inclusi 72 PNG A e 69 PNG B forniti, copiati senza ricompressione o modifica. Tre viste B non erano presenti nell’archivio: `pulled`, `straccetti`, `pepite`. Per queste sono conservate le tre WebP della versione pubblicata. `asset-mapping.json` documenta gli abbinamenti.

I percorsi per sostituire successivamente gli asset con WebP sono in `catalog.json`: `image`, `reveal`, `thumbnail`. Il player carica le viste B quando richieste; catalogo e immagini delle thumbnail usano caricamento progressivo. Questa consegna conserva il peso dei PNG richiesto per la fase di sviluppo.

## Modalità dimostrativa

Prenotazioni e carrello rimangono nel browser. Non vengono inviati ordini, messaggi o prenotazioni a un locale. Non è presente un numero telefonico reale: il pulsante chiama mantiene il contatto Memento Studio. Per collegare un locale reale servono numero, backend prenotazioni e dati operativi verificati. Il sito non include analytics o feed social incorporati.

## Verifica

Verificati in Chromium: flussi di prenotazione da data e da tavolo, collisioni e persistenza, carrello e personalizzazione, cambio lingua, player circolare, transizione A/B, gallery e social. Controllati desktop 1440 px e mobile 390/320 px. Testati gli orari a cavallo della mezzanotte. I dettagli sono in `verification.json`.
