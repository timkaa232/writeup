const SUPABASE_URL = 'https://tufzwbvrxfrvythibsma.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ipw4c_9SdJBwxZCMaz7OtQ_KiG7AIuS';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Модалка соглашения
document.addEventListener('click', function(e) {
    if (e.target.id === 'show-agreement-btn') {
        e.preventDefault();
        document.getElementById('agreement-modal').classList.add('active');
    }
    if (e.target.id === 'close-agreement-btn' || e.target.id === 'accept-agreement-btn') {
        document.getElementById('agreement-modal').classList.remove('active');
    }
});

// Регистрация
const regForm = document.getElementById('register-form');
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.textContent = 'Регистрация...'; btn.disabled = true;
        const { error } = await supabaseClient.auth.signUp({
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            options: { data: {
                first_name: document.getElementById('reg-first-name').value,
                last_name: document.getElementById('reg-last-name').value,
                gender: document.getElementById('reg-gender').value,
                birth_year: document.getElementById('reg-birth-year').value,
                english_level: document.getElementById('reg-english-level').value,
                goal: document.getElementById('reg-goal').value
            }}
        });
        if (error) {
            document.getElementById('reg-error').textContent = error.message;
            btn.textContent = 'Зарегистрироваться'; btn.disabled = false;
        } else {
            alert('Регистрация успешна! Сейчас вас перенаправит.');
            window.location.href = 'index.html';
        }
    });
}

// Вход
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.textContent = 'Вход...'; btn.disabled = true;
        const { error } = await supabaseClient.auth.signInWithPassword({
            email: document.getElementById('login-email').value,
            password: document.getElementById('login-password').value
        });
        if (error) {
            document.getElementById('login-error').textContent = 'Неверный email или пароль.';
            btn.textContent = 'Войти'; btn.disabled = false;
        } else {
            window.location.href = 'index.html';
        }
    });
}