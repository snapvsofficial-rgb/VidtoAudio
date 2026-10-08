import { TranslationDictionary } from './types';
import { enTranslations } from './en';

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

function createMergedDictionary(overrides: RecursivePartial<TranslationDictionary>): TranslationDictionary {
  const result: any = JSON.parse(JSON.stringify(enTranslations));
  
  for (const sectionKey of Object.keys(overrides) as (keyof TranslationDictionary)[]) {
    const sectionOverrides = (overrides as any)[sectionKey];
    if (sectionOverrides && typeof sectionOverrides === 'object') {
      result[sectionKey] = {
        ...result[sectionKey],
        ...sectionOverrides
      };
    }
  }
  
  return result as TranslationDictionary;
}

// Italian (it)
export const itTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Home',
    converters: 'Convertitori',
    blog: 'Blog',
    editor: 'Editor Video',
    about: 'Chi siamo',
    privacy: 'Privacy',
    admin: 'Admin',
    getApp: 'Scarica App',
    terms: 'Termini di Servizio'
  },
  hero: {
    homeTitle: 'Convertitore Multiplo da MP4 a MP3 (Online Gratis)',
    homeSubtitle: 'Estrai tracce audio ad alta fedeltà dai tuoi video direttamente nel browser: 100% in locale con WebAssembly, zero upload sui server e massima velocità.',
    popularConverters: 'Convertitori popolari:',
    trustOffline: '100% Nel Browser',
    trustQueue: 'Conversione in Coda',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'Zero Upload su Server'
  },
  converter: {
    tryItHereHome: 'Prova qui: Convertitore da MP4 a MP3',
    tryItHereMatrix: 'Prova qui: Convertitore da {INPUT} a {OUTPUT}',
    subtitleHome: 'Seleziona uno o più file video. Vengono elaborati in sequenza nel browser tramite FFmpeg WebAssembly.',
    subtitleMatrix: 'Seleziona uno o più file {INPUT}. Convertiti in {OUTPUT} direttamente sul tuo dispositivo.',
    dropzoneTextHome: 'Clicca o trascina i video qui per la conversione multipla',
    dropzoneTextMatrix: 'Clicca o trascina file {INPUT} per convertire in {OUTPUT}',
    noFilesChosen: 'Nessun file selezionato',
    outputFormat: 'Formato di Uscita',
    audioQuality: 'Qualità Audio',
    extractAudio: 'Estrai Audio',
    extractAudioCount: 'Estrai Audio ({count} File)',
    outputSummary: 'Uscita: {format} ({bitrate})',
    qualityStudio: 'Studio (320kbps)',
    qualityHigh: 'Alta (192kbps)',
    qualityStandard: 'Standard (128kbps)',
    processingInitializing: 'Inizializzazione conversione locale...',
    processingConverting: 'Conversione file {current} di {total}:',
    processingPleaseWait: 'Elaborazione in corso nel tuo browser via WebAssembly...',
    successTitle: 'Conversione Completata!',
    successSubtitle: '{count} file convertiti con successo senza caricare nulla sui server.',
    downloadTrack: 'Scarica',
    downloadAllZip: 'Scarica Tutti ({count} Tracce - ZIP)',
    convertAnother: 'Converti Altri File',
    reset: 'Reimposta'
  },
  matrix: {
    breadcrumbHome: 'Home',
    breadcrumbConverters: 'Convertitori',
    heroTitle: 'Convertitore Multiplo da {INPUT} a {OUTPUT} (Online Gratis)',
    heroSubtitle: 'Estrai audio {OUTPUT} ad alta fedeltà dai file {INPUT} direttamente nel browser: zero upload, massima privacy e accelerazione hardware.',
    pageMetaTitle: 'Converti {INPUT} in {OUTPUT} Online Gratis (Istantaneo) | VidToAudio',
    pageMetaDesc: 'Converti {INPUT} in {OUTPUT} online gratis nel tuo browser. Estrazione audio immediata senza caricamenti sui server, privacy totale e nessun limite di dimensione.',
    techSpecBadge: 'Specifiche Tecniche & Guida',
    techSpecSubtitle: 'Conversione Audio da {INPUT} a {OUTPUT}',
    howToExtractHeading: 'Come Estrarre Audio {OUTPUT} da File Video {INPUT} nel Browser',
    faqSectionTitle: 'Domande Frequenti: da {INPUT} a {OUTPUT}',
    faqSectionSubtitle: 'Dettagli tecnici e risposte sull\'estrazione audio di qualità superiore da video {INPUT}.',
    ratingHeading: 'Valutazioni degli Utenti',
    ratingSubheading: 'Recensioni verificate sul motore WebAssembly {INPUT} a {OUTPUT}.',
    ratingVerifiedUsers: 'Utenti Verificati',
    ratingYourRating: 'Il tuo voto:',
    ratingSubmitFeedback: 'Invia Valutazione',
    ratingThankYou: 'Grazie per la tua recensione!',
    allConvertersTitle: 'Esplora tutti gli 81 convertitori video-audio',
    allConvertersSubtitle: 'Tutte le combinazioni funzionano 100% nel browser tramite WebAssembly. Zero upload e download istantaneo.',
    convertLabel: 'Converti da {INPUT} a {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Estrai audio in studio-quality dai tuoi video direttamente nel browser. Zero upload, 100% privato e gratuito.',
    privacyNotice: 'Tutte le conversioni avvengono sulla CPU del tuo dispositivo. Nessun file video lascia il tuo computer o smartphone.',
    rightsReserved: 'Tutti i diritti riservati.',
    privacyPolicy: 'Informativa sulla Privacy',
    termsOfService: 'Termini di Servizio'
  }
});

// Dutch (nl)
export const nlTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Home',
    converters: 'Converters',
    blog: 'Blog',
    editor: 'Video-editor',
    about: 'Over ons',
    privacy: 'Privacy',
    admin: 'Beheer',
    getApp: 'Download App',
    terms: 'Voorwaarden'
  },
  hero: {
    homeTitle: 'Snelste Batch MP4 naar MP3 Converter (Online Gratis)',
    homeSubtitle: 'Extraheer verliesvrije MP3-audio direct uit MP4-video\'s in uw browser: 100% lokaal via WebAssembly, geen server-uploads en maximale privacy.',
    popularConverters: 'Populaire converters:',
    trustOffline: '100% In Browser',
    trustQueue: 'Batch-wachtrij',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'Geen Server-Upload'
  },
  converter: {
    tryItHereHome: 'Probeer het hier: MP4 naar MP3 Batch Converter',
    tryItHereMatrix: 'Probeer het hier: {INPUT} naar {OUTPUT} Batch Converter',
    subtitleHome: 'Selecteer één of meerdere videobestanden. Ze worden direct in uw browser geconverteerd met FFmpeg WebAssembly.',
    subtitleMatrix: 'Selecteer {INPUT}-bestanden om lokaal naar {OUTPUT} te converteren.',
    dropzoneTextHome: 'Klik of sleep videobestanden hierheen voor batch-conversie',
    dropzoneTextMatrix: 'Klik of sleep {INPUT}-bestanden om naar {OUTPUT} te converteren',
    noFilesChosen: 'Geen bestanden gekozen',
    outputFormat: 'Uitvoerformaat',
    audioQuality: 'Audiokwaliteit',
    extractAudio: 'Audio extraheren',
    extractAudioCount: 'Audio extraheren ({count} Bestanden)',
    outputSummary: 'Uitvoer: {format} ({bitrate})',
    qualityStudio: 'Studio (320 kbps)',
    qualityHigh: 'Hoog (192 kbps)',
    qualityStandard: 'Standaard (128 kbps)',
    processingInitializing: 'Lokale conversie initialiseren...',
    processingConverting: 'Bestand {current} van {total} converteren:',
    processingPleaseWait: 'Even geduld, uw media wordt lokaal berekend via WebAssembly.',
    successTitle: 'Batchconversie Voltooid!',
    successSubtitle: '{count} bestand(en) succesvol geconverteerd zonder data naar een server te sturen.',
    downloadTrack: 'Downloaden',
    downloadAllZip: 'Alles downloaden ({count} Tracks - ZIP)',
    convertAnother: 'Meer bestanden converteren',
    reset: 'Resetten'
  },
  matrix: {
    breadcrumbHome: 'Home',
    breadcrumbConverters: 'Converters',
    heroTitle: 'Snelste Batch {INPUT} naar {OUTPUT} Converter (Online Gratis)',
    heroSubtitle: 'Extraheer hoogwaardige {OUTPUT}-audio direct uit {INPUT}-videobestanden in uw browser zonder uploads, met volledige privacy en hardwareversnelling.',
    pageMetaTitle: '{INPUT} naar {OUTPUT} Online Gratis Converteren (Direct) | VidToAudio',
    pageMetaDesc: 'Converteer {INPUT} naar {OUTPUT} gratis online direct in uw browser. Snelle audio-extractie zonder uploads, maximale privacy en geen limieten.',
    techSpecBadge: 'Technische Specificaties & Handleiding',
    techSpecSubtitle: '{INPUT} naar {OUTPUT} Audio-conversie',
    howToExtractHeading: 'Hoe u {OUTPUT}-audio uit {INPUT}-videobestanden extraheert in de browser',
    faqSectionTitle: 'Veelgestelde vragen: {INPUT} naar {OUTPUT}',
    faqSectionSubtitle: 'Antwoorden en technische details over het converteren van {INPUT} naar {OUTPUT}.',
    ratingHeading: 'Gebruikersbeoordelingen',
    ratingSubheading: 'Geverifieerde recensies voor onze WebAssembly {INPUT} naar {OUTPUT}-engine.',
    ratingVerifiedUsers: 'Geverifieerde gebruikers',
    ratingYourRating: 'Uw beoordeling:',
    ratingSubmitFeedback: 'Beoordeling verzenden',
    ratingThankYou: 'Bedankt voor uw beoordeling!',
    allConvertersTitle: 'Bekijk alle 81 video-naar-audioconverters',
    allConvertersSubtitle: 'Elke combinatie werkt 100% in uw browser via WebAssembly. Nul uploads, directe download.',
    convertLabel: 'Converteer {INPUT} naar {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Snelle audio-extractie direct in uw browser. Geen uploads, 100% privé en gratis.',
    privacyNotice: 'Alle conversies draaien op uw eigen apparaat. Er verlaten nooit bestanden uw browser.',
    rightsReserved: 'Alle rechten voorbehouden.',
    privacyPolicy: 'Privacybeleid',
    termsOfService: 'Servicevoorwaarden'
  }
});

