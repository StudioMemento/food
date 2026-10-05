# Memento Food V2

Demo di pub, hamburgeria e bar. HTML, CSS e JavaScript senza dipendenze runtime.

## Avvio e pubblicazione

- `npm run dev` espone `dist` sulla porta 4173.
- `npm run build` verifica catalogo e asset.
- `npm test` verifica disponibilità, capienza, sovrapposizioni e orari.
- Su Vercel: framework Other, output directory `dist`; configurazione in `vercel.json`.
- `MEMENTO_FOOD_V2_ANTEPRIMA.html` si apre direttamente dal filesystem. Include foto, font e dati: non richiede un server.

## Revisione

Kaushan Script e Manrope del riferimento; logo aggiornato. Catalogo con prezzo a destra, aggiunta sotto, allergeni numerati e ingredienti in elenco. Player senza etichette superflue, nome grande, gesti verticali, frecce laterali e thumbnail squircle a scorrimento circolare. Navbar liquid glass CSS con fallback opaco: tutte le categorie su desktop; famiglia cibo/bevande compatta solo su mobile. Locale e carrello nella barra; lingua, telefono e info in alto.

72 nuove immagini reveal, 4 foto di un pub immaginario e 3 foto social. Ogni foto prodotto occupa una tela quadrata nel player con spazio superiore. Le coordinate di registrazione sono in `catalog.json`: per i drink il bicchiere originale rimane interamente fisso e il livello motion è ritagliato sopra il bordo. Per il cibo il livello inferiore della foto originale conserva l’appoggio e la transizione è sfumata. Gli asset grezzi vanno usati con questi parametri del player, non con un semplice cambio di `src` a tutto schermo. `ASSET_MANIFEST_V2.json` conserva i prompt e la provenienza.

Il carrello è un dialogo sovrapposto: chiudendolo si torna allo stesso prodotto e alla stessa navigazione. Quantità, personalizzazioni e note restano locali. Nessun ordine viene inviato.

## Prenotazioni

Calendario a 90 giorni, slot ogni 30 minuti, permanenza di 90 minuti, preavviso di 30 minuti; disponibilità collegata agli orari in Europe/Rome. Planimetria fittizia con 8 tavoli, 2–8 posti, scelta dei singoli posti e dei coperti. Verifica capienza e sovrapposizioni, conferma e annullamento, persistenza sul dispositivo. Alcuni tavoli sono occupati da un calendario simulato ripetibile.

Questa è una demo locale: non esiste una disponibilità condivisa tra clienti e non vengono inviate prenotazioni a un locale. Per l’esercizio reale servono API/database con blocco atomico del tavolo, gestione staff e notifiche. Non raccoglie nomi, recapiti o pagamenti.

## Social, orari e privacy

Post Instagram e recensioni Google/Tripadvisor dichiarati di esempio. Nessun punteggio è presentato come dato reale. Orari dimostrativi, stato aggiornato ogni 30 secondi, gestione oltre mezzanotte e chiusure eccezionali in `config.json`.

Popup privacy, preferenze e informative IT/EN. Non sono installati tracker, analytics, cookie pubblicitari o embed social. La scelta «Solo necessari» e la chiusura mantengono questa configurazione. Le categorie assenti non possono essere abilitate; si possono cancellare i dati locali dal pannello. La memoria locale contiene carrello, lingua, conferme demo e preferenza privacy.

L’informativa descrive questa demo, non certifica la conformità di un’attività reale. Prima della messa in esercizio completare identità e indirizzo del titolare, fornitori di hosting/prenotazione, basi giuridiche, conservazione dei log ed eventuali trasferimenti. Font e immagini sono locali. I riferimenti utilizzati sono le [FAQ del Garante](https://www.garanteprivacy.it/faq/cookie) e le [Linee guida cookie del 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876).

Selezione dei testi e menu contestuale sono disattivati sull’interfaccia; campi di inserimento e testo dell’informativa restano selezionabili per accessibilità e uso dei moduli. Questo accorgimento non è una protezione dalla copia del codice o degli asset.

## Configurazione

`dist/catalog.json`: 72 prodotti (12 Panini, 12 Cucina, 12 Stuzzicheria, 6 Dolci, 6 Birre, 6 Vini, 12 Drinks, 6 Amari), prezzi dimostrativi e coordinate A/B. Ricette e associazioni allergeni richiedono verifica prima dell’uso reale.

`dist/config.json`: orari, eccezioni, contatti. `dist/booking.js`: planimetria e disponibilità demo. `dist/experience.js`: calendario, social e privacy. `dist/v2.css`: revisione visuale. `VERIFICHE_V2.json`: risultati del collaudo.

## Collaudo V2

Verificato in Chrome 154 a 320×568, 390×844, 1440×1000 e 2560×1080: navigazione touch, immagini reveal, thumbnail circolari, carrello e personalizzazioni, allergeni, calendario/tavoli/posti, conferma e annullamento, persistenza locale, privacy e cambio lingua. Anteprima autonoma senza richieste esterne. Nessun errore JavaScript nei flussi esercitati. 14 verifiche della logica prenotazioni e decodifica di tutti i 231 asset WebP. Altri motori browser non sono stati eseguiti. Le schermate sono in `verifica-visiva/`.
