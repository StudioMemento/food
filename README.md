# Memento Food · V4

Revisione del 5 ottobre 2026, successiva alla V3 e basata sui nuovi screen.

## Vercel

Sito statico completo: la cartella che contiene `index.html` è la root del progetto. Preset **Other**, nessun comando di build. Immagini e font inclusi. Per provarlo in locale: `python -m http.server 8000`, quindi `http://localhost:8000`. I dati JSON richiedono HTTP, non l’apertura diretta con `file://`.

## Questa revisione

- Nuova fotografia esterna per la hero. Sei nuove immagini in totale: esterno, tavolata, accoglienza, cucina, dettagli e archviz.
- Introduzioni di categoria a tutto viewport, titolo a bastoni, copy corsivo, immagine sfumata e blur sulla sinistra. Eliminato il cappello «Menù — Scegli. Scopri. Assaggia.».
- Catalogo: nome, prezzo con aggiunta, allergeni, ingredienti. Due colonne su mobile. Sotto 360 px l’aggiunta diventa un pulsante «+» con etichetta accessibile.
- Popup allergeni senza pannello: solo blur, titolo grande, tre colonne (numero, nome maiuscolo, descrizione). Quindicesima voce con asterisco per i prodotti surgelati.
- Player con immagine di 80dvh in orizzontale e 100vw in verticale. Tutti i 72 prodotti formano un unico ciclo. Tre thumbnail per lato e freccia di apertura al centro, senza immagine attiva o box. Prezzo sotto il titolo, aggiunta sotto a destra. Su schermi verticali piccoli il contenuto può scorrere senza ridurre la fotografia; l’apertura della vista B porta automaticamente in vista l’immagine intera.
- Navbar in vetro traslucido, icone minimali, due divisori, categoria attiva sincronizzata. Header e piede viewport hanno solo blur progressivo, senza gradiente scuro sovrapposto.
- Gallery a tutto viewport con nove scene, didascalia centrata, indicatori e avanzamento integrato; nessun contatore o pulsante pausa. In modalità movimento ridotto l’avanzamento automatico si ferma.
- Sala interattiva di 21 tavoli: da 2 a 20 coperti, terrazza, cucina e bagni. Data → orario → tavolo oppure tavolo → disponibilità. Si possono digitare direttamente i coperti. Occupazioni simulate, conferma, indicatori su data/orario/tavolo, persistenza, cancellazione e controllo sovrapposizioni di 90 minuti.
- Tre flussi social indipendenti e infiniti: otto post Instagram con copy e hashtag specifici, sei recensioni Google e sei Tripadvisor da 3, 4 e 5 stelle. Autoplay lento continuo, drag mouse, swipe touch, frecce e tastiera. Nessun contatore. L’interazione, il focus da tastiera e la preferenza di movimento ridotto sospendono l’autoplay.
- Chiusura con grande titolo, logo, immagine della location collegata a Google Maps, Piazza Trento 12, orari e contatti. La foto è l’esterno del locale immaginario; il link Maps cerca «Memento Studio Piazza Trento 12». Nessuna città è stata inventata.
- Particelle leggere lungo i margini, presenti anche nel player, reattive a mouse e touch. Rendering sospeso nella scheda inattiva e movimento rispettoso delle preferenze del dispositivo.

## Padding e breakpoint

Un’unica variabile `--page-pad` governa header, hero, introduzioni, catalogo, testo e frecce del player, prenotazione, social e chiusura. Le foto a tutta larghezza sono l’eccezione intenzionale.

| Larghezza | Margine laterale |
| --- | --- |
| 320–599 px | 20 px |
| 600–1023 px | 32 px |
| Da 1024 px | 5vw, minimo 40 px e massimo 80 px |
| Schermi ampi | Contenuto massimo 1440 px, centrato |

La navbar segue il safe area inferiore del dispositivo. Per la sua densità usa margini propri di 8 px su mobile.

## Asset e lingue

72 PNG A e 69 PNG B originali sono conservati senza ricompressione. Le tre viste B assenti nell’archivio (`pulled`, `straccetti`, `pepite`) mantengono i WebP precedenti. Gli abbinamenti sono in `asset-mapping.json`.

Per il futuro passaggio a WebP modificare in `catalog.json` i campi `image`, `reveal`, `thumbnail`. Le foto del locale sono in `assets/venue/v4`; prompt e provenienza sono documentati in `IMAGE_NOTES_V4.md`. Le PNG restano volutamente pesanti in questa fase di sviluppo.

Lingue principali: IT, EN, DE, FR, ES. Tradotti anche copy social, gallery e descrizioni degli allergeni. I nomi di fantasia dei prodotti restano italiani; informative privacy estese in IT/EN.

## Dati operativi

Orari in `config.json`: lunedì chiuso, martedì–giovedì 18:00–00:00, venerdì–domenica 18:00–02:00, fuso Europe/Rome e gestione oltre mezzanotte.

Carrello, recensioni, disponibilità e prenotazioni sono dimostrativi. Non partono ordini, prenotazioni o messaggi. Le prenotazioni salvate bloccano gli slot solo nello stesso browser. Non essendo stato fornito un telefono reale, «chiama» apre il contatto dello studio. Per attivare una linea telefonica, impostare `mode: live` e `phone` in formato internazionale nel file di configurazione. Per un servizio di prenotazione reale serve un backend condiviso.

## Verifica

Esiti e viewport verificati sono in `verification.json`. Il pacchetto non contiene dipendenze di sviluppo né servizi esterni per il rendering. I collegamenti Maps, sito dello studio ed email si aprono solo su richiesta dell’utente.