// Swedish (sv)
export const svTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Hem',
    converters: 'Konverterare',
    blog: 'Blogg',
    editor: 'Videoredigerare',
    about: 'Om oss',
    privacy: 'Integritet',
    admin: 'Admin',
    getApp: 'Hämta App',
    terms: 'Villkor'
  },
  hero: {
    homeTitle: 'Snabbaste Batch MP4 till MP3 Konverteraren (Gratis Online)',
    homeSubtitle: 'Extrahera förlustfritt MP3-ljud från dina MP4-videor direkt i webbläsaren: 100 % lokalt via WebAssembly, noll serveruppladdningar och full integritet.',
    popularConverters: 'Populära konverterare:',
    trustOffline: '100% I Webbläsaren',
    trustQueue: 'Batch-kö',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'Ingen Serveruppladdning'
  },
  converter: {
    tryItHereHome: 'Testa här: MP4 till MP3 Batchkonverterare',
    tryItHereMatrix: 'Testa här: {INPUT} till {OUTPUT} Batchkonverterare',
    subtitleHome: 'Välj en eller flera videofiler. De bearbetas i webbläsaren med FFmpeg WebAssembly.',
    subtitleMatrix: 'Välj {INPUT}-filer för att konvertera till {OUTPUT} lokalt på din enhet.',
    dropzoneTextHome: 'Klicka eller dra videofiler hit för batchkonvertering',
    dropzoneTextMatrix: 'Klicka eller släpp {INPUT}-filer för att konvertera till {OUTPUT}',
    noFilesChosen: 'Inga filer valda',
    outputFormat: 'Utdataformat',
    audioQuality: 'Ljudkvalitet',
    extractAudio: 'Extrahera Ljud',
    extractAudioCount: 'Extrahera Ljud ({count} Filer)',
    outputSummary: 'Utdata: {format} ({bitrate})',
    qualityStudio: 'Studio (320 kbps)',
    qualityHigh: 'Hög (192 kbps)',
    qualityStandard: 'Standard (128 kbps)',
    processingInitializing: 'Startar lokal konvertering...',
    processingConverting: 'Konverterar fil {current} av {total}:',
    processingPleaseWait: 'Vänta medan dina filer bearbetas lokalt via WebAssembly.',
    successTitle: 'Konvertering Slutförd!',
    successSubtitle: '{count} fil(er) har konverterats utan att ladda upp data till någon server.',
    downloadTrack: 'Ladda ner',
    downloadAllZip: 'Ladda ner alla ({count} Spår - ZIP)',
    convertAnother: 'Konvertera fler filer',
    reset: 'Återställ'
  },
  matrix: {
    breadcrumbHome: 'Hem',
    breadcrumbConverters: 'Konverterare',
    heroTitle: 'Snabbaste Batch {INPUT} till {OUTPUT} Konverteraren (Gratis Online)',
    heroSubtitle: 'Extrahera högkvalitativt {OUTPUT}-ljud direkt från {INPUT}-videor i webbläsaren: noll serveruppladdningar och full hårdvaruacceleration.',
    pageMetaTitle: 'Konvertera {INPUT} till {OUTPUT} Gratis Online (Direkt) | VidToAudio',
    pageMetaDesc: 'Konvertera {INPUT} till {OUTPUT} gratis online direkt i webbläsaren. Snabb ljudextraktion utan uppladdningar, total integritet och inga storleksgränser.',
    techSpecBadge: 'Teknisk Specifikation & Guide',
    techSpecSubtitle: '{INPUT} till {OUTPUT} Ljudkonvertering',
    howToExtractHeading: 'Hur man extraherar {OUTPUT}-ljud från {INPUT}-videor i webbläsaren',
    faqSectionTitle: 'Vanliga frågor: {INPUT} till {OUTPUT}',
    faqSectionSubtitle: 'Svar och tekniska detaljer för att extrahera {OUTPUT}-ljud från {INPUT}-videor online.',
    ratingHeading: 'Användaromdömen',
    ratingSubheading: 'Verifierade omdömen för vår WebAssembly-konverterare från {INPUT} till {OUTPUT}.',
    ratingVerifiedUsers: 'Verifierade användare',
    ratingYourRating: 'Ditt betyg:',
    ratingSubmitFeedback: 'Skicka omdöme',
    ratingThankYou: 'Tack för ditt betyg!',
    allConvertersTitle: 'Utforska alla 81 video-till-ljudkonverterare',
    allConvertersSubtitle: 'Alla kombinationer körs 100 % lokalt i din webbläsare via WebAssembly.',
    convertLabel: 'Konvertera {INPUT} till {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Snabb ljudextraktion direkt i webbläsaren. Inga uppladdningar, 100 % privat och gratis.',
    privacyNotice: 'Alla konverteringar körs lokalt på din egen processor. Ingen data lämnar din enhet.',
    rightsReserved: 'Alla rättigheter förbehållna.',
    privacyPolicy: 'Integritetspolicy',
    termsOfService: 'Användarvillkor'
  }
});

// Polish (pl)
export const plTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Główna',
    converters: 'Konwertery',
    blog: 'Blog',
    editor: 'Edytor Wideo',
    about: 'O nas',
    privacy: 'Prywatność',
    admin: 'Admin',
    getApp: 'Pobierz Aplikację',
    terms: 'Regulamin'
  },
  hero: {
    homeTitle: 'Najszybszy Masowy Konwerter MP4 na MP3 (Za Darmo Online)',
    homeSubtitle: 'Wyodrębnij bezstratne audio MP3 z plików wideo MP4 bezpośrednio w przeglądarce: 100% lokalnie przez WebAssembly, zero wysyłania na serwer i pełna prywatność.',
    popularConverters: 'Popularne konwertery:',
    trustOffline: '100% W Przeglądarce',
    trustQueue: 'Kolejkowanie Masowe',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'Bez Wysyłania na Serwer'
  },
  converter: {
    tryItHereHome: 'Wypróbuj tutaj: Konwerter MP4 na MP3',
    tryItHereMatrix: 'Wypróbuj tutaj: Konwerter {INPUT} na {OUTPUT}',
    subtitleHome: 'Wybierz jeden lub więcej plików wideo. Przetwarzanie odbywa się lokalnie w przeglądarce za pomocą FFmpeg WebAssembly.',
    subtitleMatrix: 'Wybierz pliki {INPUT}, aby przekonwertować je na {OUTPUT} bezpośrednio w przeglądarce.',
    dropzoneTextHome: 'Kliknij lub przeciągnij pliki wideo tutaj, aby konwertować masowo',
    dropzoneTextMatrix: 'Kliknij lub upuść pliki {INPUT}, aby konwertować na {OUTPUT}',
    noFilesChosen: 'Nie wybrano plików',
    outputFormat: 'Format Wyjściowy',
    audioQuality: 'Jakość Audio',
    extractAudio: 'Wyodrębnij Audio',
    extractAudioCount: 'Wyodrębnij Audio ({count} Plików)',
    outputSummary: 'Wyjście: {format} ({bitrate})',
    qualityStudio: 'Studio (320 kbps)',
    qualityHigh: 'Wysoka (192 kbps)',
    qualityStandard: 'Standardowa (128 kbps)',
    processingInitializing: 'Inicjalizacja lokalnej konwersji...',
    processingConverting: 'Konwersja pliku {current} z {total}:',
    processingPleaseWait: 'Proszę czekać, Twoje pliki są przetwarzane lokalnie przez WebAssembly.',
    successTitle: 'Konwersja Zakończona Sukcesem!',
    successSubtitle: '{count} plik(ów) przekonwertowano pomyślnie bez przesyłania danych na zewnętrzny serwer.',
    downloadTrack: 'Pobierz',
    downloadAllZip: 'Pobierz Wszystko ({count} Ścieżek - ZIP)',
    convertAnother: 'Konwertuj Kolejne Pliki',
    reset: 'Resetuj'
  },
  matrix: {
    breadcrumbHome: 'Główna',
    breadcrumbConverters: 'Konwertery',
    heroTitle: 'Najszybszy Masowy Konwerter {INPUT} na {OUTPUT} (Za Darmo Online)',
    heroSubtitle: 'Wyodrębnij wysokiej jakości audio {OUTPUT} z plików wideo {INPUT} bezpośrednio w przeglądarce bez przesyłania na serwer.',
    pageMetaTitle: 'Konwertuj {INPUT} na {OUTPUT} Online Za Darmo (Błyskawicznie) | VidToAudio',
    pageMetaDesc: 'Konwertuj {INPUT} na {OUTPUT} online za darmo bezpośrednio w przeglądarce. Błyskawiczna ekstrakcja audio bez wysyłania plików, maksymalna prywatność i brak limitów.',
    techSpecBadge: 'Specyfikacja Techniczna & Poradnik',
    techSpecSubtitle: 'Konwersja Audio {INPUT} na {OUTPUT}',
    howToExtractHeading: 'Jak Wyodrębnić Audio {OUTPUT} z Plików Wideo {INPUT} w Przeglądarce',
    faqSectionTitle: 'Często Zadawane Pytania: {INPUT} na {OUTPUT}',
    faqSectionSubtitle: 'Odpowiedzi i szczegóły techniczne dotyczące ekstrakcji audio {OUTPUT} z wideo {INPUT}.',
    ratingHeading: 'Opinie i Oceny Użytkowników',
    ratingSubheading: 'Zweryfikowane recenzje silnika WebAssembly dla {INPUT} na {OUTPUT}.',
    ratingVerifiedUsers: 'Zweryfikowani Użytkownicy',
    ratingYourRating: 'Twoja ocena:',
    ratingSubmitFeedback: 'Wyślij Opinię',
    ratingThankYou: 'Dziękujemy za wystawienie oceny!',
    allConvertersTitle: 'Przeglądaj wszystkie 81 konwerterów wideo na audio',
    allConvertersSubtitle: 'Każda kombinacja działa w 100% w Twojej przeglądarce przez WebAssembly.',
    convertLabel: 'Konwertuj {INPUT} na {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Szybka ekstrakcja audio bezpośrednio w przeglądarce. Zero uploadu, 100% prywatności i bezpłatnie.',
    privacyNotice: 'Wszystkie konwersje odbywają się lokalnie na Twoim procesorze. Żadne pliki nie opuszczają Twojego urządzenia.',
    rightsReserved: 'Wszelkie prawa zastrzeżone.',
    privacyPolicy: 'Polityka Prywatności',
    termsOfService: 'Regulamin Świadczenia Usług'
  }
});

