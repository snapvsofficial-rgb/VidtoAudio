/**
 * Interactive 5-Star Rating & Customer Review System for Matrix Pages
 * Features:
 * - Real Firestore persistence with live score calculation
 * - Mandatory Authentication (Users must sign in/up to submit reviews)
 * - Review Moderation Workflow (Submitted reviews are 'pending' until Admin approves)
 * - Strict Anti-Spam & Link Filtering
 * - Full Localization across EN, DE, ES, FR, IT
 * - Schema.org AggregateRating generation
 */
import { SupportedLanguage } from '../i18n';
import { getCachedAuth, onAuthUserChange } from '../services/authService';
import { 
  fetchReviewsForSlug, 
  submitUserReview, 
  validateReviewComment,
  ReviewStats,
  getDeterministicBaseStats 
} from '../services/reviewService';
import { openAuthModal } from './AuthModal';
import { UserReview } from '../types';

export function generateRatingSchema(inExt: string, outExt: string, stats: { averageScore: number; totalVotes: number }): object {
  const inUpper = inExt.toUpperCase();
  const outUpper = outExt.toUpperCase();

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `VidToAudio ${inUpper} to ${outUpper} Converter`,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "WebBrowser, Android, iOS, Windows, macOS",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": stats.averageScore.toFixed(1),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": stats.totalVotes.toString()
    }
  };
}

