# Memento Food · V5

Polish del 5 ottobre 2026, successivo alla V4.

## Vercel

Sito statico completo. La cartella con `index.html` è la root del progetto: preset **Other**, nessun comando di build. Immagini e font inclusi. Per provarlo in locale: `python -m http.server 8000`, quindi `http://localhost:8000`. I dati JSON richiedono HTTP; non aprire direttamente `index.html` con `file://`.

## Correzioni V5

- Home nera e minimale, grande logo Memento Food con luce e inclinazione leggere che seguono mouse e touch. Due sole azioni: «Esplora il menù» e «Prenota un tavolo». Stato aperto/chiuso integrato sotto le azioni e aggiornato secondo gli orari.
- Catalogo: titolo, allergeni e ingredienti a sinistra; prezzo sopra «+ Aggiungi al carrello» in basso a destra. Su mobile rimangono due colonne e ogni card porta prezzo e pulsante sotto gli ingredienti, sempre a destra, senza sovrapposizioni. La chiusura del player con mouse o touch non lascia un contorno sulle fotografie; il focus da tastiera resta visibile.
- Popup allergeni senza scorrimento orizzontale e con sfondo oscurato e sfocato. Allergeni presenti in giallo, più grandi e in grassetto; gli altri in grigio e più leggeri. X più grande, senza cerchio. Quindicesima voce con asterisco e chiusura «Per ulteriori informazioni, chiedere al personale».
- Player: A e B condividono lo stesso riquadro, senza ricomposizione del layout né scroll automatico. La foto rimane protagonista: 80dvh in orizzontale, 100vw in verticale; sui dispositivi orizzontali con altezza ≤600 px il riquadro si adatta allo spazio disponibile per non tagliare il soggetto. In verticale gli ingredienti possono sovrapporsi alla foto aperta. Tre miniature per lato, opacità ridotta, dissolvenza ai margini, freccia centrale a tre quarti dell’altezza e spazio libero sopra la navbar. Invito swipe al centro dello schermo, nascosto alla prima interazione o dopo circa quattro secondi.
- Selettore lingue a capsula, ispirato al riferimento Via Roma: IT, EN, DE, FR, ES. Selezione dorata animata, navigazione anche da tastiera, lingua memorizzata. Icona chiamata allineata alla capsula.
- Contatto Memento Studio: **+39 328 545 4661**, visibile e cliccabile nel popup, configurato in `config.json`.
- Nuovo esterno generato usando l’archviz come riferimento: edificio basso in mattoni, acciaio nero, vetrate e terrazza; nessuna persona. Sostituito nella gallery, nella foto collegata a Maps e nel relativo post social. Prompt in `IMAGE_NOTES_V5.md`.

## Funzioni mantenute

72 prodotti in un unico ciclo nel player, categoria attiva sincronizzata, carrello con personalizzazione. Introduzioni di categoria a tutto viewport e gallery del locale con nove scene. Navbar in vetro e particelle reattive ai margini. Header e bordo inferiore usano blur progressivo senza una tinta scura aggiunta; l’oscuramento richiesto si applica solo al popup allergeni. Sullo sfondo nero del player il blur superiore è disattivato per mantenere nitida la foto.

Prenotazione con 21 tavoli da 2 a 20 posti, disponibilità simulate, scelta per data oppure tavolo, conferma e occupazione dello slot, persistenza e cancellazione. Tre flussi social con autoplay continuo, drag mouse e swipe touch: otto post Instagram, sei recensioni Google e sei Tripadvisor. Chiusura con logo, location collegata a Maps, Piazza Trento 12, orari e contatti.

## Padding e breakpoint

Un’unica variabile `--page-pad` governa header, hero, introduzioni, catalogo, testo e frecce del player, prenotazione, social e chiusura. Le foto a tutta larghezza sono l’eccezione intenzionale.

| Larghezza | Margine laterale |
| --- | --- |
| 320–599 px | 20 px |
| 600–1023 px | 32 px |
| Da 1024 px | 5vw, minimo 40 px e massimo 80 px |
| Schermi ampi | Contenuto massimo 1440 px, centrato |

La navbar e la distanza dalle miniature rispettano il safe area inferiore. Su telefoni piccoli la X del player occupa una riga dedicata sotto l’header, evitando collisioni con le cinque lingue.

## Asset e struttura

72 PNG A e 69 PNG B originali conservati senza ricompressione. Le tre viste B assenti nell’archivio (`pulled`, `straccetti`, `pepite`) mantengono i WebP precedenti. Abbinamenti in `asset-mapping.json`. Per il futuro passaggio a WebP cambiare `image`, `reveal`, `thumbnail` in `catalog.json`.

`app.js` gestisce catalogo, player, popup, carrello e lingue. `v4.js` conserva prenotazione e social; `polish.js` anima il logo. I fogli precedenti rimangono la base visiva, `v5.css` contiene le correzioni di questa revisione. Fotografie del locale in `assets/venue/v4` e `assets/venue/v5`; prompt e provenienza nei relativi file `IMAGE_NOTES`.

Lingue: IT, EN, DE, FR, ES, inclusi social, gallery e allergeni. Nomi e ingredienti seguono le traduzioni disponibili nel catalogo; informative privacy estese in IT/EN.

## Dati operativi

Orari in `config.json`: lunedì chiuso; martedì–giovedì 18:00–00:00; venerdì–domenica 18:00–02:00. Fuso Europe/Rome, con gestione oltre mezzanotte.

Carrello, recensioni, disponibilità e prenotazioni sono dimostrativi. Non partono ordini, prenotazioni o messaggi. Le prenotazioni bloccano gli slot nello stesso browser; un servizio reale richiede un backend condiviso. Il popup contatti usa il numero dello studio fornito e il link `tel:` si attiva soltanto quando viene selezionato.

Il link Maps cerca «Memento Studio Piazza Trento 12»; nessuna città è stata inventata. La foto rappresenta il locale immaginario della demo.

## Verifica

Controlli funzionali e viewport in `verification.json`. Il pacchetto include tutto il necessario per il rendering e non richiede dipendenze di sviluppo. Maps, telefono, email e sito dello studio si aprono solo su richiesta dell’utente.