// Portuguese (pt)
export const ptTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Início',
    converters: 'Conversores',
    blog: 'Blog',
    editor: 'Editor de Vídeo',
    about: 'Sobre',
    privacy: 'Privacidade',
    admin: 'Admin',
    getApp: 'Baixar App',
    terms: 'Termos de Serviço'
  },
  hero: {
    homeTitle: 'Conversor em Lote de MP4 para MP3 Mais Rápido (Online Grátis)',
    homeSubtitle: 'Extraia áudio de alta fidelidade dos seus vídeos MP4 diretamente no navegador: 100% local via WebAssembly, sem uploads para servidores e com total privacidade.',
    popularConverters: 'Conversores Populares:',
    trustOffline: '100% No Navegador',
    trustQueue: 'Fila Sequencial em Lote',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'Sem Uploads para Servidores'
  },
  converter: {
    tryItHereHome: 'Experimente aqui: Conversor de MP4 para MP3 em Lote',
    tryItHereMatrix: 'Experimente aqui: Conversor de {INPUT} para {OUTPUT} em Lote',
    subtitleHome: 'Selecione um ou mais vídeos. A conversão ocorre diretamente no seu navegador via FFmpeg WebAssembly.',
    subtitleMatrix: 'Selecione arquivos {INPUT} para converter em {OUTPUT} localmente no seu dispositivo.',
    dropzoneTextHome: 'Clique ou arraste vídeos aqui para conversão em lote',
    dropzoneTextMatrix: 'Clique ou solte arquivos {INPUT} para converter em {OUTPUT}',
    noFilesChosen: 'Nenhum arquivo escolhido',
    outputFormat: 'Formato de Saída',
    audioQuality: 'Qualidade do Áudio',
    extractAudio: 'Extrair Áudio',
    extractAudioCount: 'Extrair Áudio ({count} Arquivos)',
    outputSummary: 'Saída: {format} ({bitrate})',
    qualityStudio: 'Estúdio (320kbps)',
    qualityHigh: 'Alta (192kbps)',
    qualityStandard: 'Padrão (128kbps)',
    processingInitializing: 'Iniciando conversão local...',
    processingConverting: 'Convertendo arquivo {current} de {total}:',
    processingPleaseWait: 'Aguarde enquanto os arquivos são processados localmente via WebAssembly.',
    successTitle: 'Conversão Concluída com Sucesso!',
    successSubtitle: '{count} arquivo(s) convertidos no seu dispositivo sem envio de dados a servidores.',
    downloadTrack: 'Baixar',
    downloadAllZip: 'Baixar Tudo ({count} Faixas - ZIP)',
    convertAnother: 'Converter Mais Arquivos',
    reset: 'Redefinir'
  },
  matrix: {
    breadcrumbHome: 'Início',
    breadcrumbConverters: 'Conversores',
    heroTitle: 'Conversor em Lote de {INPUT} para {OUTPUT} Mais Rápido (Online Grátis)',
    heroSubtitle: 'Extraia áudio de alta qualidade em formato {OUTPUT} diretamente de vídeos {INPUT} no navegador, com total privacidade e aceleração por hardware.',
    pageMetaTitle: 'Converter {INPUT} para {OUTPUT} Online Grátis (Instantâneo) | VidToAudio',
    pageMetaDesc: 'Converta {INPUT} para {OUTPUT} online grátis diretamente no seu navegador. Extração instantânea de áudio sem uploads, privacidade total e sem limite de tamanho.',
    techSpecBadge: 'Especificação Técnica e Guia',
    techSpecSubtitle: 'Conversão de Áudio de {INPUT} para {OUTPUT}',
    howToExtractHeading: 'Como Extrair Áudio {OUTPUT} de Vídeos {INPUT} no Navegador',
    faqSectionTitle: 'Perguntas Frequentes: {INPUT} para {OUTPUT}',
    faqSectionSubtitle: 'Dúvidas e especificações técnicas para extrair áudio {OUTPUT} de vídeos {INPUT} online.',
    ratingHeading: 'Avaliações e Opiniões dos Usuários',
    ratingSubheading: 'Opiniões verificadas sobre o conversor WebAssembly de {INPUT} para {OUTPUT}.',
    ratingVerifiedUsers: 'Usuários Verificados',
    ratingYourRating: 'Sua Avaliação:',
    ratingSubmitFeedback: 'Enviar Avaliação',
    ratingThankYou: 'Muito obrigado pela sua avaliação!',
    allConvertersTitle: 'Ver todos os 81 conversores de vídeo para áudio',
    allConvertersSubtitle: 'Todas as combinações rodam 100% no navegador via WebAssembly. Zero uploads e download imediato.',
    convertLabel: 'Converter {INPUT} para {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Extração de áudio de alta fidelidade diretamente no navegador. Zero upload, 100% privado e gratuito.',
    privacyNotice: 'Todas as conversões são processadas localmente na sua CPU. Nenhum arquivo sai do seu dispositivo.',
    rightsReserved: 'Todos os direitos reservados.',
    privacyPolicy: 'Política de Privacidade',
    termsOfService: 'Termos de Serviço'
  }
});

// Russian (ru)
export const ruTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Главная',
    converters: 'Конвертеры',
    blog: 'Блог',
    editor: 'Видеоредактор',
    about: 'О нас',
    privacy: 'Конфиденциальность',
    admin: 'Админ',
    getApp: 'Скачать App',
    terms: 'Условия'
  },
  hero: {
    homeTitle: 'Быстрый пакетный конвертер MP4 в MP3 (Онлайн Бесплатно)',
    homeSubtitle: 'Извлекайте аудио высокого качества из MP4 видео прямо в браузере: 100% локально через WebAssembly, без загрузки на сервер и с полной приватностью.',
    popularConverters: 'Популярные конвертеры:',
    trustOffline: '100% В Браузере',
    trustQueue: 'Пакетная Очередь',
    trustBitrate: '128 / 192 / 320 кбит/с',
    trustNoUploads: 'Без Загрузки на Сервер'
  },
  converter: {
    tryItHereHome: 'Попробуйте здесь: Конвертер MP4 в MP3',
    tryItHereMatrix: 'Попробуйте здесь: Конвертер {INPUT} в {OUTPUT}',
    subtitleHome: 'Выберите один или несколько видеофайлов. Обработка выполняется локально в браузере через FFmpeg WebAssembly.',
    subtitleMatrix: 'Выберите файлы {INPUT} для конвертации в {OUTPUT} на вашем устройстве.',
    dropzoneTextHome: 'Нажмите или перетащите видео сюда для пакетной конвертации',
    dropzoneTextMatrix: 'Нажмите или перетащите файлы {INPUT} для конвертации в {OUTPUT}',
    noFilesChosen: 'Файлы не выбраны',
    outputFormat: 'Формат вывода',
    audioQuality: 'Качество аудио',
    extractAudio: 'Извлечь аудио',
    extractAudioCount: 'Извлечь аудио ({count} файлов)',
    outputSummary: 'Вывод: {format} ({bitrate})',
    qualityStudio: 'Студия (320 кбит/с)',
    qualityHigh: 'Высокое (192 кбит/с)',
    qualityStandard: 'Стандарт (128 кбит/с)',
    processingInitializing: 'Инициализация конвертера...',
    processingConverting: 'Конвертация файла {current} из {total}:',
    processingPleaseWait: 'Пожалуйста, подождите, файлы обрабатываются через WebAssembly.',
    successTitle: 'Конвертация Завершена!',
    successSubtitle: '{count} файл(ов) успешно извлечены без передачи на удаленный сервер.',
    downloadTrack: 'Скачать',
    downloadAllZip: 'Скачать все ({count} треков - ZIP)',
    convertAnother: 'Конвертировать еще файлы',
    reset: 'Сбросить'
  },
  matrix: {
    breadcrumbHome: 'Главная',
    breadcrumbConverters: 'Конвертеры',
    heroTitle: 'Быстрый пакетный конвертер {INPUT} в {OUTPUT} (Онлайн Бесплатно)',
    heroSubtitle: 'Извлекайте аудио {OUTPUT} из видео {INPUT} прямо в браузере: ноль загрузок на сервер, полная конфиденциальность и аппаратное ускорение.',
    pageMetaTitle: 'Конвертировать {INPUT} в {OUTPUT} Онлайн Бесплатно (Мгновенно) | VidToAudio',
    pageMetaDesc: 'Конвертируйте {INPUT} в {OUTPUT} бесплатно онлайн прямо в браузере. Мгновенное извлечение звука без отправки на сервер, полная приватность и без ограничений размера.',
    techSpecBadge: 'Техническая спецификация & Руководство',
    techSpecSubtitle: 'Конвертация аудио {INPUT} в {OUTPUT}',
    howToExtractHeading: 'Как извлечь аудио {OUTPUT} из видео {INPUT} в браузере',
    faqSectionTitle: 'Часто задаваемые вопросы: {INPUT} в {OUTPUT}',
    faqSectionSubtitle: 'Технические детали и ответы на вопросы по извлечению аудио {OUTPUT} из {INPUT}.',
    ratingHeading: 'Отзывы и Оценки Пользователей',
    ratingSubheading: 'Проверенные отзывы о конвертере WebAssembly {INPUT} в {OUTPUT}.',
    ratingVerifiedUsers: 'Проверенные пользователи',
    ratingYourRating: 'Ваша оценка:',
    ratingSubmitFeedback: 'Отправить отзыв',
    ratingThankYou: 'Спасибо за ваш отзыв!',
    allConvertersTitle: 'Все 81 конвертер видео в аудио',
    allConvertersSubtitle: 'Все форматы конвертируются в браузере через WebAssembly без загрузки.',
    convertLabel: 'Конвертировать {INPUT} в {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Пакетное извлечение аудио прямо в браузере. Без загрузки на сервер, 100% приватность и бесплатно.',
    privacyNotice: 'Все вычисления выполняются на вашем устройстве. Ни один файл не передается в сеть.',
    rightsReserved: 'Все права защищены.',
    privacyPolicy: 'Политика конфиденциальности',
    termsOfService: 'Условия обслуживания'
  }
});

// Ukrainian (uk)
export const ukTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Головна',
    converters: 'Конвертери',
    blog: 'Блог',
    editor: 'Відеоредактор',
    about: 'Про нас',
    privacy: 'Приватність',
    admin: 'Адмін',
    getApp: 'Завантажити App',
    terms: 'Умови'
  },
  hero: {
    homeTitle: 'Найшвидший пакетний конвертер MP4 в MP3 (Онлайн Безкоштовно)',
    homeSubtitle: 'Витягуйте високоякісне аудіо MP3 з MP4 відео прямо у браузері: 100% локально через WebAssembly, без передачі на сервер і з повною конфіденційністю.',
    popularConverters: 'Популярні конвертери:',
    trustOffline: '100% У Браузері',
    trustQueue: 'Пакетна Черга',
    trustBitrate: '128 / 192 / 320 кбіт/с',
    trustNoUploads: 'Без Завантаження на Сервер'
  },
  converter: {
    tryItHereHome: 'Спробуйте тут: Конвертер MP4 в MP3',
    tryItHereMatrix: 'Спробуйте тут: Конвертер {INPUT} в {OUTPUT}',
    subtitleHome: 'Виберіть відеофайли. Обробка виконується безпосередньо у браузері через FFmpeg WebAssembly.',
    subtitleMatrix: 'Виберіть файли {INPUT} для конвертації в {OUTPUT} на вашому пристрої.',
    dropzoneTextHome: 'Натисніть або перетягніть відео сюди для конвертації',
    dropzoneTextMatrix: 'Натисніть або перетягніть файли {INPUT} для конвертації в {OUTPUT}',
    noFilesChosen: 'Файли не вибрано',
    outputFormat: 'Формат виводу',
    audioQuality: 'Якість аудіо',
    extractAudio: 'Витягти аудіо',
    extractAudioCount: 'Витягти аудіо ({count} файлів)',
    outputSummary: 'Вивід: {format} ({bitrate})',
    qualityStudio: 'Студія (320 кбіт/с)',
    qualityHigh: 'Висока (192 кбіт/с)',
    qualityStandard: 'Стандарт (128 кбіт/с)',
    processingInitializing: 'Ініціалізація конвертації...',
    processingConverting: 'Конвертація файлу {current} з {total}:',
    processingPleaseWait: 'Зачекайте, файли обробляються локально через WebAssembly.',
    successTitle: 'Конвертацію Завершено!',
    successSubtitle: '{count} файл(ів) успішно витягнуто без надсилання на сервер.',
    downloadTrack: 'Завантажити',
    downloadAllZip: 'Завантажити все ({count} треків - ZIP)',
    convertAnother: 'Конвертувати ще файли',
    reset: 'Скинути'
  },
  matrix: {
    breadcrumbHome: 'Головна',
    breadcrumbConverters: 'Конвертери',
    heroTitle: 'Найшвидший пакетний конвертер {INPUT} в {OUTPUT} (Онлайн Безкоштовно)',
    heroSubtitle: 'Витягуйте високоякісне аудіо {OUTPUT} з відео {INPUT} прямо у браузері: нуль завантажень на сервер, максимальна конфіденційність.',
    pageMetaTitle: 'Конвертувати {INPUT} в {OUTPUT} Онлайн Безкоштовно (Миттєво) | VidToAudio',
    pageMetaDesc: 'Конвертуйте {INPUT} в {OUTPUT} безкоштовно онлайн у браузері. Миттєве вилучення аудіо без надсилання файлів на сервер, повна приватність та без обмежень.',
    techSpecBadge: 'Технічна специфікація & Посібник',
    techSpecSubtitle: 'Конвертація аудіо {INPUT} в {OUTPUT}',
    howToExtractHeading: 'Як витягти аудіо {OUTPUT} з відео {INPUT} у браузері',
    faqSectionTitle: 'Часті запитання: {INPUT} в {OUTPUT}',
    faqSectionSubtitle: 'Відповіді та технічні деталі щодо конвертації {INPUT} в {OUTPUT}.',
    ratingHeading: 'Відгуки Користувачів',
    ratingSubheading: 'Перевірені відгуки про WebAssembly конвертер {INPUT} в {OUTPUT}.',
    ratingVerifiedUsers: 'Перевірені користувачі',
    ratingYourRating: 'Ваша оцінка:',
    ratingSubmitFeedback: 'Надіслати відгук',
    ratingThankYou: 'Дякуємо за вашу оцінку!',
    allConvertersTitle: 'Всі 81 конвертер відео в аудіо',
    allConvertersSubtitle: 'Кожна комбінація працює у браузері через WebAssembly без завантаження на сервер.',
    convertLabel: 'Конвертувати {INPUT} в {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Швидке вилучення аудіо прямо у браузері. Без завантаження на сервер, 100% приватно та безкоштовно.',
    privacyNotice: 'Усі конвертації виконуються локально на вашому пристрої.',
    rightsReserved: 'Усі права захищені.',
    privacyPolicy: 'Політика конфіденційності',
    termsOfService: 'Умови використання'
  }
});

