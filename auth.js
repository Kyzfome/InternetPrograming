(function() {
    'use strict';

    var AUTH_KEY = 'gustese_user';

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(AUTH_KEY));
        } catch (e) {
            return null;
        }
    }

    function setCurrentUser(user) {
        if (user) {
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(AUTH_KEY);
        }
    }

    function openAuthModal() {
        var modal = document.getElementById('authModal');
        var overlay = document.getElementById('modalOverlay');
        if (modal) modal.classList.add('is-open');
        if (overlay) overlay.classList.add('is-open');
    }

    function closeAuthModal() {
        var modal = document.getElementById('authModal');
        var overlay = document.getElementById('modalOverlay');
        if (modal) modal.classList.remove('is-open');
        if (overlay) overlay.classList.remove('is-open');
    }

    function updateAuthUI() {
        var authBlock = document.getElementById('authBlock');
        var authButtons = document.getElementById('authButtons');
        var userName = document.getElementById('userName');
        var user = getCurrentUser();

        if (authBlock && authButtons && userName) {
            if (user) {
                userName.textContent = user.firstName + ' ' + user.lastName;
                authBlock.classList.remove('hidden');
                authButtons.classList.add('hidden');
            } else {
                authBlock.classList.add('hidden');
                authButtons.classList.remove('hidden');
            }
        }
    }

    function initAuth() {
        updateAuthUI();

        var btnLogout = document.getElementById('btnLogout');
        var btnLogin = document.getElementById('btnLogin');
        var btnRegister = document.getElementById('btnRegister');
        var modalClose = document.getElementById('modalClose');
        var modalOverlay = document.getElementById('modalOverlay');
        var loginForm = document.getElementById('loginForm');
        var registerForm = document.getElementById('registerForm');

        if (btnLogout) {
            btnLogout.addEventListener('click', function() {
                setCurrentUser(null);
                updateAuthUI();
                var contactActions = document.getElementById('contactActions');
                if (contactActions) contactActions.style.display = 'none';
                window.dispatchEvent(new CustomEvent('auth:logout'));
            });
        }

        if (btnLogin) btnLogin.addEventListener('click', openAuthModal);
        if (btnRegister) btnRegister.addEventListener('click', openAuthModal);
        if (modalClose) modalClose.addEventListener('click', closeAuthModal);
        if (modalOverlay) modalOverlay.addEventListener('click', closeAuthModal);

        document.querySelectorAll('.modal-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.modal-tab').forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                var which = this.getAttribute('data-tab');
                if (loginForm) loginForm.style.display = which === 'login' ? 'block' : 'none';
                if (registerForm) registerForm.style.display = which === 'register' ? 'block' : 'none';
            });
        });

        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var users = JSON.parse(localStorage.getItem('gustese_users') || '[]');
                var email = this.querySelector('[name="email"]').value;
                var user = users.find(function(u) { return u.email === email; });
                if (user) {
                    setCurrentUser(user);
                    closeAuthModal();
                    location.reload();
                } else {
                    alert('Користувача з таким email не знайдено. Зареєструйтесь.');
                }
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var users = JSON.parse(localStorage.getItem('gustese_users') || '[]');
                var formData = new FormData(this);
                var newUser = {
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email')
                };
                if (users.some(function(u) { return u.email === newUser.email; })) {
                    alert('Користувач з таким email вже існує');
                    return;
                }
                users.push(newUser);
                localStorage.setItem('gustese_users', JSON.stringify(users));
                setCurrentUser(newUser);
                closeAuthModal();
                location.reload();
            });
        }
    }

    document.addEventListener('DOMContentLoaded', initAuth);
})();
