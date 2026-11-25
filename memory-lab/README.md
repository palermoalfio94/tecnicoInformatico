# MEMORY LAB — Il laboratorio delle memorie

**[Apri Memory Lab nel browser](https://palermoalfio94.github.io/tecnicoInformatico/memory-lab/)**

Laboratorio didattico autonomo per il primo anno di scuola superiore. Insegna da zero RAM, ROM e firmware, cache, HDD, SSD e unità di misura.

## Avvio immediato e offline

1. Estrarre **tutta la cartella** dal file ZIP.
2. Aprire `index.html` con Google Chrome o Microsoft Edge.
3. Inserire il nome, oppure un nome di fantasia, scegliere un avatar e leggere il tutorial di BYTE.

Non occorrono server, installazioni, account, compilazione o connessione. Mantenere `index.html`, `style.css`, `content.js` e `app.js` nella stessa cartella. Il codice dell'app usa soltanto HTML, CSS e JavaScript vanilla, senza librerie esterne.

## Il percorso

Le sei postazioni sono tutte disponibili, in qualsiasi ordine. Ogni postazione comprende:

- **Scopri**: quattro spiegazioni brevi, esempi e illustrazioni.
- **Sperimenta**: un modello interattivo con obiettivi da completare. Premere **Concludi l'esperimento** per acquisire la scheda del quaderno.
- **Dimostra**: cinque esercizi estratti casualmente da otto domande, con almeno un esercizio diverso dalla scelta multipla. Ogni risposta corretta vale 20 punti.

Per superare servono almeno 70/100. Essendo possibili soltanto multipli di 20, quattro risposte corrette portano a 80/100 e permettono di superare. Tentativi illimitati; viene conservato il miglior risultato, anche ripetendo una verifica già superata. Il massimo complessivo è **600 punti**; la missione finale non aggiunge punti.

Le verifiche interrotte si possono riprendere tornando nella postazione e scegliendo **Dimostra**. La teoria e il quaderno restano consultabili. Non ci sono limiti di tempo né classifiche.

## Gli esperimenti

| Postazione | Esperimento | Obiettivi |
| --- | --- | --- |
| RAM | Gestisci un PC con 8 GB | Aprire due tipi di app; tentare di superare la capacità; salvare e spegnere |
| ROM | Ricostruisci l'avvio | Avviare nella sequenza corretta e osservare il firmware danneggiato |
| Cache | Richiedi i dati A–E | Sei richieste, almeno un hit e una sostituzione con regola FIFO |
| HDD | Gestisci un archivio da 8000 MB | Salvare tre tipi di file, recuperare, eliminare e spegnere l'unità |
| SSD | Confronta due caricamenti | Osservare la gara e scegliere l'unità per quattro esigenze |
| Unità | Riempi una chiavetta da 8 GB | Tre tipi di file, capacità superata e piccoli esercizi sulle misure |

Il modello RAM non riserva spazio al sistema operativo, per concentrare l'attenzione sul consumo delle applicazioni. Il caricamento HDD/SSD usa **6 e 2 secondi illustrativi**, non misure effettuate su computer reali. Dimensioni dei file, capacità degli archivi ed esempi sono didattici. La cache usa tre posti e una regola FIFO dichiarata, senza simulare tutta la complessità di una CPU reale.

## Quaderno e diploma in PDF

Il **Quaderno del Tecnico** si arricchisce dopo ciascun esperimento concluso. Contiene definizioni, caratteristiche, esempi, osservazioni e migliori punteggi. La tabella comparativa si aggiunge dopo tutte le sei postazioni superate.

Premere **Stampa / Salva come PDF** e scegliere **Salva come PDF** nella finestra del browser. L'impaginazione di stampa usa fogli A4 e nasconde menu e pulsanti. Si può esportare anche un quaderno ancora parziale.

La missione **Ripara il computer** si sblocca dopo tutte le postazioni superate. Occorre aiutare tre clienti scegliendo un intervento e una motivazione, poi percorrere lo schema semplificato HDD/SSD → RAM → cache → CPU. Infine si può stampare il **Diploma di Tecnico della Memoria**, con nome, data e punteggio. È un attestato didattico, non una certificazione professionale.

## Salvataggio, accessibilità e PC condivisi

Nome, avatar, esperimenti, quaderno, verifiche e missione finale sono salvati automaticamente nel `localStorage` del browser. Il salvataggio è legato a browser, profilo e percorso del file o indirizzo del sito. Non è sincronizzato tra dispositivi. Spostare il file, cambiare browser o cancellare i dati del sito può far iniziare un nuovo percorso.

Un messaggio in fondo alla pagina segnala se il browser impedisce il salvataggio. In quel caso mantenere aperta la scheda. I salvataggi parziali o non validi vengono gestiti ripristinando i valori sicuri.

Sui PC condivisi usare **Ricomincia da zero** prima del prossimo studente. È richiesta conferma e viene cancellata soltanto la partita di Memory Lab. Operazione PC non viene modificato.

Il pulsante **Animazioni** riduce i movimenti; viene rispettata anche la preferenza di sistema per le animazioni ridotte. BYTE occupa uno spazio separato dai comandi, così non copre i pulsanti. Su schermi piccoli la spiegazione si apre dal pulsante «BYTE · Aiuto». Le risposte MB/TB alla domanda sulla fotografia mostrano subito una spiegazione vicina e conservano la scelta. Non ci sono suoni automatici. Le azioni sono utilizzabili tramite clic e tastiera; le tessere dell'avvio hanno anche il trascinamento. Feedback con testo e simboli affiancano i colori.

## Proposta di lezione: circa 60 minuti

- Introduzione e tutorial: 4 minuti.
- Sei postazioni: circa 7 minuti ciascuna, comprese lettura, esperimento e verifica.
- Missione finale: 9 minuti.
- Rilettura del quaderno e attestato: 5 minuti.

Sono tempi orientativi: una partita rapida può durare meno, mentre ripassi e nuovi tentativi possono allungarla. Il gioco non forza attese per raggiungere una durata prefissata.

## Pubblicazione su GitHub Pages

1. Creare un nuovo repository GitHub per Memory Lab, oppure usare una sottocartella di un repository scelto dal docente.
2. Caricare `index.html`, `style.css`, `content.js` e `app.js`, mantenendoli nella stessa cartella. Questo README può essere incluso.
3. In **Settings → Pages**, scegliere la pubblicazione da un ramo, selezionare `main` e la cartella di pubblicazione.
4. Attendere la pubblicazione e usare il link fornito da GitHub Pages.

Nella configurazione con una sottocartella, l'indirizzo terminerà con il nome della cartella. Non sono richiesti GitHub Actions, dipendenze o build. Non sovrascrivere `index.html` di un altro gioco già pubblicato.

## Organizzazione del codice

- `index.html`: struttura della pagina e caricamento delle risorse relative.
- `style.css`: laboratorio, simulazioni, layout responsive e stampa A4.
- `content.js`: spiegazioni, schede, 48 domande con risposte e feedback, clienti e confronto finale.
- `app.js`: stato validato, salvataggio, navigazione, SVG, sei simulazioni, verifiche, quaderno e missione finale.

Gli script sono classici, non moduli, così l'app si apre direttamente anche tramite `file://`.

## Verifica della versione consegnata

Sono stati eseguiti oltre 1.200 controlli automatici: sei esperimenti, tutte le 48 domande con risposte corrette ed errate, percorso fino a 600/600 e diploma, migliori punteggi, quaderno, ritorno alla verifica e salvataggi incompleti o danneggiati. È stato inoltre completato il percorso nel browser, inclusi tutti gli esperimenti, le sei verifiche, i tre clienti e la missione finale, senza errori JavaScript rilevati. Il layout è stato controllato a 1366 × 768 e su schermo piccolo. La stampa viene affidata alla finestra nativa del browser; scegliere Chrome o Edge per utilizzare Salva come PDF.

## Riferimenti didattici

Contenuti riscritti per studenti principianti. Riferimenti di controllo:

- [OpenStax, Memory Hierarchy](https://openstax.org/books/introduction-computer-science/pages/5-5-memory-hierarchy): gerarchia, cache, RAM e volatilità.
- [Intel, How to Update BIOS](https://www.intel.com/content/www/us/en/gaming/resources/how-to-update-bios.htm): firmware BIOS/UEFI e aggiornabilità.
- [Samsung Semiconductor, DRAM](https://semiconductor.samsung.com/dram/): memoria e archiviazione su NAND flash non volatile.

I collegamenti sono documentazione facoltativa: il laboratorio funziona completamente offline e non li carica durante il gioco.