// Turkish (tr)
export const trTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Ana Sayfa',
    converters: 'Dönüştürücüler',
    blog: 'Blog',
    editor: 'Video Düzenleyici',
    about: 'Hakkımızda',
    privacy: 'Gizlilik',
    admin: 'Yönetim',
    getApp: 'Uygulamayı İndir',
    terms: 'Kullanım Koşulları'
  },
  hero: {
    homeTitle: 'En Hızlı Toplu MP4 - MP3 Dönüştürücü (Ücretsiz Çevrimiçi)',
    homeSubtitle: 'MP4 videolarınızdan yüksek kaliteli MP3 sesini doğrudan tarayıcınızda çıkarın: WebAssembly ile %100 yerel, sunucu yüklemesi olmadan tam gizlilik.',
    popularConverters: 'Popüler dönüştürücüler:',
    trustOffline: '%100 Tarayıcıda',
    trustQueue: 'Toplu Sıra',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'Sunucuya Yükleme Yok'
  },
  converter: {
    tryItHereHome: 'Burada deneyin: MP4 - MP3 Toplu Dönüştürücü',
    tryItHereMatrix: 'Burada deneyin: {INPUT} - {OUTPUT} Toplu Dönüştürücü',
    subtitleHome: 'Bir veya birden fazla video seçin. FFmpeg WebAssembly ile tarayıcınızda yerel olarak işlenir.',
    subtitleMatrix: '{INPUT} dosyalarını seçin ve cihazınızda doğrudan {OUTPUT} formatına dönüştürün.',
    dropzoneTextHome: 'Toplu dönüştürme için videoları buraya tıklayın veya sürükleyin',
    dropzoneTextMatrix: '{INPUT} dosyalarını {OUTPUT} formatına dönüştürmek için tıklayın veya bırakın',
    noFilesChosen: 'Dosya seçilmedi',
    outputFormat: 'Çıkış Formatı',
    audioQuality: 'Ses Kalitesi',
    extractAudio: 'Sesi Çıkar',
    extractAudioCount: 'Sesi Çıkar ({count} Dosya)',
    outputSummary: 'Çıkış: {format} ({bitrate})',
    qualityStudio: 'Stüdyo (320 kbps)',
    qualityHigh: 'Yüksek (192 kbps)',
    qualityStandard: 'Standart (128 kbps)',
    processingInitializing: 'Yerel dönüştürme başlatılıyor...',
    processingConverting: '{total} dosyadan {current}. dönüştürülüyor:',
    processingPleaseWait: 'Lütfen bekleyin, dosyalarınız WebAssembly ile yerel olarak işleniyor.',
    successTitle: 'Dönüştürme Tamamlandı!',
    successSubtitle: '{count} dosya sunucuya yüklenmeden başarıyla dönüştürüldü.',
    downloadTrack: 'İndir',
    downloadAllZip: 'Tümünü İndir ({count} Parça - ZIP)',
    convertAnother: 'Daha Fazla Dosya Dönüştür',
    reset: 'Sıfırla'
  },
  matrix: {
    breadcrumbHome: 'Ana Sayfa',
    breadcrumbConverters: 'Dönüştürücüler',
    heroTitle: 'En Hızlı Toplu {INPUT} - {OUTPUT} Dönüştürücü (Ücretsiz Çevrimiçi)',
    heroSubtitle: 'Tarayıcınızda {INPUT} videolarından yüksek kaliteli {OUTPUT} sesini sıfır sunucu yüklemesi ile anında çıkarın.',
    pageMetaTitle: '{INPUT} dosyasını {OUTPUT} formatına Ücretsiz Çevrimiçi Dönüştür (Anında) | VidToAudio',
    pageMetaDesc: '{INPUT} dosyasını doğrudan tarayıcınızda {OUTPUT} formatına ücretsiz çevrimiçi dönüştürün. Yüklemesiz anında ses çıkarma, tam gizlilik ve boyut limiti yok.',
    techSpecBadge: 'Teknik Özellikler ve Kılavuz',
    techSpecSubtitle: '{INPUT} - {OUTPUT} Ses Dönüştürme',
    howToExtractHeading: 'Tarayıcıda {INPUT} Videolarından {OUTPUT} Sesi Nasıl Çıkarılır',
    faqSectionTitle: 'Sık Sorulan Sorular: {INPUT} - {OUTPUT}',
    faqSectionSubtitle: '{INPUT} videolarını {OUTPUT} sesine dönüştürme hakkında teknik bilgiler ve yanıtlar.',
    ratingHeading: 'Kullanıcı Yorumları ve Puanlar',
    ratingSubheading: '{INPUT} - {OUTPUT} WebAssembly motoru için doğrulanmış değerlendirmeler.',
    ratingVerifiedUsers: 'Doğrulanmış Kullanıcılar',
    ratingYourRating: 'Puanınız:',
    ratingSubmitFeedback: 'Değerlendirmeyi Gönder',
    ratingThankYou: 'Değerlendirmeniz için teşekkürler!',
    allConvertersTitle: 'Tüm 81 video-ses dönüştürücüsünü keşfedin',
    allConvertersSubtitle: 'Tüm kombinasyonlar WebAssembly ile tarayıcınızda çalışır. Yükleme yok, anında indirme.',
    convertLabel: '{INPUT} dosyasını {OUTPUT} formatına dönüştür'
  },
  footer: {
    brandSubtitle: 'Tarayıcınızda stüdyo kalitesinde toplu ses çıkarma. Sıfır yükleme, %100 özel ve ücretsiz.',
    privacyNotice: 'Tüm dönüştürmeler cihazınızın işlemcisinde yerel olarak gerçekleşir.',
    rightsReserved: 'Tüm hakları saklıdır.',
    privacyPolicy: 'Gizlilik Politikası',
    termsOfService: 'Kullanım Koşulları'
  }
});

// Greek (el)
export const elTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Αρχική',
    converters: 'Μετατροπείς',
    blog: 'Blog',
    editor: 'Επεξεργαστής Βίντεο',
    about: 'Σχετικά',
    privacy: 'Απόρρητο',
    admin: 'Διαχείριση',
    getApp: 'Λήψη App',
    terms: 'Όροι Χρήσης'
  },
  hero: {
    homeTitle: 'Ταχύτερος Μαζικός Μετατροπέας MP4 σε MP3 (Δωρεάν Online)',
    homeSubtitle: 'Εξάγετε ήχο υψηλής πιστότητας από MP4 βίντεο απευθείας στο πρόγραμμα περιήγησης: 100% τοπικά μέσω WebAssembly, χωρίς αποστολή σε διακομιστή.',
    popularConverters: 'Δημοφιλείς μετατροπείς:',
    trustOffline: '100% Στο Πρόγραμμα Περιήγησης',
    trustQueue: 'Μαζική Ουρά',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'Χωρίς Αποστολή σε Διακομιστή'
  },
  converter: {
    tryItHereHome: 'Δοκιμάστε εδώ: Μαζικός Μετατροπέας MP4 σε MP3',
    tryItHereMatrix: 'Δοκιμάστε εδώ: Μαζικός Μετατροπέας {INPUT} σε {OUTPUT}',
    subtitleHome: 'Επιλέξτε ένα ή περισσότερα βίντεο. Υπολογίζονται τοπικά στο πρόγραμμα περιήγησης μέσω FFmpeg WebAssembly.',
    subtitleMatrix: 'Επιλέξτε αρχεία {INPUT} για μετατροπή σε {OUTPUT} στη συσκευή σας.',
    dropzoneTextHome: 'Κάντε κλικ ή σύρετε βίντεο εδώ για μαζική μετατροπή',
    dropzoneTextMatrix: 'Κάντε κλικ ή σύρετε αρχεία {INPUT} για μετατροπή σε {OUTPUT}',
    noFilesChosen: 'Δεν επιλέχθηκε αρχείο',
    outputFormat: 'Μορφή Εξόδου',
    audioQuality: 'Ποιότητα Ήχου',
    extractAudio: 'Εξαγωγή Ήχου',
    extractAudioCount: 'Εξαγωγή Ήχου ({count} Αρχεία)',
    outputSummary: 'Έξοδος: {format} ({bitrate})',
    qualityStudio: 'Studio (320 kbps)',
    qualityHigh: 'Υψηλή (192 kbps)',
    qualityStandard: 'Κανονική (128 kbps)',
    processingInitializing: 'Εκκίνηση τοπικής μετατροπής...',
    processingConverting: 'Μετατροπή αρχείου {current} από {total}:',
    processingPleaseWait: 'Παρακαλώ περιμένετε, η επεξεργασία γίνεται τοπικά μέσω WebAssembly.',
    successTitle: 'Η Μετατροπή Ολοκληρώθηκε!',
    successSubtitle: '{count} αρχεία εξήχθησαν με επιτυχία χωρίς αποστολή δεδομένων σε διακομιστή.',
    downloadTrack: 'Λήψη',
    downloadAllZip: 'Λήψη Όλων ({count} Κομμάτια - ZIP)',
    convertAnother: 'Μετατροπή Περισσότερων Αρχείων',
    reset: 'Επαναφορά'
  },
  matrix: {
    breadcrumbHome: 'Αρχική',
    breadcrumbConverters: 'Μετατροπείς',
    heroTitle: 'Ταχύτερος Μαζικός Μετατροπέας {INPUT} σε {OUTPUT} (Δωρεάν Online)',
    heroSubtitle: 'Εξάγετε ήχο {OUTPUT} από αρχεία βίντεο {INPUT} απευθείας στον browser χωρίς μεταφόρτωση σε server.',
    pageMetaTitle: 'Μετατροπή {INPUT} σε {OUTPUT} Online Δωρεάν (Άμεσα) | VidToAudio',
    pageMetaDesc: 'Μετατρέψτε {INPUT} σε {OUTPUT} δωρεάν online στο πρόγραμμα περιήγησης. Άμεση εξαγωγή ήχου χωρίς upload, πλήρης ιδιωτικότητα και χωρίς όρια μεγέθους.',
    techSpecBadge: 'Τεχνικές Προδιαγραφές & Οδηγός',
    techSpecSubtitle: 'Μετατροπή Ήχου {INPUT} σε {OUTPUT}',
    howToExtractHeading: 'Πώς να Εξάγετε Ήχο {OUTPUT} από Βίντεο {INPUT} στον Browser',
    faqSectionTitle: 'Συχνές Ερωτήσεις: {INPUT} σε {OUTPUT}',
    faqSectionSubtitle: 'Απαντήσεις και τεχνικές λεπτομέρειες για τη μετατροπή {INPUT} σε {OUTPUT}.',
    ratingHeading: 'Αξιολογήσεις Χρηστών',
    ratingSubheading: 'Επαληθευμένες κριτικές για τη μηχανή WebAssembly {INPUT} σε {OUTPUT}.',
    ratingVerifiedUsers: 'Επαληθευμένοι Χρήστες',
    ratingYourRating: 'Η αξιολόγησή σας:',
    ratingSubmitFeedback: 'Υποβολή Αξιολόγησης',
    ratingThankYou: 'Ευχαριστούμε για την αξιολόγησή σας!',
    allConvertersTitle: 'Εξερευνήστε και τους 81 μετατροπείς βίντεο σε ήχο',
    allConvertersSubtitle: 'Κάθε συνδυασμός εκτελείται 100% τοπικά μέσω WebAssembly. Άμεση λήψη.',
    convertLabel: 'Μετατροπή {INPUT} σε {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Εξαγωγή ήχου ποιότητας στούντιο απευθείας στον browser. Μηδενικό upload, 100% ιδιωτικό.',
    privacyNotice: 'Όλες οι μετατροπές εκτελούνται τοπικά στη συσκευή σας.',
    rightsReserved: 'Όλα τα δικαιώματα διατηρούνται.',
    privacyPolicy: 'Πολιτική Απορρήτου',
    termsOfService: 'Όροι Χρήσης'
  }
});

