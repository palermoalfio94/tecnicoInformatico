/* Contenuti didattici e verifiche. Nessuna risorsa viene richiesta a Internet. */
"use strict";
const choice = (prompt, options, correct, why) => ({
  type: "choice",
  prompt,
  options,
  correct,
  why,
});
const tf = (prompt, correct, why) => ({
  type: "choice",
  prompt,
  options: ["Vero", "Falso"],
  correct: correct ? 0 : 1,
  why,
});
const match = (prompt, pairs, why) => ({ type: "match", prompt, pairs, why });
const order = (prompt, items, why) => ({ type: "order", prompt, items, why });
const number = (prompt, answer, unit, why) => ({
  type: "number",
  prompt,
  answer,
  unit,
  why,
});
const CONTENT = [
  {
    id: "ram",
    name: "RAM",
    subtitle: "La memoria di lavoro",
    color: "#82e7c6",
    label: "Banco di lavoro",
    intro:
      "Pensa alla RAM come al banco su cui lavori: qui il computer tiene i dati dei programmi aperti. Il banco ha uno spazio limitato e si svuota quando manca corrente. Nell’esperimento aprirai applicazioni, salverai un file e spegnerai il PC: osserva che cosa scompare e che cosa rimane.",
    slides: [
      [
        "Un banco per i programmi",
        "La RAM contiene temporaneamente dati e istruzioni usati dai programmi in esecuzione. Aprire un programma richiede spazio su questo banco: non è lo stesso che conservare il programma sul disco.",
        "Aprire una foto: il file resta su HDD o SSD, mentre i dati necessari per modificarla vengono portati in RAM.",
      ],
      [
        "Volatile significa temporanea",
        "La RAM comune dei PC è volatile: ha bisogno di alimentazione per conservare i dati. Spegnendo il computer, il suo contenuto si perde.",
        "Una modifica non salvata può andare persa. Il comando Salva scrive il file nell’archiviazione, che è non volatile.",
      ],
      [
        "Più programmi, più spazio",
        "La capacità si misura spesso in GB. Se i programmi richiedono più RAM di quella disponibile, il sistema può rallentare o non riuscire ad aprirne altri.",
        "8 GB è la capacità del nostro modello. I consumi delle applicazioni sono esempi inventati per capire il meccanismo.",
      ],
      [
        "RAM e archiviazione collaborano",
        "Aggiungere RAM può aiutare con molte applicazioni aperte, se la RAM è il limite. Non aumenta lo spazio del disco e non risolve ogni causa di lentezza.",
        "La scrivania è la RAM; l’armadio che conserva i documenti è l’archiviazione. Sono utili entrambi.",
      ],
    ],
    note: {
      definition:
        "Memoria di lavoro che conserva temporaneamente dati e istruzioni dei programmi in esecuzione.",
      features: [
        "Volatile: perde il contenuto senza alimentazione.",
        "Veloce, ma con capacità limitata; spesso si misura in GB.",
        "Più RAM può aiutare a usare più programmi insieme.",
      ],
      example:
        "Browser e programma di disegno aperti occupano parte della RAM.",
    },
    questions: [
      choice(
        "A cosa serve principalmente la RAM?",
        [
          "Conservare foto per anni",
          "Tenere dati e istruzioni dei programmi aperti",
          "Stampare documenti",
        ],
        1,
        "La RAM è lo spazio di lavoro dei programmi in esecuzione.",
      ),
      tf(
        "La RAM conserva tutto anche quando il computer viene spento.",
        false,
        "La RAM è volatile: senza alimentazione perde il contenuto.",
      ),
      choice(
        "Hai salvato un file e poi spegni il PC. Dove rimane il file?",
        ["Nella RAM", "Nell’archiviazione HDD o SSD", "Solo nella cache"],
        1,
        "Il salvataggio scrive nell’archiviazione non volatile.",
      ),
      number(
        "Hai 8 GB di RAM. Browser 2 GB e musica 1 GB sono aperti. Quanta RAM rimane?",
        5,
        "GB",
        "8 − 2 − 1 = 5 GB disponibili.",
      ),
      match(
        "Associa ogni situazione alla memoria coinvolta.",
        [
          ["Programmi aperti", "RAM"],
          ["File conservati a PC spento", "Archiviazione"],
        ],
        "RAM e archiviazione hanno funzioni diverse e collaborano.",
      ),
      choice(
        "Aumentare la RAM può aiutare soprattutto quando…",
        [
          "La RAM è insufficiente per i programmi aperti",
          "Manca carta nella stampante",
          "Vuoi più spazio sul disco",
        ],
        0,
        "Può aiutare il lavoro simultaneo se la RAM è la causa del rallentamento.",
      ),
      number(
        "Su 8 GB, un videogioco occupa 4 GB e un editor 3 GB. Quanto resta?",
        1,
        "GB",
        "8 − 4 − 3 = 1 GB. Non basta per un altro programma da 2 GB.",
      ),
      order(
        "Ricostruisci un lavoro sicuro prima di spegnere.",
        [
          "Apri il documento",
          "Modifica il documento",
          "Salva nell’archiviazione",
          "Spegni il computer",
        ],
        "Salvare prima dello spegnimento conserva le modifiche nell’archiviazione.",
      ),
    ],
  },
  {
    id: "rom",
    name: "ROM",
    subtitle: "Le istruzioni per partire",
    color: "#b8a1ff",
    label: "Camera di avvio",
    intro:
      "Un computer appena acceso ha bisogno di istruzioni per cominciare. Il firmware prepara l’avvio e non scompare quando spegni il PC. Scoprirai il legame con la ROM storica e con la memoria flash moderna. Poi proverai un avvio normale e uno con firmware danneggiato, soltanto nel nostro modello virtuale.",
    slides: [
      [
        "Istruzioni prima del sistema",
        "All’accensione viene eseguito il firmware: un software di base che prepara i componenti e avvia il processo che porta al sistema operativo.",
        "Prima di vedere il desktop, il computer deve sapere come iniziare.",
      ],
      [
        "Il concetto di ROM",
        "ROM significa Read-Only Memory, memoria a sola lettura. La ROM tradizionale conserva istruzioni che non si modificano durante l’uso normale; è non volatile.",
        "Spegnere la corrente non cancella le istruzioni conservate in una memoria non volatile.",
      ],
      [
        "Oggi: firmware in memoria flash",
        "Nei PC moderni il firmware UEFI è generalmente conservato in memoria flash non volatile, aggiornabile con procedure specifiche. Non è necessariamente una ROM tradizionale immutabile.",
        "Qui parliamo di ROM come concetto storico e di flash come supporto tipico del firmware moderno.",
      ],
      [
        "Quattro passi per partire",
        "Nel nostro modello: accensione, firmware, controllo iniziale dell’hardware, avvio del sistema operativo dall’archiviazione. È una sequenza semplificata.",
        "Se il firmware è assente o danneggiato, il PC potrebbe non riuscire ad avviarsi correttamente.",
      ],
    ],
    note: {
      definition:
        "La ROM tradizionale è una memoria non volatile a sola lettura. Nei PC moderni il firmware UEFI risiede generalmente in flash aggiornabile.",
      features: [
        "Il firmware è software di base per preparare l’avvio.",
        "Le istruzioni restano disponibili senza alimentazione.",
        "RAM e memoria del firmware hanno compiti differenti.",
      ],
      example:
        "Il firmware avvia i controlli prima che venga caricato il sistema operativo.",
    },
    questions: [
      choice(
        "Che cosa significa ROM?",
        [
          "Memoria a sola lettura",
          "Programma per fotografie",
          "Memoria dei programmi aperti",
        ],
        0,
        "ROM significa Read-Only Memory: è il concetto di memoria a sola lettura.",
      ),
      tf(
        "La memoria che conserva il firmware deve perdere tutto allo spegnimento.",
        false,
        "Deve essere non volatile per conservare le istruzioni tra un’accensione e l’altra.",
      ),
      choice(
        "Il firmware è…",
        [
          "Un software di base per l’avvio",
          "Il nome di un monitor",
          "Un tipo di fotografia",
        ],
        0,
        "È un insieme di istruzioni che prepara l’avvio del sistema.",
      ),
      choice(
        "Nei PC moderni il firmware UEFI è generalmente conservato in…",
        [
          "Una RAM che si svuota",
          "Memoria flash non volatile",
          "Un foglio di carta",
        ],
        1,
        "La flash non volatile permette di conservare e, con procedure specifiche, aggiornare il firmware.",
      ),
      order(
        "Riordina l’avvio semplificato.",
        [
          "Accensione",
          "Esecuzione del firmware",
          "Controllo iniziale dell’hardware",
          "Avvio del sistema operativo dall’archiviazione",
        ],
        "Il firmware interviene prima che il sistema operativo venga avviato.",
      ),
      match(
        "Associa le funzioni.",
        [
          ["Dati dei programmi in uso", "RAM"],
          ["Istruzioni iniziali di avvio", "Firmware"],
        ],
        "La RAM è lo spazio di lavoro; il firmware prepara il computer all’avvio.",
      ),
      tf(
        "Il firmware moderno può essere aggiornabile anche se è non volatile.",
        true,
        "Non volatile significa che conserva il contenuto senza corrente, non che sia sempre impossibile modificarlo.",
      ),
      choice(
        "Un firmware danneggiato può…",
        [
          "Impedire un avvio corretto",
          "Aumentare automaticamente la RAM",
          "Liberare spazio in tutti i file",
        ],
        0,
        "Il PC può non riuscire a completare correttamente la fase iniziale di avvio.",
      ),
    ],
  },
  {
    id: "cache",
    name: "CACHE",
    subtitle: "La memoria velocissima",
    color: "#ffd071",
    label: "Corsia del processore",
    intro:
      "Il processore (CPU) esegue istruzioni e lavora sui dati. Per ridurre alcune attese, usa una cache molto veloce e piccola, vicina al processore. È come tenere sulla scrivania i fogli che consulti spesso. Richiedi più volte gli stessi dati e osserva quando il processore li trova già a portata di mano.",
    slides: [
      [
        "Vicino al processore",
        "La cache della CPU conserva temporaneamente copie di dati e istruzioni utili. Di norma permette accessi più rapidi della RAM, ma ha capacità molto minore.",
        "Una piccola zona della scrivania subito accanto a te evita di raggiungere ogni volta lo scaffale.",
      ],
      [
        "Dato già pronto (hit)",
        "Si parla di dato trovato, o «hit», quando il dato richiesto è già nella cache. Il processore può recuperarlo rapidamente, senza accedere alla RAM per quel dato nel nostro modello.",
        "Richiedi A, poi ancora A: la seconda richiesta può essere un hit.",
      ],
      [
        "Dato da cercare (miss)",
        "Si parla di dato da cercare, o «miss», quando il dato non è presente. Nel nostro modello viene letto dalla RAM e una copia entra nella cache. La realtà ha più livelli e regole.",
        "Tre posti non possono contenere tutti i dati: qualche copia deve essere sostituita.",
      ],
      [
        "Piccola, veloce e volatile",
        "La cache della CPU è volatile e non sostituisce la RAM o il disco. Nel laboratorio usiamo tre posti e la regola «prima entra, prima esce» (FIFO): viene sostituito il dato inserito da più tempo.",
        "Leggere un dato già presente non cambia l’ordine di sostituzione. I tempi mostrati sono simbolici, non misure di un processore reale.",
      ],
    ],
    note: {
      definition:
        "Piccola memoria molto veloce vicino alla CPU, che conserva temporaneamente copie di dati e istruzioni utili.",
      features: [
        "Volatile e molto più piccola della RAM.",
        "Hit: il dato è presente; miss: serve cercarlo altrove.",
        "Nel modello ci sono 3 posti: quando sono pieni, esce il dato inserito da più tempo.",
      ],
      example:
        "Richiedere due volte A permette di osservare un miss seguito da un hit.",
    },
    questions: [
      choice(
        "Perché è utile la cache della CPU?",
        [
          "Riduce alcune attese per dati e istruzioni",
          "Conserva tutti i video per sempre",
          "Sostituisce qualsiasi memoria",
        ],
        0,
        "La cache mantiene copie utili vicino alla CPU e riduce accessi più lenti.",
      ),
      tf(
        "La cache della CPU è normalmente più capiente della RAM.",
        false,
        "La cache è molto più piccola della RAM, ma molto veloce.",
      ),
      match(
        "Associa i termini.",
        [
          ["Dato presente nella cache", "Hit"],
          ["Dato assente dalla cache", "Miss"],
        ],
        "Hit indica una richiesta soddisfatta dalla cache; miss indica che il dato non è presente.",
      ),
      choice(
        "La cache della CPU è generalmente…",
        ["Volatile", "Un disco magnetico", "Una stampante"],
        0,
        "Come la RAM comune, la cache della CPU perde il contenuto senza alimentazione.",
      ),
      number(
        "Cache inizialmente vuota: richiedi A, A, B, B. Quanti hit ottieni?",
        2,
        "hit",
        "La prima A e la prima B sono miss; le rispettive seconde richieste sono hit.",
      ),
      choice(
        "Nella cache ci sono A, B, C in ordine di arrivo. Se esce il dato entrato per primo e arriva D, quale dato viene tolto?",
        ["A", "C", "D"],
        0,
        "Esce il dato che era entrato per primo: A. Questa regola si chiama anche FIFO.",
      ),
      tf(
        "Un miss significa necessariamente che il computer è guasto.",
        false,
        "Un miss è normale: non tutti i dati possono stare nella cache.",
      ),
      order(
        "Riordina un cache miss nel nostro modello.",
        [
          "Richiesta della CPU",
          "Dato non presente in cache",
          "Recupero dalla RAM",
          "Copia inserita nella cache",
        ],
        "Nel modello, una richiesta non soddisfatta dalla cache viene recuperata dalla RAM.",
      ),
    ],
  },
  {
    id: "hdd",
    name: "HDD",
    subtitle: "Il disco magnetico",
    color: "#82baff",
    label: "Archivio magnetico",
    intro:
      "Un HDD è un dispositivo di archiviazione: conserva file anche quando il computer è spento. All’interno ha piatti magnetici e testine mobili. Nel nostro archivio potrai salvare, recuperare ed eliminare file. Osserva lo spazio occupato e prova a spegnere l’unità: i file salvati non spariscono.",
    slides: [
      [
        "Un archivio persistente",
        "HDD significa Hard Disk Drive. È una memoria di massa: conserva molti dati e file anche senza alimentazione. Persistente non significa indistruttibile.",
        "Una relazione salvata sul disco può essere riaperta dopo aver spento e riacceso il PC.",
      ],
      [
        "Piatti e testine",
        "I dati sono rappresentati magneticamente su piatti rotanti. Una testina si sposta per leggere o scrivere nelle zone del disco.",
        "Questi movimenti meccanici contribuiscono ai tempi di accesso. Nel disegno sono molto rallentati per essere visibili.",
      ],
      [
        "Capacità non infinita",
        "Ogni file occupa spazio. Salvare aumenta lo spazio usato; eliminare lo riduce. Se non c’è spazio sufficiente, non puoi aggiungere quel file.",
        "Nel modello il disco ha 8000 MB: una capacità didattica, molto inferiore a molti HDD reali.",
      ],
      [
        "Spazio a costo contenuto",
        "Gli HDD offrono spesso un costo per GB inferiore agli SSD, soprattutto per grandi archivi. Gli SSD sono generalmente più rapidi e non hanno parti meccaniche mobili.",
        "Per conservare dati importanti servono copie di sicurezza separate: un solo disco può guastarsi.",
      ],
    ],
    note: {
      definition:
        "Dispositivo di archiviazione non volatile che conserva i dati magneticamente su piatti rotanti.",
      features: [
        "Piatti e testine sono parti meccaniche in movimento.",
        "Grande capacità e spesso costo per GB inferiore agli SSD.",
        "I file salvati restano senza corrente; un guasto può comunque farli perdere.",
      ],
      example:
        "Un grande archivio fotografico può essere conservato su HDD con copie di sicurezza separate.",
    },
    questions: [
      choice(
        "Un HDD conserva i dati principalmente…",
        [
          "Magneticamente su piatti",
          "Soltanto nella RAM",
          "Attraverso l’altoparlante",
        ],
        0,
        "Un HDD usa superfici magnetiche su piatti rotanti.",
      ),
      tf(
        "Spegnere il computer cancella normalmente i file già salvati su HDD.",
        false,
        "L’HDD è non volatile: i file restano dopo lo spegnimento.",
      ),
      match(
        "Associa ogni parte alla funzione.",
        [
          ["Piatti magnetici", "Conservano i dati"],
          ["Testina", "Legge e scrive"],
        ],
        "La testina legge e scrive sulle superfici magnetiche dei piatti.",
      ),
      choice(
        "Rispetto a un SSD, un HDD offre spesso…",
        [
          "Un costo per GB più basso",
          "Assenza totale di parti mobili",
          "Accessi sempre più rapidi",
        ],
        0,
        "Gli HDD sono spesso convenienti per grandi capacità, ma hanno parti mobili e accessi generalmente più lenti.",
      ),
      number(
        "Un archivio da 8000 MB contiene 3000 MB e 800 MB. Quanto spazio rimane?",
        4200,
        "MB",
        "8000 − 3000 − 800 = 4200 MB disponibili.",
      ),
      choice(
        "Eliminare un file nel nostro archivio…",
        [
          "Libera la sua quantità di spazio",
          "Aumenta la RAM installata",
          "Spegne il firmware",
        ],
        0,
        "Nel modello, la cancellazione rimuove il file e riduce lo spazio occupato.",
      ),
      tf(
        "Non volatile significa che un HDD non potrà mai perdere dati.",
        false,
        "Non volatile significa che non serve corrente per conservarli. Guasti e cancellazioni possono comunque farli perdere.",
      ),
      choice(
        "Perché il movimento delle testine conta?",
        [
          "Contribuisce al tempo necessario per trovare i dati",
          "Misura la quantità di RAM",
          "Permette di stampare",
        ],
        0,
        "L’accesso coinvolge movimenti meccanici, che richiedono tempo.",
      ),
    ],
  },
  {
    id: "ssd",
    name: "SSD",
    subtitle: "L’archiviazione elettronica",
    color: "#ff9fba",
    label: "Officina flash",
    intro:
      "Un SSD conserva file in memoria flash, senza piatti o testine mobili. Confronterai due computer uguali che cambiano soltanto per l’unità di archiviazione. Vedrai un caricamento illustrativo e poi sceglierai l’unità più adatta a quattro esigenze. Non esiste un vincitore assoluto: conta lo scopo.",
    slides: [
      [
        "Dati nei chip",
        "SSD significa Solid State Drive. È un dispositivo di archiviazione che usa memoria flash non volatile: i dati restano anche quando viene spento.",
        "La flash conserva i dati elettronicamente. Il suo nome non significa che serva alimentazione continua per mantenerli.",
      ],
      [
        "Nessuna testina in movimento",
        "Un SSD non deve spostare una testina o attendere la rotazione dei piatti. Questo aiuta a ridurre i tempi di accesso rispetto a un HDD.",
        "Nell’uso quotidiano, avvio del sistema e caricamento delle applicazioni possono risultare più rapidi.",
      ],
      [
        "Un confronto corretto",
        "Le prestazioni dipendono da modello, collegamento, carico e altri componenti. La nostra gara usa tempi inventati: HDD 6 secondi, SSD 2 secondi. Non è una prova di velocità su un computer reale.",
        "Non tutti gli SSD sono uguali e un SSD non rende automaticamente più veloce ogni operazione della CPU.",
      ],
      [
        "Scegli in base allo scopo",
        "Per grandi archivi con budget limitato, un HDD può essere conveniente. Per caricamenti rapidi e un portatile trasportato spesso, un SSD offre vantaggi.",
        "L’assenza di parti mobili migliora la resistenza agli urti rispetto a un HDD; nessuna unità è indistruttibile. Servono comunque copie di sicurezza.",
      ],
    ],
    note: {
      definition:
        "Dispositivo di archiviazione non volatile basato su memoria flash, senza parti meccaniche in movimento.",
      features: [
        "Accessi generalmente più rapidi rispetto a un HDD.",
        "Spesso costo per GB maggiore, a seconda dei prodotti.",
        "Adatto a caricamenti rapidi e portatili; richiede comunque copie di sicurezza.",
      ],
      example:
        "Sostituire un vecchio HDD con un SSD può migliorare l’avvio e il caricamento dei programmi.",
    },
    questions: [
      choice(
        "Un SSD conserva i dati usando…",
        [
          "Memoria flash",
          "Piatti magnetici rotanti",
          "Solo la cache della CPU",
        ],
        0,
        "Un SSD usa chip di memoria flash non volatile.",
      ),
      tf(
        "Un SSD ha bisogno di una testina mobile per trovare ogni file.",
        false,
        "Non ha piatti e testine meccaniche in movimento.",
      ),
      match(
        "Associa le esigenze tipiche.",
        [
          ["Caricamenti rapidi", "SSD"],
          ["Grande archivio con budget limitato", "HDD"],
        ],
        "Sono scelte generali: vanno sempre confrontati capacità, prezzo e modelli reali.",
      ),
      choice(
        "Dopo lo spegnimento, i file salvati su SSD…",
        [
          "Restano conservati",
          "Spariscono come nella RAM",
          "Si spostano nel monitor",
        ],
        0,
        "La memoria flash è non volatile.",
      ),
      choice(
        "Per un portatile spesso trasportato, un SSD è interessante perché…",
        [
          "Non ha parti mobili e resiste meglio agli urti",
          "Non può mai rompersi",
          "Non richiede copie di sicurezza",
        ],
        0,
        "L’assenza di parti mobili è un vantaggio, ma non rende il dispositivo indistruttibile.",
      ),
      tf(
        "I tempi della gara del laboratorio sono stati misurati su computer reali.",
        false,
        "Sono tempi simbolici, scelti soltanto per rendere visibile la differenza.",
      ),
      choice(
        "Un SSD rende sempre più rapida qualsiasi operazione?",
        [
          "Sì, anche se il limite è la CPU",
          "No: dipende dal lavoro e dagli altri componenti",
          "Sì, e aumenta la RAM",
        ],
        1,
        "È utile soprattutto quando il limite riguarda l’archiviazione e i caricamenti.",
      ),
      order(
        "Riordina una scelta ragionata.",
        [
          "Individua l’esigenza",
          "Confronta capacità e costo",
          "Confronta prestazioni e uso",
          "Scegli l’unità adatta",
        ],
        "La scelta dipende dal problema concreto, non dal nome del dispositivo da solo.",
      ),
    ],
  },
  {
    id: "units",
    name: "UNITÀ",
    subtitle: "Quanto spazio occupano i dati?",
    color: "#9ed977",
    label: "Deposito dei byte",
    intro:
      "Per scegliere una memoria devi capire quanto spazio serve. Un bit può assumere due valori, 0 e 1; otto bit formano un byte. Scoprirai KB, MB, GB e TB e proverai a riempire una chiavetta da 8 GB. Attenzione: capacità e velocità non sono la stessa cosa.",
    slides: [
      [
        "Dal bit al byte",
        "Un bit è una cifra binaria: può valere 0 oppure 1. Un byte è un gruppo di 8 bit. Le dimensioni dei file si esprimono normalmente in byte e multipli.",
        "La B maiuscola indica il byte; la b minuscola indica il bit. 2 byte contengono 16 bit.",
      ],
      [
        "Una scala di grandezze",
        "Per gli esercizi usiamo multipli decimali: 1 KB = 1000 byte; 1 MB = 1000 KB; 1 GB = 1000 MB; 1 TB = 1000 GB.",
        "Da GB a MB moltiplichi per 1000. Da MB a GB dividi per 1000. Per esempio 1500 MB = 1,5 GB.",
      ],
      [
        "Capacità e velocità",
        "La capacità indica quanti dati possono essere contenuti, per esempio 8 GB. Una velocità di trasferimento indica quanti dati passano in un tempo, per esempio MB/s.",
        "Una chiavetta più capiente non è necessariamente più veloce. Quantità e rapidità rispondono a domande differenti.",
      ],
      [
        "Le dimensioni sono esempi",
        "Un documento, una foto o un video non hanno dimensione fissa: dipende da contenuto, qualità e formato. Nel laboratorio usiamo valori illustrativi.",
        "Nota: GiB è un multiplo binario diverso da GB. 1 GiB = 1 073 741 824 byte; 1 GB = 1 000 000 000 byte. Non serve convertirli nella verifica.",
      ],
    ],
    note: {
      definition:
        "Bit e byte misurano dati: 1 byte = 8 bit. I multipli decimali principali sono KB, MB, GB e TB.",
      features: [
        "Negli esercizi ogni gradino vale 1000.",
        "La capacità si esprime in byte e multipli; una velocità anche in MB/s.",
        "GB e GiB sono unità diverse: qui usiamo GB decimali.",
      ],
      example: "8 GB = 8000 MB: un gioco da 6000 MB lascia 2000 MB liberi.",
    },
    questions: [
      number(
        "Quanti bit ci sono in 1 byte?",
        8,
        "bit",
        "Un byte è un gruppo di 8 bit.",
      ),
      number(
        "Converti 3 GB in MB, usando multipli decimali.",
        3000,
        "MB",
        "3 × 1000 = 3000 MB.",
      ),
      number(
        "Converti 2000 MB in GB, usando multipli decimali.",
        2,
        "GB",
        "2000 ÷ 1000 = 2 GB.",
      ),
      order(
        "Ordina le unità dalla più piccola alla più grande.",
        ["byte", "KB", "MB", "GB", "TB"],
        "Nei multipli decimali ogni passaggio vale 1000 volte il precedente.",
      ),
      match(
        "Associa le misure al loro significato.",
        [
          ["8 GB", "Capacità"],
          ["100 MB/s", "Velocità"],
        ],
        "GB indica una quantità; MB/s indica dati trasferiti per secondo.",
      ),
      choice(
        "Una chiavetta da 8 GB contiene già 6 GB. Puoi aggiungere un file da 3 GB?",
        ["Sì, sempre", "No: servono 9 GB in totale", "Sì, se cambi il nome"],
        1,
        "6 + 3 = 9 GB, oltre la capacità di 8 GB.",
      ),
      tf(
        "Tutte le fotografie occupano esattamente 5 MB.",
        false,
        "Le dimensioni dipendono da qualità, contenuto e formato. 5 MB è soltanto un esempio.",
      ),
      number("Quanti byte formano 24 bit?", 3, "byte", "24 ÷ 8 = 3 byte."),
    ],
  },
];
const FILES = [
  { id: "doc", name: "Documento", mb: 2, icon: "▤" },
  { id: "photo", name: "Fotografia", mb: 5, icon: "▧" },
  { id: "music", name: "Brano musicale", mb: 8, icon: "♫" },
  { id: "video", name: "Video", mb: 1500, icon: "▶" },
  { id: "game", name: "Videogioco", mb: 6000, icon: "◈" },
];
const SCENARIOS = [
  {
    text: "Voglio avviare rapidamente il computer.",
    answer: "ssd",
    why: "Un SSD è generalmente più rapido negli accessi e può ridurre il tempo di avvio, se l’archiviazione è il limite.",
  },
  {
    text: "Voglio archiviare molti file spendendo poco per GB.",
    answer: "hdd",
    why: "Un HDD offre spesso un costo per GB inferiore: è una scelta ragionevole per grandi archivi con budget limitato.",
  },
  {
    text: "Voglio un portatile più resistente agli urti durante il trasporto.",
    answer: "ssd",
    why: "Un SSD non ha parti meccaniche mobili: un vantaggio contro gli urti, senza garanzia di indistruttibilità.",
  },
  {
    text: "Voglio caricare rapidamente programmi e giochi.",
    answer: "ssd",
    why: "Un SSD può ridurre i tempi di caricamento; non aumenta automaticamente la potenza della CPU o della scheda video.",
  },
];
const CLIENTS = [
  {
    name: "Marta",
    role: "Molte finestre aperte",
    text: "Quando apro tanti programmi contemporaneamente, il mio computer diventa molto lento. Cosa posso migliorare?",
    solutions: [
      "Valutare più RAM compatibile",
      "Sostituire il monitor",
      "Comprare un HDD più capiente",
    ],
    answer: 0,
    reasons: [
      "Se la RAM è insufficiente, più spazio di lavoro può aiutare",
      "Più RAM conserva per sempre tutti i file",
      "La RAM aumenta la risoluzione del monitor",
    ],
    reason: 0,
    why: "Più RAM può aiutare se i programmi aperti esauriscono quella disponibile. Prima si controllano uso della memoria e compatibilità: la lentezza può avere anche altre cause.",
  },
  {
    name: "Karim",
    role: "Un avvio interminabile",
    text: "Il mio computer usa un vecchio disco meccanico e impiega molto tempo ad avviarsi. Cosa mi consigli?",
    solutions: [
      "Valutare il passaggio a un SSD",
      "Aumentare il volume delle casse",
      "Ridurre la capacità della RAM",
    ],
    answer: 0,
    reasons: [
      "Un SSD può leggere i dati dell’avvio più rapidamente",
      "Un SSD elimina ogni possibile guasto",
      "Un SSD sostituisce il processore",
    ],
    reason: 0,
    why: "Un SSD può migliorare avvio e caricamenti quando il vecchio HDD è il limite. Vanno considerati compatibilità, trasferimento del sistema e copie di sicurezza.",
  },
  {
    name: "Elena",
    role: "Un mare di fotografie",
    text: "Devo conservare moltissime fotografie e video. Vorrei tanto spazio senza spendere troppo.",
    solutions: [
      "Valutare un HDD capiente e una copia di sicurezza separata",
      "Conservare tutto soltanto in RAM",
      "Usare soltanto la cache della CPU",
    ],
    answer: 0,
    reasons: [
      "Un HDD offre spesso un buon costo per GB per grandi archivi",
      "Un HDD non può mai guastarsi",
      "La RAM è l’archivio più duraturo",
    ],
    reason: 0,
    why: "Un HDD può essere conveniente per la capacità richiesta. Confronta i prodotti e conserva una copia separata: non volatile non significa al sicuro da guasti o cancellazioni.",
  },
];
const COMPARISON = [
  [
    "Cache CPU",
    "Copie di dati e istruzioni utili",
    "Volatile",
    "Molto alta, vicina alla CPU",
    "Piccola: spesso MB complessivi",
    "Dati richiesti di frequente",
  ],
  [
    "RAM",
    "Lavoro dei programmi aperti",
    "Volatile",
    "Alta, inferiore alla cache",
    "Spesso GB",
    "Modificare un documento aperto",
  ],
  [
    "ROM / flash del firmware",
    "Istruzioni di avvio",
    "Non volatile",
    "Dipende dal supporto; non è memoria di lavoro",
    "Piccola, spesso MB",
    "Firmware UEFI; ROM come concetto storico",
  ],
  [
    "HDD",
    "Archiviazione magnetica",
    "Non volatile",
    "Accessi generalmente più lenti di un SSD",
    "Grande: spesso GB o TB",
    "Archivi di foto e video",
  ],
  [
    "SSD",
    "Archiviazione su flash",
    "Non volatile",
    "Accessi generalmente più rapidi di un HDD",
    "Grande: spesso GB o TB",
    "Sistema e programmi da caricare rapidamente",
  ],
];
