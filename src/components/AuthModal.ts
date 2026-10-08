import { 
  signInUser, 
  signUpUser, 
  signInWithGoogle, 
  resetUserPassword 
} from '../services/authService';

type ModalMode = 'signin' | 'signup' | 'forgot';

let modalContainer: HTMLElement | null = null;
let currentMode: ModalMode = 'signin';
let activeOnSuccess: (() => void) | null = null;

export function openAuthModal(mode: ModalMode = 'signin', onSuccess?: () => void) {
  currentMode = mode;
  activeOnSuccess = onSuccess || null;

  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'auth-modal-root';
    document.body.appendChild(modalContainer);
  }

  renderModalContent();
  modalContainer.classList.remove('hidden');
}

export function closeAuthModal() {
  if (modalContainer) {
    modalContainer.classList.add('hidden');
    modalContainer.innerHTML = '';
  }
}

function renderModalContent() {
  if (!modalContainer) return;

  const isSignIn = currentMode === 'signin';
  const isSignUp = currentMode === 'signup';
  const isForgot = currentMode === 'forgot';

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div id="auth-modal-card" class="relative w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
        
        <!-- Close Button -->
        <button id="auth-modal-close" type="button" class="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-dark-800 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <!-- Brand Icon & Header -->
        <div class="text-center mb-6">
          <div class="w-12 h-12 rounded-2xl bg-brand-950 border border-brand-800/60 flex items-center justify-center text-brand-400 mx-auto mb-3 shadow-lg shadow-brand-500/10">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">
            ${isSignIn ? 'Sign In to VidToAudio' : (isSignUp ? 'Create an Account' : 'Reset Password')}
          </h2>
          <p class="text-slate-400 text-xs sm:text-sm mt-1">
            ${isSignIn ? 'Sign in to submit verified ratings and audio reviews.' : (isSignUp ? 'Join our creator community to review converters and access features.' : 'Enter your email to receive a password reset link.')}
          </p>
        </div>

        <!-- Feedback Alert Banner -->
        <div id="auth-modal-error" class="hidden mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2"></div>
        <div id="auth-modal-success" class="hidden mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2"></div>

        <!-- Google OAuth Button -->
        ${!isForgot ? `
          <button id="auth-google-btn" type="button" class="w-full mb-4 py-2.5 px-4 bg-dark-800 hover:bg-dark-700 border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm">
            <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"/><path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/></svg>
            <span>Continue with Google</span>
          </button>

          <div class="relative flex items-center justify-center mb-5">
            <div class="w-full border-t border-slate-800"></div>
            <span class="bg-dark-900 px-3 text-[11px] text-slate-500 uppercase tracking-widest font-mono">Or continue with email</span>
          </div>
        ` : ''}

        <!-- Auth Form -->
        <form id="auth-form" class="space-y-4">
          ${isSignUp ? `
            <div>
              <label for="auth-name" class="block text-xs font-medium text-slate-400 mb-1.5">Your Name or Nickname</label>
              <input 
                type="text" 
                id="auth-name" 
                required 
                placeholder="e.g. Alex Video Creator" 
                class="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          ` : ''}

          <div>
            <label for="auth-email" class="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
            <input 
              type="email" 
              id="auth-email" 
              required 
              placeholder="name@example.com" 
              class="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          ${!isForgot ? `
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="auth-password" class="block text-xs font-medium text-slate-400">Password</label>
                ${isSignIn ? `
                  <button type="button" id="auth-switch-forgot" class="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                    Forgot password?
                  </button>
                ` : ''}
              </div>
              <input 
                type="password" 
                id="auth-password" 
                required 
                minlength="6"
                placeholder="••••••••" 
                class="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          ` : ''}

          <button 
            type="submit" 
            id="auth-submit-btn" 
            class="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <span id="auth-submit-text">${isSignIn ? 'Sign In' : (isSignUp ? 'Create Account' : 'Send Reset Link')}</span>
          </button>
        </form>

        <!-- Mode Switch Footers -->
        <div class="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          ${isSignIn ? `
            Don't have an account? 
            <button type="button" id="auth-switch-signup" class="text-brand-400 hover:text-brand-300 font-semibold ml-1">Sign Up</button>
          ` : (isSignUp ? `
            Already have an account? 
            <button type="button" id="auth-switch-signin" class="text-brand-400 hover:text-brand-300 font-semibold ml-1">Sign In</button>
          ` : `
            Remember your password? 
            <button type="button" id="auth-switch-signin-2" class="text-brand-400 hover:text-brand-300 font-semibold ml-1">Back to Sign In</button>
          `)}
        </div>

      </div>
    </div>
  `;

  // Bind Event Listeners
  const closeBtn = document.getElementById('auth-modal-close');
  closeBtn?.addEventListener('click', closeAuthModal);

  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer?.firstElementChild) {
      closeAuthModal();
    }
  });

  document.getElementById('auth-switch-signup')?.addEventListener('click', () => {
    currentMode = 'signup';
    renderModalContent();
  });

  document.getElementById('auth-switch-signin')?.addEventListener('click', () => {
    currentMode = 'signin';
    renderModalContent();
  });

  document.getElementById('auth-switch-signin-2')?.addEventListener('click', () => {
    currentMode = 'signin';
    renderModalContent();
  });

  document.getElementById('auth-switch-forgot')?.addEventListener('click', () => {
    currentMode = 'forgot';
    renderModalContent();
  });

  const errorBanner = document.getElementById('auth-modal-error');
  const successBanner = document.getElementById('auth-modal-success');
  const submitBtn = document.getElementById('auth-submit-btn') as HTMLButtonElement | null;
  const submitText = document.getElementById('auth-submit-text');

  const showError = (msg: string) => {
    if (errorBanner) {
      errorBanner.textContent = msg;
      errorBanner.classList.remove('hidden');
    }
    if (successBanner) successBanner.classList.add('hidden');
  };

  const showSuccess = (msg: string) => {
    if (successBanner) {
      successBanner.textContent = msg;
      successBanner.classList.remove('hidden');
    }
    if (errorBanner) errorBanner.classList.add('hidden');
  };

  // Google OAuth handler
  document.getElementById('auth-google-btn')?.addEventListener('click', async () => {
    try {
      showError('');
      if (errorBanner) errorBanner.classList.add('hidden');
      const emailInput = document.getElementById('auth-email') as HTMLInputElement | null;
      const emailVal = emailInput?.value?.trim() || '';
      await signInWithGoogle(emailVal);
      closeAuthModal();
      if (activeOnSuccess) activeOnSuccess();
    } catch (err: any) {
      showError(err?.message || 'Google sign in failed.');
    }
  });

  // Form submit handler
  document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('auth-email') as HTMLInputElement | null;
    const passInput = document.getElementById('auth-password') as HTMLInputElement | null;
    const nameInput = document.getElementById('auth-name') as HTMLInputElement | null;

    const email = emailInput?.value || '';
    const pass = passInput?.value || '';
    const name = nameInput?.value || '';

    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Processing...';

    try {
      if (currentMode === 'signin') {
        await signInUser(email, pass);
        closeAuthModal();
        if (activeOnSuccess) activeOnSuccess();
      } else if (currentMode === 'signup') {
        await signUpUser(email, pass, name);
        closeAuthModal();
        if (activeOnSuccess) activeOnSuccess();
      } else if (currentMode === 'forgot') {
        await resetUserPassword(email);
        showSuccess('Password reset link sent to your email.');
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Send Reset Link';
      }
    } catch (err: any) {
      showError(err?.message || 'Authentication failed. Please check your credentials.');
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) {
        submitText.textContent = isSignIn ? 'Sign In' : (isSignUp ? 'Create Account' : 'Send Reset Link');
      }
    }
  });
}