// Slovak (sk)
export const skTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Domov',
    converters: 'Konvertory',
    blog: 'Blog',
    editor: 'Video Editor',
    about: 'O nás',
    privacy: 'Súkromie',
    admin: 'Správa',
    getApp: 'Stiahnuť App',
    terms: 'Podmienky'
  },
  hero: {
    homeTitle: 'Najrýchlejší hromadný konvertor MP4 na MP3 (Zadarmo Online)',
    homeSubtitle: 'Extrahujte bezstratový MP3 zvuk z MP4 videí priamo v prehliadači: 100% lokálne cez WebAssembly, bez nahrávania na server a s plným súkromím.',
    popularConverters: 'Populárne konvertory:',
    trustOffline: '100% V Prehliadači',
    trustQueue: 'Dávkový Rad',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'Bez Nahrávania na Server'
  },
  converter: {
    tryItHereHome: 'Vyskúšajte tu: Dávkový konvertor MP4 na MP3',
    tryItHereMatrix: 'Vyskúšajte tu: Dávkový konvertor {INPUT} na {OUTPUT}',
    subtitleHome: 'Vyberte video súbory. Spracovanie prebieha lokálne v prehliadači pomocou FFmpeg WebAssembly.',
    subtitleMatrix: 'Vyberte súbory {INPUT} pre prevod do {OUTPUT} vo vašom zariadení.',
    dropzoneTextHome: 'Kliknite alebo presuňte videá sem pre hromadnú konverziu',
    dropzoneTextMatrix: 'Kliknite alebo presuňte súbory {INPUT} na prevod do {OUTPUT}',
    noFilesChosen: 'Nie sú vybrané žiadne súbory',
    outputFormat: 'Výstupný formát',
    audioQuality: 'Kvalita zvuku',
    extractAudio: 'Extrahovať zvuk',
    extractAudioCount: 'Extrahovať zvuk ({count} súborov)',
    outputSummary: 'Výstup: {format} ({bitrate})',
    qualityStudio: 'Štúdio (320 kbps)',
    qualityHigh: 'Vysoká (192 kbps)',
    qualityStandard: 'Štandard (128 kbps)',
    processingInitializing: 'Inicializuje sa lokálna konverzia...',
    processingConverting: 'Konvertuje sa súbor {current} z {total}:',
    processingPleaseWait: 'Počkajte, vaše médiá sa spracovávajú cez WebAssembly.',
    successTitle: 'Konverzia bola úspešná!',
    successSubtitle: '{count} súborov bolo úspešne prevedených bez nahrávania na server.',
    downloadTrack: 'Stiahnuť',
    downloadAllZip: 'Stiahnuť všetko ({count} skladieb - ZIP)',
    convertAnother: 'Konvertovať ďalšie súbory',
    reset: 'Resetovať'
  },
  matrix: {
    breadcrumbHome: 'Domov',
    breadcrumbConverters: 'Konvertory',
    heroTitle: 'Najrýchlejší hromadný konvertor {INPUT} na {OUTPUT} (Zadarmo Online)',
    heroSubtitle: 'Extrahujte vysokokvalitný zvuk {OUTPUT} z videí {INPUT} priamo v prehliadači bez odosielania na servery.',
    pageMetaTitle: 'Konvertovať {INPUT} na {OUTPUT} Online Zadarmo (Okamžite) | VidToAudio',
    pageMetaDesc: 'Preveďte {INPUT} na {OUTPUT} zadarmo online priamo v prehliadači. Okamžitá extrakcia zvuku bez nahrávania na server, maximálne súkromie a bez limitov veľkosti.',
    techSpecBadge: 'Technická špecifikácia & Návod',
    techSpecSubtitle: 'Konverzia zvuku z {INPUT} na {OUTPUT}',
    howToExtractHeading: 'Ako extrahovať zvuk {OUTPUT} z videa {INPUT} v prehliadači',
    faqSectionTitle: 'Často kladené otázky: {INPUT} na {OUTPUT}',
    faqSectionSubtitle: 'Odpovede a technické podrobnosti o prevode {INPUT} do {OUTPUT}.',
    ratingHeading: 'Hodnotenia používateľov',
    ratingSubheading: 'Overené recenzie pre náš WebAssembly engine {INPUT} na {OUTPUT}.',
    ratingVerifiedUsers: 'Overení používatelia',
    ratingYourRating: 'Vaše hodnotenie:',
    ratingSubmitFeedback: 'Odoslať hodnotenie',
    ratingThankYou: 'Ďakujeme za vaše hodnotenie!',
    allConvertersTitle: 'Preskúmajte všetkých 81 video-audio konvertorov',
    allConvertersSubtitle: 'Každá kombinácia beží vo vašom prehliadači cez WebAssembly. Žiadne nahrávanie, okamžité stiahnutie.',
    convertLabel: 'Konvertovať {INPUT} na {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Rýchla extrakcia zvuku priamo v prehliadači. Žiadne nahrávanie, 100% súkromné a zadarmo.',
    privacyNotice: 'Všetky konverzie prebiehajú výhradne lokálne na vašom procesore.',
    rightsReserved: 'Všetky práva vyhradené.',
    privacyPolicy: 'Zásady ochrany osobných údajov',
    termsOfService: 'Podmienky používania'
  }
});

// Japanese (ja)
export const jaTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'ホーム',
    converters: '変換ツール',
    blog: 'ブログ',
    editor: '動画エディター',
    about: '運営者情報',
    privacy: 'プライバシー',
    admin: '管理',
    getApp: 'アプリを入手',
    terms: '利用規約'
  },
  hero: {
    homeTitle: '最速のバッチMP4からMP3への変換（無料オンライン）',
    homeSubtitle: 'ブラウザ内でMP4動画から高音質MP3音声を直接抽出：WebAssemblyによる100%ローカル処理、サーバーへのアップロード不要で完全なプライバシーを保護。',
    popularConverters: '人気の変換ツール:',
    trustOffline: 'ブラウザ内で100%完結',
    trustQueue: '一括バッチ処理',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'サーバーアップロードなし'
  },
  converter: {
    tryItHereHome: 'ここでお試し：MP4からMP3への一括変換',
    tryItHereMatrix: 'ここでお試し：{INPUT}から{OUTPUT}への一括変換',
    subtitleHome: '1つまたは複数の動画ファイルを選択してください。FFmpeg WebAssemblyによりブラウザ内で直接処理されます。',
    subtitleMatrix: '{INPUT}ファイルを選択し、お使いの端末で直接{OUTPUT}音声へ変換します。',
    dropzoneTextHome: 'ここをクリックまたは動画をドロップして一括変換',
    dropzoneTextMatrix: '{INPUT}ファイルをクリックまたはドロップして{OUTPUT}へ変換',
    noFilesChosen: 'ファイルが選択されていません',
    outputFormat: '出力形式',
    audioQuality: '音質ビットレート',
    extractAudio: '音声を抽出する',
    extractAudioCount: '音声を抽出 ({count}件のファイル)',
    outputSummary: '出力: {format} ({bitrate})',
    qualityStudio: 'スタジオ品質 (320kbps)',
    qualityHigh: '高音質 (192kbps)',
    qualityStandard: '標準 (128kbps)',
    processingInitializing: 'ローカル変換を初期化中...',
    processingConverting: '変換中 {total}件中 {current}件目:',
    processingPleaseWait: 'WebAssemblyでローカル処理中です。しばらくお待ちください。',
    successTitle: '一括変換が完了しました！',
    successSubtitle: '外部サーバーにデータを送信することなく、{count}件の変換に成功しました。',
    downloadTrack: 'ダウンロード',
    downloadAllZip: 'すべてダウンロード ({count}曲 - ZIP)',
    convertAnother: '他のファイルを変換する',
    reset: 'リセット'
  },
  matrix: {
    breadcrumbHome: 'ホーム',
    breadcrumbConverters: '変換ツール',
    heroTitle: '最速のバッチ{INPUT}から{OUTPUT}への変換（無料オンライン）',
    heroSubtitle: 'サーバーへのアップロードなしで、ブラウザ内で{INPUT}動画から高音質な{OUTPUT}音声を安全かつ高速に抽出します。',
    pageMetaTitle: '{INPUT}を{OUTPUT}に無料オンライン変換（即時） | VidToAudio',
    pageMetaDesc: 'ブラウザ内で{INPUT}を{OUTPUT}にオンライン無料変換。サーバー送信なし、完全プライバシー保護、ファイルサイズ無制限で即座に音声抽出。',
    techSpecBadge: '技術仕様＆ガイド',
    techSpecSubtitle: '{INPUT}から{OUTPUT}への音声変換',
    howToExtractHeading: 'ブラウザで{INPUT}動画から{OUTPUT}音声を抽出する方法',
    faqSectionTitle: 'よくある質問: {INPUT}から{OUTPUT}',
    faqSectionSubtitle: '{INPUT}動画から{OUTPUT}音声を抽出する際の技術的詳細とQ&A。',
    ratingHeading: 'ユーザー評価とレビュー',
    ratingSubheading: '{INPUT}から{OUTPUT}へのWebAssemblyエンジンに対する検証済みレビュー。',
    ratingVerifiedUsers: '認証済みユーザー',
    ratingYourRating: 'あなたの評価:',
    ratingSubmitFeedback: '評価を送信する',
    ratingThankYou: '評価をいただきありがとうございます！',
    allConvertersTitle: '全81種類の動画から音声への変換ツールを見る',
    allConvertersSubtitle: 'すべての組み合わせがWebAssemblyによりブラウザ内で100%動作します。',
    convertLabel: '{INPUT}から{OUTPUT}へ変換'
  },
  footer: {
    brandSubtitle: 'ブラウザ内でスタジオ品質の音声を一括抽出。アップロード不要、完全無料・安全。',
    privacyNotice: 'すべての変換はお使いの端末のCPUで直接行われます。外部へ送信されることはありません。',
    rightsReserved: 'All rights reserved.',
    privacyPolicy: 'プライバシーポリシー',
    termsOfService: '利用規約'
  }
});

