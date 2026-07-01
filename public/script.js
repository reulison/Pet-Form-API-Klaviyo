// ── Smooth scroll ──────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ── Multi-pet form management ──────────────────────────────────────────────────
const petsContainer = document.getElementById('pets-container');
const numPetsSelect = document.getElementById('numero_pets');

function calcAge(dateStr) {
    if (!dateStr) return null;
    const dob   = new Date(dateStr);
    const today = new Date();
    if (isNaN(dob)) return null;
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return Math.max(0, age);
}

function petLabel(index) {
    return index === 0 ? 'Primeiro Pet' : `${index + 1}º Pet`;
}

function buildPetBlock(index, saved) {
    saved = saved || {};
    const nome          = saved.nome          || '';
    const birthday      = saved.birthday      || '';
    const porte         = saved.porte         || '';
    const condicao      = saved.condicao_saude|| '';
    const motivo        = saved.motivo        || '';
    const primeiraVez   = saved.primeira_vez  || false;

    const porteOptions = [
        ['', 'Selecione o porte'],
        ['Mini (até 5kg)',    'Mini (até 5kg)'],
        ['Pequeno (5–10kg)', 'Pequeno (5–10kg)'],
        ['Médio (10–25kg)',   'Médio (10–25kg)'],
        ['Grande (25–45kg)',  'Grande (25–45kg)'],
        ['Gigante (acima de 45kg)', 'Gigante (acima de 45kg)'],
    ].map(([v, l]) => `<option value="${v}" ${porte === v ? 'selected' : ''}>${l}</option>`).join('');

    const condicaoOptions = [
        ['', 'Selecione a condição'],
        ['artrite',           'Artrite / Artrose'],
        ['displasia',         'Displasia coxofemoral'],
        ['dor_articular',     'Dor articular'],
        ['cirurgia_ortopedica','Pós-cirurgia ortopédica'],
        ['prevencao',         'Prevenção (pet saudável)'],
        ['outro',             'Outro'],
    ].map(([v, l]) => `<option value="${v}" ${condicao === v ? 'selected' : ''}>${l}</option>`).join('');

    return `
    <div class="pet-block" data-pet="${index}">
        <div class="pet-block-header">
            <span class="pet-block-icon">🐾</span>
            <span class="pet-block-label">${petLabel(index)}</span>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Nome do pet <span class="required">*</span></label>
                <input type="text" name="pets[${index}][nome]" placeholder="Ex: Thor"
                       value="${escHtml(nome)}" required>
            </div>
            <div class="form-group">
                <label>Data de nascimento <span class="required">*</span></label>
                <input type="date" name="pets[${index}][birthday]"
                       value="${escHtml(birthday)}" class="birthday-input" data-index="${index}" required>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Porte do pet <span class="required">*</span></label>
                <select name="pets[${index}][porte]" required>${porteOptions}</select>
            </div>
            <div class="form-group">
                <label>Idade calculada</label>
                <div class="age-badge" id="age-badge-${index}">
                    ${birthday ? calcAge(birthday) + ' ano(s)' : '— preencha a data'}
                </div>
            </div>
        </div>

        <div class="form-group full-width">
            <label>Condição de saúde atual <span class="required">*</span></label>
            <select name="pets[${index}][condicao_saude]" required>${condicaoOptions}</select>
        </div>

        <div class="form-group full-width">
            <label>Por que você quer experimentar Condropure? <span class="required">*</span></label>
            <textarea name="pets[${index}][motivo]" rows="3"
                      placeholder="Conte-nos sobre este pet e o que espera do produto..."
                      required>${escHtml(motivo)}</textarea>
        </div>

        <div class="form-group full-width">
            <label class="checkbox-label">
                <input type="checkbox" name="pets[${index}][primeira_vez_condropure]" value="1"
                       ${primeiraVez ? 'checked' : ''}>
                <span class="checkbox-custom"></span>
                <span>Esta é a primeira vez que uso Condropure para este pet</span>
            </label>
        </div>
    </div>`;
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderPets(count, savedPets) {
    if (!petsContainer) return;
    petsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        petsContainer.insertAdjacentHTML('beforeend', buildPetBlock(i, (savedPets || [])[i]));
    }
    // Bind birthday → age badge
    petsContainer.querySelectorAll('.birthday-input').forEach(input => {
        input.addEventListener('change', function () {
            const idx  = this.dataset.index;
            const badge = document.getElementById('age-badge-' + idx);
            if (badge) {
                const age = calcAge(this.value);
                badge.textContent = age !== null ? age + ' ano(s)' : '— data inválida';
            }
        });
    });
}

if (numPetsSelect && petsContainer) {
    // Read any previously-submitted pet data from server-injected JSON
    const savedPets = window.__SAVED_PETS__ || [];
    renderPets(parseInt(numPetsSelect.value) || 1, savedPets);

    numPetsSelect.addEventListener('change', function () {
        renderPets(parseInt(this.value) || 1, []);
    });
}

// ── Form loading state ─────────────────────────────────────────────────────────
const form      = document.querySelector('.pet-form');
const submitBtn = document.querySelector('.btn-submit');
if (form && submitBtn) {
    form.addEventListener('submit', function () {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Enviando...</span>';
        submitBtn.style.opacity = '0.75';
    });
}

// ── Scroll-in animation ────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll('.reason-card, .testimonial-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});