export async function renderRatingWidget(
  container: HTMLElement,
  slug: string,
  inExt: string,
  outExt: string,
  schemaScript?: HTMLScriptElement | null,
  lang: SupportedLanguage = 'en'
): Promise<void> {
  const inUpper = inExt.toUpperCase();
  const outUpper = outExt.toUpperCase();
  const cleanSlug = slug.toLowerCase().trim();

  const authState = getCachedAuth();
  let stats: ReviewStats = await fetchReviewsForSlug(cleanSlug, authState.user?.uid);

  if (schemaScript) {
    schemaScript.textContent = JSON.stringify(generateRatingSchema(inExt, outExt, stats));
  }

  // Selected star in local draft
  let selectedStar: number = stats.userReview?.rating || 5;
  let isSubmitting = false;

  const i18n = {
    en: {
      badge: "User Feedback & Rating",
      title: `Rate the ${inUpper} to ${outUpper} Converter`,
      desc: "Help other creators find the best online audio extractor. How was your conversion speed and quality?",
      verifiedReviews: `(${stats.totalVotes} verified ratings)`,
      yourRating: 'Your Star Rating:',
      reviewPlaceholder: 'Write a quick review about audio quality, speed, or format compatibility (min 8 chars, no links)...',
      charCount: 'characters',
      noLinksWarning: 'Note: Website links, URLs, and promotional text are strictly blocked.',
      signInToRateBtn: 'Sign In / Register to Rate & Review',
      submitBtn: 'Submit Review for Verification',
      submittingBtn: 'Submitting Review...',
      pendingNotice: '✓ Your review is submitted and waiting for admin verification. It will appear publicly once approved.',
      approvedNotice: '✓ Your review has been approved and is publicly visible.',
      rejectedNotice: '✕ Your previous review was not approved. You may submit an updated genuine review.',
      signedInAs: 'Signed in as',
      verifiedCreator: 'Verified User',
      customerReviewsTitle: 'User Reviews & Experiences',
      noReviewsYet: 'No verified reviews approved yet. Be the first to share your experience!',
      anonymousTime: 'Recently'
    },
    de: {
      badge: "Nutzerbewertungen & Feedback",
      title: `Bewerten Sie den ${inUpper}-zu-${outUpper}-Konverter`,
      desc: "Helfen Sie anderen Kreativen, den besten Audio-Extraktor zu finden. Wie zufrieden sind Sie mit Konvertierungsgeschwindigkeit und Audioqualität?",
      verifiedReviews: `(${stats.totalVotes} verifizierte Bewertungen)`,
      yourRating: 'Ihre Sterne-Bewertung:',
      reviewPlaceholder: 'Schreiben Sie eine kurze Bewertung zu Audioqualität, Geschwindigkeit oder Formatkompatibilität (min. 8 Zeichen, keine Links)...',
      charCount: 'Zeichen',
      noLinksWarning: 'Hinweis: Weblinks, URLs und Werbetexte sind strengstens untersagt.',
      signInToRateBtn: 'Anmelden / Registrieren zum Bewerten',
      submitBtn: 'Bewertung zur Prüfung einreichen',
      submittingBtn: 'Wird übermittelt...',
      pendingNotice: '✓ Ihre Bewertung wurde eingereicht und wartet auf Administrator-Freigabe. Sie wird nach Prüfung öffentlich sichtbar.',
      approvedNotice: '✓ Ihre Bewertung wurde genehmigt und ist öffentlich sichtbar.',
      rejectedNotice: '✕ Ihre vorherige Bewertung wurde abgelehnt. Sie können eine überarbeitete Bewertung einreichen.',
      signedInAs: 'Angemeldet als',
      verifiedCreator: 'Verifizierter Nutzer',
      customerReviewsTitle: 'Nutzerberichte & Erfahrungen',
      noReviewsYet: 'Noch keine genehmigten Bewertungen vorhanden. Seien Sie der Erste!',
      anonymousTime: 'Kürzlich'
    },
    es: {
      badge: "Opiniones y Valoración",
      title: `Valora el Convertidor de ${inUpper} a ${outUpper}`,
      desc: "¿Qué te ha parecido la velocidad y fidelidad de sonido? Ayuda a otros creadores a elegir la mejor herramienta.",
      verifiedReviews: `(${stats.totalVotes} valoraciones verificadas)`,
      yourRating: 'Tu Calificación en Estrellas:',
      reviewPlaceholder: 'Escribe una breve opinión sobre calidad, velocidad o compatibilidad (mín. 8 caracteres, sin enlaces)...',
      charCount: 'caracteres',
      noLinksWarning: 'Nota: Enlaces web, URLs y spam promocional están prohibidos.',
      signInToRateBtn: 'Inicia Sesión / Regístrate para Votar',
      submitBtn: 'Enviar Opinión para Verificación',
      submittingBtn: 'Enviando opinión...',
      pendingNotice: '✓ Tu opinión ha sido enviada y está pendiente de aprobación por el administrador.',
      approvedNotice: '✓ Tu opinión ha sido aprobada y es visible públicamente.',
      rejectedNotice: '✕ Tu opinión anterior fue rechazada. Puedes enviar una nueva versión.',
      signedInAs: 'Conectado como',
      verifiedCreator: 'Usuario Verificado',
      customerReviewsTitle: 'Opiniones de la Comunidad',
      noReviewsYet: 'Aún no hay opiniones aprobadas. ¡Sé el primero en compartir tu experiencia!',
      anonymousTime: 'Reciente'
    },
    fr: {
      badge: "Avis & Évaluations",
      title: `Évaluez le Convertisseur ${inUpper} vers ${outUpper}`,
      desc: "Comment jugez-vous la rapidité et la clarté sonore ? Aidez les créateurs à choisir le meilleur outil en ligne.",
      verifiedReviews: `(${stats.totalVotes} avis vérifiés)`,
      yourRating: 'Votre Note en Étoiles :',
      reviewPlaceholder: 'Partagez votre avis sur la fidélité, vitesse ou compatibilité (min. 8 car., aucun lien)...',
      charCount: 'caractères',
      noLinksWarning: 'Remarque : Les liens web et adresses URL sont strictement interdits.',
      signInToRateBtn: 'Se connecter / S’inscrire pour Noter',
      submitBtn: 'Soumettre l’Avis pour Vérification',
      submittingBtn: 'Envoi en cours...',
      pendingNotice: '✓ Votre avis est soumis et en attente de modération. Il apparaîtra dès approbation.',
      approvedNotice: '✓ Votre avis est validé et visible publiquement.',
      rejectedNotice: '✕ Votre avis précédent n’a pas été validé. Vous pouvez soumettre un avis mis à jour.',
      signedInAs: 'Connecté en tant que',
      verifiedCreator: 'Utilisateur Vérifié',
      customerReviewsTitle: 'Avis des Utilisateurs',
      noReviewsYet: 'Aucun avis validé pour l’instant. Soyez le premier à donner votre avis !',
      anonymousTime: 'Récemment'
    },
    it: {
      badge: "Recensioni e Valutazioni",
      title: `Valuta il Convertitore da ${inUpper} a ${outUpper}`,
      desc: "Aiuta altri utenti a scegliere il miglior strumento audio online. Come valuti velocità di conversione e qualità sonora?",
      verifiedReviews: `(${stats.totalVotes} recensioni verificate)`,
      yourRating: 'La tua Valutazione in Stelle:',
      reviewPlaceholder: 'Scrivi una recensione su qualità audio, velocità o compatibilità (min 8 caratteri, nessun link)...',
      charCount: 'caratteri',
      noLinksWarning: 'Nota: Link a siti web, URL e testi promozionali sono vietati.',
      signInToRateBtn: 'Accedi / Registrati per Valutare',
      submitBtn: 'Invia Recensione per Moderazione',
      submittingBtn: 'Invio in corso...',
      pendingNotice: '✓ La tua recensione è stata inviata ed è in attesa di approvazione da parte dell’amministratore.',
      approvedNotice: '✓ La tua recensione è stata approvata ed è visibile a tutti.',
      rejectedNotice: '✕ La tua recensione precedente non è stata approvata. Puoi inviarne una nuova.',
      signedInAs: 'Autenticato come',
      verifiedCreator: 'Utente Verificato',
      customerReviewsTitle: 'Esperienze e Recensioni',
      noReviewsYet: 'Ancora nessuna recensione approvata. Sii il primo a condividere la tua opinione!',
      anonymousTime: 'Di recente'
    }
  }[lang] || {
    badge: "User Feedback & Rating",
    title: `Rate the ${inUpper} to ${outUpper} Converter`,
    desc: "Help other creators find the best online audio extractor. How was your conversion speed and quality?",
    verifiedReviews: `(${stats.totalVotes} verified ratings)`,
    yourRating: 'Your Star Rating:',
    reviewPlaceholder: 'Write a quick review about audio quality, speed, or format compatibility (min 8 chars, no links)...',
    charCount: 'characters',
    noLinksWarning: 'Note: Website links, URLs, and promotional text are strictly blocked.',
    signInToRateBtn: 'Sign In / Register to Rate & Review',
    submitBtn: 'Submit Review for Verification',
    submittingBtn: 'Submitting Review...',
    pendingNotice: '✓ Your review is submitted and waiting for admin verification. It will appear publicly once approved.',
    approvedNotice: '✓ Your review has been approved and is publicly visible.',
    rejectedNotice: '✕ Your previous review was not approved. You may submit an updated genuine review.',
    signedInAs: 'Signed in as',
    verifiedCreator: 'Verified User',
    customerReviewsTitle: 'User Reviews & Experiences',
    noReviewsYet: 'No verified reviews approved yet. Be the first to share your experience!',
    anonymousTime: 'Recently'
  };

  const render = () => {
    const currentAuth = getCachedAuth();
    const isLoggedIn = Boolean(currentAuth.user);
    const existingReview = stats.userReview;

    container.innerHTML = `
      <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-700/80">
        
        <!-- Top Section: Header & Live Score -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div class="text-center md:text-left flex-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-950 text-brand-400 border border-brand-800/60 mb-2.5">
              <svg class="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span>${i18n.badge}</span>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-white mb-1.5">
              ${i18n.title}
            </h3>
            <p class="text-slate-400 text-sm max-w-md">
              ${i18n.desc}
            </p>
          </div>

          <!-- Live Score Badge -->
          <div class="flex flex-col items-center justify-center bg-dark-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 min-w-[200px] text-center shadow-inner">
            <div class="flex items-baseline gap-1.5">
              <span class="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">${stats.averageScore.toFixed(1)}</span>
              <span class="text-slate-500 text-sm font-semibold">/ 5.0</span>
            </div>
            <div class="flex text-amber-400 my-1.5">
              ${[1, 2, 3, 4, 5].map(starNum => `
                <svg class="w-4 h-4 fill-current ${starNum <= Math.round(stats.averageScore) ? 'text-amber-400' : 'text-slate-700'}" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              `).join('')}
            </div>
            <span class="text-xs text-slate-400 font-medium">${i18n.verifiedReviews}</span>
          </div>
        </div>

        <!-- Middle Section: Review Submission Form -->
        <div class="pt-6 pb-6 border-b border-slate-800/80">
          ${existingReview ? `
            <!-- User Status Notice for Existing Submission -->
            <div class="mb-5 p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              existingReview.status === 'approved' 
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' 
                : (existingReview.status === 'rejected'
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-300')
            }">
              <div class="flex items-center gap-2">
                <span class="text-sm">
                  ${existingReview.status === 'approved' ? '✓' : (existingReview.status === 'rejected' ? '✕' : '⏳')}
                </span>
                <span>
                  ${existingReview.status === 'approved' 
                    ? i18n.approvedNotice 
                    : (existingReview.status === 'rejected' ? i18n.rejectedNotice : i18n.pendingNotice)}
                </span>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase bg-dark-900 border border-current font-bold">
                ${existingReview.status}
              </span>
            </div>
          ` : ''}

          <div class="flex flex-col gap-4">
            <!-- Star Rating Selection -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-300">
                ${i18n.yourRating}
              </span>

              <div id="rating-star-selector" class="flex items-center gap-1">
                ${[1, 2, 3, 4, 5].map(starNum => {
                  const isActive = starNum <= selectedStar;
                  return `
                    <button 
                      type="button" 
                      data-rating-val="${starNum}"
                      aria-label="Rate ${starNum} stars"
                      class="rating-star-btn p-1.5 rounded-lg transition-transform hover:scale-110 active:scale-95 focus:outline-none ${isActive ? 'text-amber-400' : 'text-slate-600 hover:text-amber-300'}"
                    >
                      <svg class="w-7 h-7 sm:w-8 sm:h-8 transition-colors ${isActive ? 'fill-amber-400' : 'fill-none stroke-current stroke-2'}" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </button>
                  `;
                }).join('')}
                <span class="ml-2 font-mono text-sm font-bold text-amber-400">${selectedStar}/5</span>
              </div>
            </div>

            <!-- Review Input Form (Authenticated vs Unauthenticated) -->
            ${!isLoggedIn ? `
              <div class="bg-dark-950/70 border border-slate-800 rounded-2xl p-6 text-center mt-2">
                <div class="w-10 h-10 rounded-full bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <h4 class="text-sm font-bold text-white mb-1">Authentication Required to Submit Review</h4>
                <p class="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  To ensure genuine community ratings and prevent spam, users must sign in before submitting ratings and reviews.
                </p>
                <button 
                  id="rating-signin-prompt-btn" 
                  type="button" 
                  class="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-brand-500/20"
                >
                  ${i18n.signInToRateBtn}
                </button>
              </div>
            ` : `
              <div class="flex flex-col gap-3 mt-1">
                <div class="flex items-center justify-between text-xs text-slate-400">
                  <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    ${i18n.signedInAs} <strong class="text-slate-200 font-medium">${currentAuth.profile?.displayName || currentAuth.user?.email}</strong>
                  </span>
                  <span id="char-counter" class="font-mono text-[11px] text-slate-500">0 / 500 ${i18n.charCount}</span>
                </div>

                <div class="relative">
                  <textarea 
                    id="review-comment-input" 
                    rows="3" 
                    maxlength="500"
                    placeholder="${i18n.reviewPlaceholder}"
                    class="w-full bg-dark-950 border border-slate-700/80 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
                  >${existingReview?.comment || ''}</textarea>
                </div>

                <!-- Anti-spam note & error alert -->
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <svg class="w-3.5 h-3.5 text-amber-500/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <span>${i18n.noLinksWarning}</span>
                  </div>
                  <div id="review-error-banner" class="hidden p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs"></div>
                  <div id="review-success-banner" class="hidden p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs"></div>
                </div>

                <div class="flex justify-end pt-1">
                  <button 
                    id="submit-review-btn" 
                    type="button" 
                    ${isSubmitting ? 'disabled' : ''}
                    class="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
                  >
                    ${isSubmitting ? `
                      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      <span>${i18n.submittingBtn}</span>
                    ` : `
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      <span>${i18n.submitBtn}</span>
                    `}
                  </button>
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- Bottom Section: Customer Reviews List -->
        <div class="pt-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
              <span>${i18n.customerReviewsTitle}</span>
            </h4>
            <span class="text-xs text-slate-500 font-mono">${stats.approvedReviews.length} approved</span>
          </div>

          ${stats.approvedReviews.length === 0 ? `
            <div class="p-6 rounded-xl bg-dark-950/40 border border-slate-800 text-center text-xs text-slate-500">
              <p>${i18n.noReviewsYet}</p>
            </div>
          ` : `
            <div class="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              ${stats.approvedReviews.map(r => {
                const initial = (r.userName || 'U').charAt(0).toUpperCase();
                return `
                  <div class="bg-dark-950/60 border border-slate-800/90 rounded-xl p-3.5 sm:p-4 text-left transition-colors hover:border-slate-700/80">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-teal-400 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                          ${initial}
                        </div>
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold text-white">${r.userName || 'Verified Creator'}</span>
                            <span class="text-[10px] bg-emerald-950 border border-emerald-800/80 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                              ✓ ${i18n.verifiedCreator}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div class="flex text-amber-400">
                        ${[1, 2, 3, 4, 5].map(s => `
                          <svg class="w-3.5 h-3.5 fill-current ${s <= r.rating ? 'text-amber-400' : 'text-slate-700'}" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        `).join('')}
                      </div>
                    </div>

                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      ${r.comment}
                    </p>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

      </div>
    `;

    // Bind Star Selector Buttons
    container.querySelectorAll<HTMLButtonElement>('.rating-star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-rating-val') || '5', 10);
        selectedStar = val;
        render();
      });
    });

    // Bind Sign In Prompt Button
    const signInPromptBtn = container.querySelector('#rating-signin-prompt-btn');
    signInPromptBtn?.addEventListener('click', () => {
      openAuthModal('signin', async () => {
        const updatedAuth = getCachedAuth();
        stats = await fetchReviewsForSlug(cleanSlug, updatedAuth.user?.uid);
        render();
      });
    });

    // Character Counter
    const commentInput = container.querySelector('#review-comment-input') as HTMLTextAreaElement | null;
    const charCounter = container.querySelector('#char-counter');
    if (commentInput && charCounter) {
      charCounter.textContent = `${commentInput.value.length} / 500 ${i18n.charCount}`;
      commentInput.addEventListener('input', () => {
        charCounter.textContent = `${commentInput.value.length} / 500 ${i18n.charCount}`;
      });
    }

    // Submit Review Handler
    const submitBtn = container.querySelector('#submit-review-btn') as HTMLButtonElement | null;
    const errorBanner = container.querySelector('#review-error-banner');
    const successBanner = container.querySelector('#review-success-banner');

    submitBtn?.addEventListener('click', async () => {
      const commentText = commentInput?.value || '';

      // Client-side anti-spam check
      const validation = validateReviewComment(commentText);
      if (!validation.isValid) {
        if (errorBanner) {
          errorBanner.textContent = validation.error || 'Invalid review text.';
          errorBanner.classList.remove('hidden');
        }
        if (successBanner) successBanner.classList.add('hidden');
        return;
      }

      isSubmitting = true;
      if (errorBanner) errorBanner.classList.add('hidden');
      render();

      try {
        const res = await submitUserReview(cleanSlug, inExt, outExt, selectedStar, commentText);
        stats.userReview = res.review;
        isSubmitting = false;
        render();

        const updatedSuccess = container.querySelector('#review-success-banner');
        if (updatedSuccess) {
          updatedSuccess.textContent = res.message;
          updatedSuccess.classList.remove('hidden');
        }
      } catch (err: any) {
        isSubmitting = false;
        render();
        const updatedError = container.querySelector('#review-error-banner');
        if (updatedError) {
          updatedError.textContent = err?.message || 'Failed to submit review.';
          updatedError.classList.remove('hidden');
        }
      }
    });
  };

  render();

  // Subscribe to auth state updates so the widget automatically reflects login/logout
  onAuthUserChange(async (user) => {
    stats = await fetchReviewsForSlug(cleanSlug, user?.uid);
    render();
  });
}