// Korean (ko)
export const koTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: '홈',
    converters: '변환기',
    blog: '블로그',
    editor: '비디오 에디터',
    about: '소개',
    privacy: '개인정보처리방침',
    admin: '관리자',
    getApp: '앱 다운로드',
    terms: '이용약관'
  },
  hero: {
    homeTitle: '가장 빠른 일괄 MP4 MP3 변환기 (무료 온라인)',
    homeSubtitle: '브라우저에서 MP4 동영상으로부터 고음질 MP3 오디오를 직접 추출하세요: WebAssembly 기반 100% 로컬 처리, 서버 업로드 없음, 완벽한 개인정보 보호.',
    popularConverters: '인기 변환기:',
    trustOffline: '브라우저 100% 로컬',
    trustQueue: '일괄 큐 처리',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: '서버 업로드 없음'
  },
  converter: {
    tryItHereHome: '지금 체험하기: MP4 to MP3 일괄 변환기',
    tryItHereMatrix: '지금 체험하기: {INPUT} to {OUTPUT} 일괄 변환기',
    subtitleHome: '하나 이상의 비디오 파일을 선택하세요. FFmpeg WebAssembly를 통해 브라우저에서 직접 변환됩니다.',
    subtitleMatrix: '{INPUT} 파일을 선택하여 기기에서 직접 {OUTPUT} 오디오로 변환하세요.',
    dropzoneTextHome: '여기를 클릭하거나 비디오를 드래그하여 일괄 변환',
    dropzoneTextMatrix: '{INPUT} 파일을 클릭하거나 드래그하여 {OUTPUT}로 변환',
    noFilesChosen: '선택된 파일 없음',
    outputFormat: '출력 포맷',
    audioQuality: '오디오 품질',
    extractAudio: '오디오 추출하기',
    extractAudioCount: '오디오 추출 ({count}개 파일)',
    outputSummary: '출력: {format} ({bitrate})',
    qualityStudio: '스튜디오 (320kbps)',
    qualityHigh: '고음질 (192kbps)',
    qualityStandard: '표준 (128kbps)',
    processingInitializing: '로컬 변환 초기화 중...',
    processingConverting: '{total}개 중 {current}번째 파일 변환 중:',
    processingPleaseWait: 'WebAssembly로 브라우저에서 안전하게 처리 중입니다. 잠시만 기다려주세요.',
    successTitle: '일괄 변환 완료!',
    successSubtitle: '외부 서버로 데이터를 업로드하지 않고 {count}개 파일을 성공적으로 변환했습니다.',
    downloadTrack: '다운로드',
    downloadAllZip: '전체 다운로드 ({count}곡 - ZIP)',
    convertAnother: '다른 파일 변환하기',
    reset: '초기화'
  },
  matrix: {
    breadcrumbHome: '홈',
    breadcrumbConverters: '변환기',
    heroTitle: '가장 빠른 일괄 {INPUT} to {OUTPUT} 변환기 (무료 온라인)',
    heroSubtitle: '서버 업로드 없이 브라우저에서 {INPUT} 동영상의 고음질 {OUTPUT} 오디오를 즉시 추출합니다.',
    pageMetaTitle: '{INPUT}을(를) {OUTPUT}(으)로 무료 온라인 변환 (즉시) | VidToAudio',
    pageMetaDesc: '브라우저에서 직접 {INPUT}을(를) {OUTPUT}(으)로 무료 온라인 변환하세요. 파일 업로드 없는 즉각적인 오디오 추출, 완벽한 개인정보 보호 및 무제한 파일 크기.',
    techSpecBadge: '기술 사양 및 안내',
    techSpecSubtitle: '{INPUT}에서 {OUTPUT} 오디오 변환',
    howToExtractHeading: '브라우저에서 {INPUT} 동영상으로부터 {OUTPUT} 오디오를 추출하는 방법',
    faqSectionTitle: '자주 묻는 질문: {INPUT} to {OUTPUT}',
    faqSectionSubtitle: '{INPUT} 동영상에서 {OUTPUT} 오디오를 추출하는 과정에 대한 기술적 안내.',
    ratingHeading: '사용자 평가 및 리뷰',
    ratingSubheading: '{INPUT} to {OUTPUT} WebAssembly 엔진에 대한 실제 사용자 리뷰.',
    ratingVerifiedUsers: '인증된 사용자',
    ratingYourRating: '내 평점:',
    ratingSubmitFeedback: '리뷰 제출하기',
    ratingThankYou: '소중한 평가 감사합니다!',
    allConvertersTitle: '81가지 비디오-오디오 변환기 둘러보기',
    allConvertersSubtitle: '모든 조합이 WebAssembly를 통해 브라우저에서 100% 실행됩니다.',
    convertLabel: '{INPUT}을(를) {OUTPUT}(으)로 변환'
  },
  footer: {
    brandSubtitle: '브라우저에서 스튜디오급 오디오를 일괄 추출하세요. 업로드 없음, 100% 무료.',
    privacyNotice: '모든 변환은 기기 CPU에서 직접 실행됩니다.',
    rightsReserved: 'All rights reserved.',
    privacyPolicy: '개인정보처리방침',
    termsOfService: '서비스 이용약관'
  }
});

// Chinese (zh)
export const zhTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: '首页',
    converters: '转换器',
    blog: '博客',
    editor: '视频编辑器',
    about: '关于我们',
    privacy: '隐私政策',
    admin: '后台管理',
    getApp: '获取客户端',
    terms: '服务条款'
  },
  hero: {
    homeTitle: '极速批量 MP4 转 MP3 转换器（免费在线）',
    homeSubtitle: '直接在浏览器中将 MP4 视频提取为高品质 MP3 音频：基于 WebAssembly 100% 本地运算，无需上传远程服务器，保护您的绝对隐私。',
    popularConverters: '常用转换器：',
    trustOffline: '浏览器 100% 本地运行',
    trustQueue: '批量队列处理',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: '零服务器上传'
  },
  converter: {
    tryItHereHome: '立即体验：MP4 转 MP3 批量转换器',
    tryItHereMatrix: '立即体验：{INPUT} 转 {OUTPUT} 批量转换器',
    subtitleHome: '选择一个或多个视频文件，通过 FFmpeg WebAssembly 在您的浏览器中直接安全处理。',
    subtitleMatrix: '选择 {INPUT} 文件，在您的设备上直接提取为 {OUTPUT} 音频。',
    dropzoneTextHome: '点击或拖拽视频文件至此处以开始批量转换',
    dropzoneTextMatrix: '点击或拖拽 {INPUT} 文件以转换为 {OUTPUT}',
    noFilesChosen: '未选择任何文件',
    outputFormat: '输出格式',
    audioQuality: '音频码率质量',
    extractAudio: '提取音频',
    extractAudioCount: '提取音频 ({count} 个文件)',
    outputSummary: '输出参数：{format} ({bitrate})',
    qualityStudio: '录音室母带级别 (320kbps)',
    qualityHigh: '高品质 (192kbps)',
    qualityStandard: '标准品质 (128kbps)',
    processingInitializing: '正在初始化本地转换引擎...',
    processingConverting: '正在转换第 {current} / {total} 个文件：',
    processingPleaseWait: '正在通过 WebAssembly 本地处理，请稍候...',
    successTitle: '批量转换完成！',
    successSubtitle: '已成功在本地提取 {count} 个文件，未向任何服务器传输媒体数据。',
    downloadTrack: '下载文件',
    downloadAllZip: '全部打包下载 ({count} 首曲目 - ZIP)',
    convertAnother: '转换更多文件',
    reset: '重置'
  },
  matrix: {
    breadcrumbHome: '首页',
    breadcrumbConverters: '转换器',
    heroTitle: '极速批量 {INPUT} 转 {OUTPUT} 转换器（免费在线）',
    heroSubtitle: '无需上传服务器，在浏览器中即可从 {INPUT} 视频中瞬时提取高清 {OUTPUT} 音频。',
    pageMetaTitle: '{INPUT} 转 {OUTPUT} 在线免费转换（即时提取） | VidToAudio',
    pageMetaDesc: '在浏览器中直接免费将 {INPUT} 转换为 {OUTPUT}。无需上传文件，秒级提取，完全隐私保护，无文件大小限制。',
    techSpecBadge: '技术规范与指南',
    techSpecSubtitle: '{INPUT} 转 {OUTPUT} 音频转换',
    howToExtractHeading: '如何在浏览器中从 {INPUT} 视频中提取 {OUTPUT} 音频',
    faqSectionTitle: '常见问题解答：{INPUT} 转 {OUTPUT}',
    faqSectionSubtitle: '有关从 {INPUT} 视频提取 {OUTPUT} 音频的技术细节与解答。',
    ratingHeading: '用户评价与反馈',
    ratingSubheading: '关于我们 {INPUT} 转 {OUTPUT} WebAssembly 引擎的真实用户评价。',
    ratingVerifiedUsers: '已认证用户',
    ratingYourRating: '您的评分：',
    ratingSubmitFeedback: '提交评价',
    ratingThankYou: '非常感谢您的评分！',
    allConvertersTitle: '浏览全部 81 种视频转音频转换方案',
    allConvertersSubtitle: '所有格式组合均借助 WebAssembly 在您的浏览器中直接处理。',
    convertLabel: '转换 {INPUT} 为 {OUTPUT}'
  },
  footer: {
    brandSubtitle: '直接在浏览器中批量提取母带级音频。零服务器上传，100% 隐私，永久免费。',
    privacyNotice: '所有转换均在您的设备处理器上本地完成，视频文件永远不会离开您的设备。',
    rightsReserved: '保留所有权利。',
    privacyPolicy: '隐私政策',
    termsOfService: '服务条款'
  }
});

// Arabic (ar) - RTL
export const arTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'الرئيسية',
    converters: 'المحولات',
    blog: 'المدونة',
    editor: 'محرر الفيديو',
    about: 'من نحن',
    privacy: 'الخصوصية',
    admin: 'لوحة التحكم',
    getApp: 'تحميل التطبيق',
    terms: 'شروط الاستخدام'
  },
  hero: {
    homeTitle: 'أسرع محول دفعات من MP4 إلى MP3 (مجاني أونلاين)',
    homeSubtitle: 'استخرج مسارات صوتية نقية بصيغة MP3 من فيديوهاتك مباشرة داخل المتصفح: معالجة محلية 100% عبر WebAssembly بدون أي رفع للملفات مع خصوصية تامة.',
    popularConverters: 'المحولات الشائعة:',
    trustOffline: '100% داخل المتصفح',
    trustQueue: 'قائمة دفعات متسلسلة',
    trustBitrate: '128 / 192 / 320 كيلوبت/ثانية',
    trustNoUploads: 'بدون رفع على الخوادم'
  },
  converter: {
    tryItHereHome: 'جرب الآن: محول دفعات من MP4 إلى MP3',
    tryItHereMatrix: 'جرب الآن: محول دفعات من {INPUT} إلى {OUTPUT}',
    subtitleHome: 'اختر مقطع فيديو أو أكثر. تتم المعالجة محلياً في متصفحك بواسطة FFmpeg WebAssembly.',
    subtitleMatrix: 'اختر ملفات {INPUT} لتحويلها مباشرة إلى {OUTPUT} على جهازك.',
    dropzoneTextHome: 'انقر هنا أو اسحب ملفات الفيديو للتحويل الجماعي',
    dropzoneTextMatrix: 'انقر أو اسحب ملفات {INPUT} لتحويلها إلى {OUTPUT}',
    noFilesChosen: 'لم يتم اختيار أي ملف',
    outputFormat: 'صيغة الإخراج',
    audioQuality: 'جودة الصوت',
    extractAudio: 'استخراج الصوت',
    extractAudioCount: 'استخراج الصوت ({count} ملفات)',
    outputSummary: 'الإخراج: {format} ({bitrate})',
    qualityStudio: 'استوديو (320 كيلوبت/ثانية)',
    qualityHigh: 'عالية (192 كيلوبت/ثانية)',
    qualityStandard: 'قياسية (128 كيلوبت/ثانية)',
    processingInitializing: 'بدء تشغيل المحرك المحلي...',
    processingConverting: 'جاري تحويل الملف {current} من {total}:',
    processingPleaseWait: 'يرجى الانتظار، تتم معالجة ملفاتك محلياً عبر تقنية WebAssembly.',
    successTitle: 'اكتمل التحويل بنجاح!',
    successSubtitle: 'تم تحويل {count} ملف(ات) بنجاح دون إرسال بايت واحد إلى خوادم خارجية.',
    downloadTrack: 'تحميل',
    downloadAllZip: 'تحميل الكل ({count} مقاطع - ZIP)',
    convertAnother: 'تحويل المزيد من الملفات',
    reset: 'إعادة تعيين'
  },
  matrix: {
    breadcrumbHome: 'الرئيسية',
    breadcrumbConverters: 'المحولات',
    heroTitle: 'أسرع محول دفعات من {INPUT} إلى {OUTPUT} (مجاني أونلاين)',
    heroSubtitle: 'استخرج صوتاً فائق الجودة بصيغة {OUTPUT} من فيديوهات {INPUT} داخل متصفحك بدون أي رفع للملفات.',
    pageMetaTitle: 'تحويل {INPUT} إلى {OUTPUT} أونلاين مجاناً (فوري) | VidToAudio',
    pageMetaDesc: 'حول ملفات {INPUT} إلى {OUTPUT} أونلاين مجاناً مباشرة في المتصفح. استخراج فوري بدون رفع الملفات، خصوصية كاملة وبدون قيود حجم.',
    techSpecBadge: 'المواصفات التقنية والدليل',
    techSpecSubtitle: 'تحويل الصوت من {INPUT} إلى {OUTPUT}',
    howToExtractHeading: 'كيفية استخراج صوت {OUTPUT} من فيديوهات {INPUT} داخل المتصفح',
    faqSectionTitle: 'الأسئلة الشائعة: {INPUT} إلى {OUTPUT}',
    faqSectionSubtitle: 'إجابات وتفاصيل تقنية حول استخراج الصوت بصيغة {OUTPUT} من فيديوهات {INPUT}.',
    ratingHeading: 'تقييمات وآراء المستخدمين',
    ratingSubheading: 'تقييمات معتمدة لمحرك WebAssembly لتحويل {INPUT} إلى {OUTPUT}.',
    ratingVerifiedUsers: 'مستخدمون موثوقون',
    ratingYourRating: 'تقييمك:',
    ratingSubmitFeedback: 'إرسال التقييم',
    ratingThankYou: 'شكراً جزيلاً على تقييمك!',
    allConvertersTitle: 'استكشف جميع محولات الفيديو إلى صوت الـ 81',
    allConvertersSubtitle: 'كل صيغة تعمل بنسبة 100% داخل المتصفح بأمان تام عبر WebAssembly.',
    convertLabel: 'تحويل {INPUT} إلى {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'استخراج صوتي بجودة استوديو مباشرة في متصفحك. بدون رفع، مجاني وخصوصي 100%.',
    privacyNotice: 'تتم كافة العمليات محلياً على معالج جهازك.',
    rightsReserved: 'جميع الحقوق محفوظة.',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة'
  }
});

// Indonesian (id)
export const idTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Beranda',
    converters: 'Konverter',
    blog: 'Blog',
    editor: 'Editor Video',
    about: 'Tentang Kami',
    privacy: 'Privasi',
    admin: 'Admin',
    getApp: 'Unduh Aplikasi',
    terms: 'Syarat Ketentuan'
  },
  hero: {
    homeTitle: 'Konverter Batch MP4 ke MP3 Tercepat (Online Gratis)',
    homeSubtitle: 'Ekstrak audio MP3 berkualitas tinggi dari video MP4 langsung di browser Anda: 100% lokal via WebAssembly, tanpa upload ke server dan privasi total.',
    popularConverters: 'Konverter Populer:',
    trustOffline: '100% Di Browser',
    trustQueue: 'Antrean Batch',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'Tanpa Upload Server'
  },
  converter: {
    tryItHereHome: 'Coba di sini: Konverter Batch MP4 ke MP3',
    tryItHereMatrix: 'Coba di sini: Konverter Batch {INPUT} ke {OUTPUT}',
    subtitleHome: 'Pilih satu atau beberapa video. Diproses secara lokal di browser melalui FFmpeg WebAssembly.',
    subtitleMatrix: 'Pilih file {INPUT} untuk dikonversi ke {OUTPUT} di perangkat Anda.',
    dropzoneTextHome: 'Klik atau seret video ke sini untuk konversi batch',
    dropzoneTextMatrix: 'Klik atau seret file {INPUT} untuk dikonversi ke {OUTPUT}',
    noFilesChosen: 'Tidak ada file yang dipilih',
    outputFormat: 'Format Keluaran',
    audioQuality: 'Kualitas Audio',
    extractAudio: 'Ekstrak Audio',
    extractAudioCount: 'Ekstrak Audio ({count} File)',
    outputSummary: 'Keluaran: {format} ({bitrate})',
    qualityStudio: 'Studio (320kbps)',
    qualityHigh: 'Tinggi (192kbps)',
    qualityStandard: 'Standar (128kbps)',
    processingInitializing: 'Memulai konversi lokal...',
    processingConverting: 'Mengonversi file {current} dari {total}:',
    processingPleaseWait: 'Harap tunggu, media Anda diproses secara lokal melalui WebAssembly.',
    successTitle: 'Konversi Batch Selesai!',
    successSubtitle: '{count} file berhasil dikonversi tanpa mengunggah data apa pun ke server luar.',
    downloadTrack: 'Unduh',
    downloadAllZip: 'Unduh Semua ({count} Lagu - ZIP)',
    convertAnother: 'Konversi File Lainnya',
    reset: 'Reset'
  },
  matrix: {
    breadcrumbHome: 'Beranda',
    breadcrumbConverters: 'Konverter',
    heroTitle: 'Konverter Batch {INPUT} ke {OUTPUT} Tercepat (Online Gratis)',
    heroSubtitle: 'Ekstrak audio {OUTPUT} berkualitas tinggi dari video {INPUT} langsung di browser tanpa upload ke server.',
    pageMetaTitle: 'Konversi {INPUT} ke {OUTPUT} Online Gratis (Instan) | VidToAudio',
    pageMetaDesc: 'Konversi {INPUT} ke {OUTPUT} online gratis langsung di browser Anda. Ekstraksi audio instan tanpa upload, privasi maksimal dan tanpa batas ukuran file.',
    techSpecBadge: 'Spesifikasi Teknis & Panduan',
    techSpecSubtitle: 'Konversi Audio {INPUT} ke {OUTPUT}',
    howToExtractHeading: 'Cara Mengekstrak Audio {OUTPUT} dari Video {INPUT} di Browser',
    faqSectionTitle: 'Pertanyaan Umum: {INPUT} ke {OUTPUT}',
    faqSectionSubtitle: 'Detail teknis dan panduan mengekstrak audio {OUTPUT} dari video {INPUT}.',
    ratingHeading: 'Penilaian & Ulasan Pengguna',
    ratingSubheading: 'Ulasan terverifikasi untuk engine WebAssembly {INPUT} ke {OUTPUT}.',
    ratingVerifiedUsers: 'Pengguna Terverifikasi',
    ratingYourRating: 'Penilaian Anda:',
    ratingSubmitFeedback: 'Kirim Ulasan',
    ratingThankYou: 'Terima kasih atas ulasan Anda!',
    allConvertersTitle: 'Jelajahi semua 81 konverter video ke audio',
    allConvertersSubtitle: 'Setiap kombinasi berjalan 100% di browser via WebAssembly. Unduh instan.',
    convertLabel: 'Konversi {INPUT} ke {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Ekstrak audio berkualitas studio langsung di browser Anda. Tanpa upload, 100% privat dan gratis.',
    privacyNotice: 'Semua proses berjalan secara lokal pada prosesor perangkat Anda.',
    rightsReserved: 'Hak cipta dilindungi undang-undang.',
    privacyPolicy: 'Kebijakan Privasi',
    termsOfService: 'Ketentuan Layanan'
  }
});

// Thai (th)
export const thTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'หน้าแรก',
    converters: 'ตัวแปลงไฟล์',
    blog: 'บล็อก',
    editor: 'โปรแกรมตัดต่อวิดีโอ',
    about: 'เกี่ยวกับเรา',
    privacy: 'ความเป็นส่วนตัว',
    admin: 'ผู้ดูแลระบบ',
    getApp: 'ดาวน์โหลดแอป',
    terms: 'ข้อกำหนดการใช้งาน'
  },
  hero: {
    homeTitle: 'เครื่องมือแปลง MP4 เป็น MP3 แบบกลุ่มที่เร็วที่สุด (ออนไลน์ฟรี)',
    homeSubtitle: 'แยกเสียง MP3 คุณภาพสูงจากวิดีโอ MP4 ได้ทันทีในเบราว์เซอร์: ประมวลผลแบบโลคัล 100% ผ่าน WebAssembly โดยไม่ต้องอัปโหลดขึ้นเซิร์ฟเวอร์ ปลอดภัยสูงสุด',
    popularConverters: 'ตัวแปลงยอดนิยม:',
    trustOffline: 'ประมวลผลในเบราว์เซอร์ 100%',
    trustQueue: 'คิวแปลงไฟล์แบบกลุ่ม',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'ไม่มีการอัปโหลดขึ้นเซิร์ฟเวอร์'
  },
  converter: {
    tryItHereHome: 'ทดลองใช้งาน: ตัวแปลง MP4 เป็น MP3 แบบกลุ่ม',
    tryItHereMatrix: 'ทดลองใช้งาน: ตัวแปลง {INPUT} เป็น {OUTPUT} แบบกลุ่ม',
    subtitleHome: 'เลือกไฟล์วิดีโอหนึ่งไฟล์ขึ้นไป ประมวลผลโดยตรงในเบราว์เซอร์ของคุณผ่าน FFmpeg WebAssembly',
    subtitleMatrix: 'เลือกไฟล์ {INPUT} เพื่อแปลงเป็น {OUTPUT} บนอุปกรณ์ของคุณทันที',
    dropzoneTextHome: 'คลิกหรือลากไฟล์วิดีโอมาที่นี่เพื่อแปลงไฟล์แบบกลุ่ม',
    dropzoneTextMatrix: 'คลิกหรือวางไฟล์ {INPUT} เพื่อแปลงเป็น {OUTPUT}',
    noFilesChosen: 'ยังไม่ได้เลือกไฟล์',
    outputFormat: 'รูปแบบผลลัพธ์',
    audioQuality: 'คุณภาพเสียง',
    extractAudio: 'แยกเสียง',
    extractAudioCount: 'แยกเสียง ({count} ไฟล์)',
    outputSummary: 'ผลลัพธ์: {format} ({bitrate})',
    qualityStudio: 'คุณภาพสตูดิโอ (320kbps)',
    qualityHigh: 'คุณภาพสูง (192kbps)',
    qualityStandard: 'คุณภาพมาตรฐาน (128kbps)',
    processingInitializing: 'กำลังเริ่มการแปลงไฟล์ในเครื่อง...',
    processingConverting: 'กำลังแปลงไฟล์ที่ {current} จาก {total}:',
    processingPleaseWait: 'โปรดรอสักครู่ ไฟล์กำลังได้รับการประมวลผลผ่าน WebAssembly',
    successTitle: 'แปลงไฟล์สำเร็จ!',
    successSubtitle: 'แปลงไฟล์สำเร็จ {count} ไฟล์โดยไม่มีการส่งข้อมูลไปยังเซิร์ฟเวอร์ภายนอก',
    downloadTrack: 'ดาวน์โหลด',
    downloadAllZip: 'ดาวน์โหลดทั้งหมด ({count} เพลง - ZIP)',
    convertAnother: 'แปลงไฟล์เพิ่มเติม',
    reset: 'รีเซ็ต'
  },
  matrix: {
    breadcrumbHome: 'หน้าแรก',
    breadcrumbConverters: 'ตัวแปลงไฟล์',
    heroTitle: 'เครื่องมือแปลง {INPUT} เป็น {OUTPUT} แบบกลุ่มที่เร็วที่สุด (ออนไลน์ฟรี)',
    heroSubtitle: 'แยกเสียง {OUTPUT} คุณภาพสูงจากวิดีโอ {INPUT} ได้ในเบราว์เซอร์โดยไม่ต้องอัปโหลดขึ้นเซิร์ฟเวอร์',
    pageMetaTitle: 'แปลง {INPUT} เป็น {OUTPUT} ออนไลน์ฟรี (ทันที) | VidToAudio',
    pageMetaDesc: 'แปลง {INPUT} เป็น {OUTPUT} ออนไลน์ฟรีโดยตรงในเบราว์เซอร์ของคุณ แยกเสียงได้ทันที ไม่ต้องอัปโหลดข้อมูล มีความเป็นส่วนตัวสูงสุดและไม่จำกัดขนาดไฟล์',
    techSpecBadge: 'ข้อมูลจำเพาะทางเทคนิคและคู่มือ',
    techSpecSubtitle: 'การแปลงเสียงจาก {INPUT} เป็น {OUTPUT}',
    howToExtractHeading: 'วิธีแยกเสียง {OUTPUT} จากวิดีโอ {INPUT} ในเบราว์เซอร์',
    faqSectionTitle: 'คำถามที่พบบ่อย: {INPUT} เป็น {OUTPUT}',
    faqSectionSubtitle: 'รายละเอียดทางเทคนิคในการแยกเสียง {OUTPUT} จากวิดีโอ {INPUT}',
    ratingHeading: 'คะแนนและรีวิวจากผู้ใช้',
    ratingSubheading: 'รีวิวที่ผ่านการตรวจสอบสำหรับเครื่องมือ WebAssembly {INPUT} เป็น {OUTPUT}',
    ratingVerifiedUsers: 'ผู้ใช้ที่ได้รับการตรวจสอบ',
    ratingYourRating: 'คะแนนของคุณ:',
    ratingSubmitFeedback: 'ส่งคะแนนรีวิว',
    ratingThankYou: 'ขอบคุณสำหรับคะแนนรีวิวของคุณ!',
    allConvertersTitle: 'สำรวจตัวแปลงวิดีโอเป็นเสียงทั้งหมด 81 แบบ',
    allConvertersSubtitle: 'ทุกรูปแบบทำงานได้ 100% ในเบราว์เซอร์ผ่าน WebAssembly ดาวน์โหลดได้ทันที',
    convertLabel: 'แปลง {INPUT} เป็น {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'แยกเสียงคุณภาพสตูดิโอได้ทันทีในเบราว์เซอร์ ไม่ต้องอัปโหลด ปลอดภัยและฟรี 100%',
    privacyNotice: 'การประมวลผลทั้งหมดเกิดขึ้นบน CPU ในอุปกรณ์ของคุณ',
    rightsReserved: 'สงวนลิขสิทธิ์ทั้งหมด',
    privacyPolicy: 'นโยบายความเป็นส่วนตัว',
    termsOfService: 'ข้อกำหนดการให้บริการ'
  }
});

// Vietnamese (vi)
export const viTranslations: TranslationDictionary = createMergedDictionary({
  nav: {
    home: 'Trang chủ',
    converters: 'Bộ chuyển đổi',
    blog: 'Blog',
    editor: 'Trình chỉnh sửa video',
    about: 'Giới thiệu',
    privacy: 'Quyền riêng tư',
    admin: 'Quản trị',
    getApp: 'Tải ứng dụng',
    terms: 'Điều khoản'
  },
  hero: {
    homeTitle: 'Trình chuyển đổi hàng loạt MP4 sang MP3 nhanh nhất (Miễn phí Online)',
    homeSubtitle: 'Tách âm thanh MP3 chất lượng cao từ video MP4 trực tiếp trong trình duyệt của bạn: Xử lý 100% cục bộ bằng WebAssembly, không tải lên máy chủ và bảo mật tối đa.',
    popularConverters: 'Bộ chuyển đổi phổ biến:',
    trustOffline: '100% Trong Trình Duyệt',
    trustQueue: 'Hàng Đợi Chuyển Đổi',
    trustBitrate: '128 / 192 / 320 kbps',
    trustNoUploads: 'Không Tải Lên Máy Chủ'
  },
  converter: {
    tryItHereHome: 'Thử ngay: Bộ chuyển đổi hàng loạt MP4 sang MP3',
    tryItHereMatrix: 'Thử ngay: Bộ chuyển đổi hàng loạt {INPUT} sang {OUTPUT}',
    subtitleHome: 'Chọn một hoặc nhiều tệp video. Được xử lý trực tiếp trong trình duyệt qua FFmpeg WebAssembly.',
    subtitleMatrix: 'Chọn các tệp {INPUT} để chuyển đổi sang {OUTPUT} trực tiếp trên thiết bị của bạn.',
    dropzoneTextHome: 'Nhấp hoặc kéo thả video vào đây để chuyển đổi hàng loạt',
    dropzoneTextMatrix: 'Nhấp hoặc kéo thả tệp {INPUT} để chuyển đổi sang {OUTPUT}',
    noFilesChosen: 'Chưa chọn tệp nào',
    outputFormat: 'Định dạng đầu ra',
    audioQuality: 'Chất lượng âm thanh',
    extractAudio: 'Tách Âm Thanh',
    extractAudioCount: 'Tách Âm Thanh ({count} Tệp)',
    outputSummary: 'Đầu ra: {format} ({bitrate})',
    qualityStudio: 'Studio (320kbps)',
    qualityHigh: 'Cao (192kbps)',
    qualityStandard: 'Tiêu chuẩn (128kbps)',
    processingInitializing: 'Đang khởi tạo bộ chuyển đổi...',
    processingConverting: 'Đang chuyển đổi tệp {current} trên {total}:',
    processingPleaseWait: 'Vui lòng chờ, các tệp đang được xử lý cục bộ qua WebAssembly.',
    successTitle: 'Chuyển Đổi Thành Công!',
    successSubtitle: 'Đã chuyển đổi thành công {count} tệp mà không gửi bất kỳ dữ liệu nào lên máy chủ bên ngoài.',
    downloadTrack: 'Tải về',
    downloadAllZip: 'Tải về tất cả ({count} Bản nhạc - ZIP)',
    convertAnother: 'Chuyển đổi thêm tệp khác',
    reset: 'Đặt lại'
  },
  matrix: {
    breadcrumbHome: 'Trang chủ',
    breadcrumbConverters: 'Bộ chuyển đổi',
    heroTitle: 'Trình chuyển đổi hàng loạt {INPUT} sang {OUTPUT} nhanh nhất (Miễn phí Online)',
    heroSubtitle: 'Tách âm thanh {OUTPUT} chất lượng cao từ video {INPUT} trực tiếp trong trình duyệt mà không cần tải lên máy chủ.',
    pageMetaTitle: 'Chuyển đổi {INPUT} sang {OUTPUT} Trực tuyến Miễn phí (Tức thì) | VidToAudio',
    pageMetaDesc: 'Chuyển đổi {INPUT} sang {OUTPUT} trực tuyến miễn phí trực tiếp trong trình duyệt. Tách âm thanh tức thì không cần tải tệp lên, bảo mật tuyệt đối và không giới hạn dung lượng.',
    techSpecBadge: 'Thông số kỹ thuật & Hướng dẫn',
    techSpecSubtitle: 'Chuyển đổi âm thanh từ {INPUT} sang {OUTPUT}',
    howToExtractHeading: 'Cách tách âm thanh {OUTPUT} từ video {INPUT} trong trình duyệt',
    faqSectionTitle: 'Câu hỏi thường gặp: {INPUT} sang {OUTPUT}',
    faqSectionSubtitle: 'Chi tiết kỹ thuật về việc tách âm thanh {OUTPUT} từ video {INPUT}.',
    ratingHeading: 'Đánh giá từ người dùng',
    ratingSubheading: 'Đánh giá đã được xác minh cho công cụ WebAssembly {INPUT} sang {OUTPUT}.',
    ratingVerifiedUsers: 'Người dùng đã xác minh',
    ratingYourRating: 'Đánh giá của bạn:',
    ratingSubmitFeedback: 'Gửi đánh giá',
    ratingThankYou: 'Cảm ơn bạn đã gửi đánh giá!',
    allConvertersTitle: 'Khám phá tất cả 81 bộ chuyển đổi video sang âm thanh',
    allConvertersSubtitle: 'Mọi định dạng đều chạy 100% trong trình duyệt qua WebAssembly mà không cần tải lên máy chủ.',
    convertLabel: 'Chuyển đổi {INPUT} sang {OUTPUT}'
  },
  footer: {
    brandSubtitle: 'Tách âm thanh chuẩn studio trực tiếp trong trình duyệt. Không tải lên, riêng tư và miễn phí 100%.',
    privacyNotice: 'Mọi quá trình chuyển đổi đều diễn ra cục bộ trên CPU thiết bị của bạn.',
    rightsReserved: 'Đã đăng ký bản quyền.',
    privacyPolicy: 'Chính sách bảo mật',
    termsOfService: 'Điều khoản dịch vụ'
  }
});
