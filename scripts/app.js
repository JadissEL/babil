/* scripts/app.js */
let countries = [];
let comments = JSON.parse(localStorage.getItem('visa_comments')) || {};

const API_URL = 'http://localhost:3000/api';

async function init() {
    const mainContainer = document.querySelector('main');
    const originalContent = mainContainer.innerHTML;
    mainContainer.innerHTML = '<div style="display: flex; justify-content: center; padding: 100px;"><div class="loader">Initialisation du Global Mobility System...</div></div>';

    try {
        const response = await fetch(`${API_URL}/countries`);
        const data = await response.json();
        // The API returns an array of objects where full_data is the original JSON
        countries = data.map(c => ({
            ...c.full_data,
            id: c.id // Keep the database ID
        }));
        
        mainContainer.innerHTML = originalContent;
        
        // Initial Renders
        renderExplorer();
        renderSchengenDashboard();
        renderProbabilityEngine();
        renderVisaFree();
        renderBusiness();
        renderStreetFood();
        renderCBI();
        renderMoroccoReality();
        
        // Event Listeners
        document.getElementById('profile-form')?.addEventListener('change', () => {
            renderExplorer();
            renderSchengenDashboard();
            renderProbabilityEngine();
        });

        document.getElementById('global-search')?.addEventListener('input', renderExplorer);
        document.getElementById('filter-region')?.addEventListener('change', renderExplorer);
        document.getElementById('filter-goal')?.addEventListener('change', renderExplorer);

        document.getElementById('comment-form')?.addEventListener('submit', handleCommentSubmit);
        
    } catch (error) {
        console.error("Erreur:", error);
    }
}

// 🧭 Navigation
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');

    if (tabId === 'admin') renderAdmin();
}

// 1. Global Explorer Engine
async function renderExplorer() {
    const grid = document.getElementById('explorer-grid');
    const aiWidget = document.getElementById('ai-reco-widget');
    if (!grid || !aiWidget) return;

    // Filters
    const search = document.getElementById('global-search').value.toLowerCase();
    const region = document.getElementById('filter-region').value;
    const goal = document.getElementById('filter-goal').value;

    // Profile Data
    const status = document.getElementById('status').value;
    const savings = parseInt(document.getElementById('savings').value) || 0;
    const history = document.getElementById('history').value;
    const family = document.getElementById('family').value;

    const filtered = countries.filter(c => {
        const matchesSearch = c.country.toLowerCase().includes(search);
        const matchesRegion = region === 'all' || c.region === region;
        const matchesGoal = goal === 'all' || 
            (goal === 'tourism' && c.visa_system.tourism) ||
            (goal === 'work' && c.visa_system.work.availability !== 'Low') ||
            (goal === 'business' && c.visa_system.business.rights !== 'None') ||
            (goal === 'education' && c.education_mobility);
        return matchesSearch && matchesRegion && matchesGoal;
    });

    const data = filtered.map(c => {
        let pScore = c.brutal_reality_score;
        if (savings < 40000) pScore -= 2;
        if (status === 'freelance') pScore -= 3;
        if (history === 'schengen') pScore += 2.5;
        return { ...c, personal_score: Math.min(10, Math.max(0, parseFloat(pScore.toFixed(1)))) };
    }).sort((a, b) => b.personal_score - a.personal_score);

    // AI Reco Update via API
    try {
        const recoResponse = await fetch(`${API_URL}/recommendation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                profile: { status, savings, history, family, goal }
            })
        });
        const recommendations = await recoResponse.json();

        if (recommendations.length >= 2) {
            aiWidget.innerHTML = `
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid var(--success);">
                    <div style="font-size: 0.7rem; font-weight: 800; color: var(--success); text-transform: uppercase;">Top Recommandation (AI)</div>
                    <h4 style="font-size: 1.5rem; margin-top: 8px;">${recommendations[0].name}</h4>
                    <p style="font-size: 0.9rem; opacity: 0.8;">${recommendations[0].reason}</p>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid var(--accent);">
                    <div style="font-size: 0.7rem; font-weight: 800; color: var(--accent); text-transform: uppercase;">Alternative</div>
                    <h4 style="font-size: 1.5rem; margin-top: 8px;">${recommendations[1].name}</h4>
                    <p style="font-size: 0.9rem; opacity: 0.8;">${recommendations[1].reason}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Reco Error:", error);
    }

    grid.innerHTML = data.map(c => `
        <div class="section-card" onclick="showCountryDetails('${c.country}')" style="cursor: pointer; border-top: 4px solid ${getScoreColor(c.personal_score)};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="font-size: 1.25rem;">${c.country}</h4>
                <span class="badge" style="background: var(--accent-soft); color: var(--accent);">${c.region}</span>
            </div>
            <div style="font-size: 2rem; font-weight: 800; color: ${getScoreColor(c.personal_score)}">${c.personal_score}<small style="font-size: 1rem; opacity: 0.5;">/10</small></div>
            <p style="font-size: 0.85rem; color: var(--text-light); margin-top: 12px;">${c.morocco_insights.reality}</p>
        </div>
    `).join('');
}

// 2. Schengen Dashboard Engine
function renderSchengenDashboard() {
    const tbody = document.getElementById('schengen-body');
    if (!tbody) return;

    const status = document.getElementById('status').value;
    const history = document.getElementById('history').value;

    const schengenData = countries.filter(c => c.region === 'Schengen').map(c => {
        let prob = parseInt(c.acceptance_rate_morocco);
        if (status === 'public') prob += 10;
        if (history === 'schengen') prob += 15;
        return { ...c, adjusted_prob: Math.min(100, prob) };
    });

    tbody.innerHTML = schengenData.map(c => `
        <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 16px;"><strong>${c.country}</strong></td>
            <td style="padding: 16px;">
                <div style="font-size: 0.9rem; font-weight: 700;">${c.adjusted_prob}%</div>
                <div style="height: 4px; background: #eee; border-radius: 2px; width: 100px; margin-top: 4px;"><div style="width: ${c.adjusted_prob}%; height: 100%; background: var(--accent); border-radius: 2px;"></div></div>
            </td>
            <td style="padding: 16px;">
                <span class="badge ${c.friction_score > 80 ? 'badge-red' : (c.friction_score > 40 ? 'badge-warning' : 'badge-green')}">${c.friction_score}/100</span>
            </td>
            <td style="padding: 16px;">
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--danger);">${c.friction_analysis.risk_level}</span>
            </td>
            <td style="padding: 16px; font-size: 0.85rem; color: var(--text-light); line-height: 1.4;">
                ${c.embassy_behavior}
            </td>
        </tr>
    `).join('');
}

// 2. Visa Probability Engine
function renderProbabilityEngine() {
    const container = document.getElementById('probability-engine-container');
    if (!container) return;

    const status = document.getElementById('status').value;
    const savings = parseInt(document.getElementById('savings').value) || 0;
    const family = document.getElementById('family').value;
    const history = document.getElementById('history').value;

    container.innerHTML = countries.map(c => {
        // Multi-factor calculation
        let scores = {
            financial: Math.min(100, (savings / 100000) * 100),
            professional: status === 'public' ? 100 : (status === 'ae' ? 85 : 40),
            social: family === 'yes' ? (['Italie', 'France', 'Grèce'].includes(c.country) ? 90 : 50) : 60,
            acceptance: parseInt(c.acceptance_rate_morocco),
            accessibility: 100 - c.friction_score,
            risk: 100 - (c.brutal_reality_score * 10)
        };

        const globalScore = Math.round((scores.financial + scores.professional + scores.social + scores.acceptance + scores.accessibility) / 5);
        
        let level = "Medium";
        let color = "var(--friction-medium)";
        if (globalScore >= 80) { level = "Very High"; color = "var(--friction-low)"; }
        else if (globalScore >= 60) { level = "High"; color = "var(--friction-low)"; }
        else if (globalScore < 40) { level = "Low"; color = "var(--friction-high)"; }
        else if (globalScore < 20) { level = "Very Low"; color = "var(--friction-critical)"; }

        return `
            <div class="section-card" style="border-top: 6px solid ${color};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                    <div>
                        <h3 style="margin: 0;">${c.country}</h3>
                        <span style="font-size: 0.8rem; font-weight: 800; color: ${color}; text-transform: uppercase;">Probability: ${level}</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 2rem; font-weight: 800; color: ${color};">${globalScore}<small style="font-size: 0.8rem; opacity: 0.6;">%</small></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                    <div style="font-size: 0.75rem;">
                        <div style="margin-bottom: 4px; display: flex; justify-content: space-between;"><span>💰 Financial</span> <strong>${Math.round(scores.financial)}%</strong></div>
                        <div style="height: 4px; background: #eee; border-radius: 2px;"><div style="width: ${scores.financial}%; height: 100%; background: var(--accent); border-radius: 2px;"></div></div>
                    </div>
                    <div style="font-size: 0.75rem;">
                        <div style="margin-bottom: 4px; display: flex; justify-content: space-between;"><span>💼 Professional</span> <strong>${scores.professional}%</strong></div>
                        <div style="height: 4px; background: #eee; border-radius: 2px;"><div style="width: ${scores.professional}%; height: 100%; background: var(--accent); border-radius: 2px;"></div></div>
                    </div>
                    <div style="font-size: 0.75rem;">
                        <div style="margin-bottom: 4px; display: flex; justify-content: space-between;"><span>👨‍👩‍👧 Social Ties</span> <strong>${scores.social}%</strong></div>
                        <div style="height: 4px; background: #eee; border-radius: 2px;"><div style="width: ${scores.social}%; height: 100%; background: var(--accent); border-radius: 2px;"></div></div>
                    </div>
                    <div style="font-size: 0.75rem;">
                        <div style="margin-bottom: 4px; display: flex; justify-content: space-between;"><span>🌍 Acceptance</span> <strong>${scores.acceptance}%</strong></div>
                        <div style="height: 4px; background: #eee; border-radius: 2px;"><div style="width: ${scores.acceptance}%; height: 100%; background: var(--accent); border-radius: 2px;"></div></div>
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; font-size: 0.85rem;">
                    <h5 style="margin-bottom: 8px; text-transform: uppercase; font-size: 0.7rem; color: var(--text-light);">💡 How to increase chances</h5>
                    <ul style="padding-left: 16px; margin: 0;">
                        <li>${c.embassy_behavior}</li>
                        <li>${c.morocco_insights.pro_tip}</li>
                        ${savings < 50000 ? '<li style="color: var(--danger);">Augmenter le solde moyen sur 6 mois.</li>' : ''}
                    </ul>
                </div>
            </div>
        `;
    }).join('');
}

// 3. Friction Map Engine
function renderFrictionMap() {
    const grid = document.getElementById('friction-grid');
    const summary = document.getElementById('friction-summary');
    if (!grid || !summary) return;

    // Strategic Summary logic
    const critical = countries.filter(c => c.friction_analysis.risk_level === 'Critical');
    const transparent = countries.filter(c => c.friction_analysis.transparency_score >= 80);

    summary.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div>
                <h4 style="color: var(--friction-high); margin-bottom: 8px;">⚠️ Systèmes Bloqués (Alerte OSINT)</h4>
                <p style="font-size: 0.9rem;">${critical.map(c => c.country).join(', ')} subissent une saturation totale par bots.</p>
            </div>
            <div>
                <h4 style="color: var(--friction-low); margin-bottom: 8px;">✅ Systèmes Transparents</h4>
                <p style="font-size: 0.9rem;">${transparent.map(c => c.country).join(', ')} offrent les parcours les plus fluides en 2026.</p>
            </div>
        </div>
    `;

    // Sort by friction score descending
    const sorted = [...countries].sort((a, b) => b.friction_analysis.friction_score - a.friction_analysis.friction_score);

    grid.innerHTML = sorted.map(c => {
        const score = c.friction_analysis.friction_score;
        let color = "var(--friction-low)";
        if (score > 90) color = "var(--friction-critical)";
        else if (score > 60) color = "var(--friction-high)";
        else if (score > 30) color = "var(--friction-medium)";

        return `
            <div class="section-card" style="border-left: 6px solid ${color};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;">${c.country}</h3>
                        <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: ${color};">${c.friction_analysis.risk_level} Friction</span>
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 800; color: ${color};">${score}</div>
                </div>
                
                <div style="font-size: 0.85rem; margin-bottom: 12px;">
                    <div style="margin-bottom: 4px;"><strong>Système:</strong> ${c.friction_analysis.official_system}</div>
                    <div style="margin-bottom: 4px;"><strong>Délai Réel:</strong> ${c.friction_analysis.real_delay}</div>
                    <div style="margin-bottom: 4px;"><strong>Transparence:</strong> ${c.friction_analysis.transparency_score}/100</div>
                </div>

                <div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 0.85rem;">
                    <p style="margin: 0;"><strong>Terrain:</strong> ${c.friction_analysis.user_reports_summary}</p>
                </div>
            </div>
        `;
    }).join('');
}

// 4. Visa-Free
function renderVisaFree() {
    const tbody = document.getElementById('visafree-body');
    if (!tbody) return;

    tbody.innerHTML = countries.filter(c => c.access_type !== 'Visa Required').map(c => `
        <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 16px;"><strong>${c.country}</strong></td>
            <td style="padding: 16px;"><span class="badge badge-green">${c.access_type}</span></td>
            <td style="padding: 16px;">${c.stay_duration}</td>
            <td style="padding: 16px; font-size: 0.85rem;">${c.morocco_insights.reality}</td>
        </tr>
    `).join('');
}

// 3. Business
function renderBusiness() {
    const container = document.getElementById('business-grid');
    if (!container) return;

    container.innerHTML = countries.map(c => `
        <div class="section-card">
            <h4 style="margin-bottom: 12px;">${c.country}</h4>
            <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Travail:</strong> ${c.visa_system.work.rights}</p>
            <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Business:</strong> ${c.visa_system.business.rights}</p>
            <p style="font-size: 0.85rem; color: var(--text-light);">${c.visa_system.business.conditions}</p>
            <button class="btn" style="margin-top: 16px; width: 100%;" onclick="showCountryDetails('${c.country}')">Guide Business</button>
        </div>
    `).join('');
}

// 4. Street Food
function renderStreetFood() {
    const container = document.getElementById('streetfood-grid');
    if (!container) return;

    container.innerHTML = countries.map(c => `
        <div class="section-card" style="border-left: 4px solid ${c.street_food.opportunity === 'High' || c.street_food.opportunity === 'Extreme' ? 'var(--success)' : 'var(--border)'}">
            <h4 style="margin-bottom: 8px;">${c.country}</h4>
            <div class="badge ${c.street_food.opportunity === 'Extreme' ? 'badge-red' : 'badge-green'}" style="margin-bottom: 12px;">Opportunité: ${c.street_food.opportunity}</div>
            <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Investissement:</strong> ~${c.street_food.investment_min}</p>
            <p style="font-size: 0.85rem;"><strong>Barrière:</strong> ${c.street_food.barriers}</p>
        </div>
    `).join('');
}

// 5. CBI
function renderCBI() {
    const container = document.getElementById('cbi-grid');
    if (!container) return;

    container.innerHTML = countries.filter(c => c.cbi_program).map(c => `
        <div class="section-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="margin: 0;">${c.country}</h4>
                <span class="badge badge-green">${c.cbi_program.status}</span>
            </div>
            <p style="font-size: 1.2rem; font-weight: 800; color: var(--accent);">${c.cbi_program.cost_min}</p>
            <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Type:</strong> ${c.cbi_program.type}</p>
            <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Délai:</strong> ${c.cbi_program.time}</p>
            <p style="font-size: 0.85rem; color: var(--text-light); margin-top: 12px;">${c.morocco_insights.pro_tip}</p>
        </div>
    `).join('');
}

// 6. Education
function renderEducation(filter = 'all') {
    const container = document.getElementById('education-grid');
    if (!container) return;

    container.innerHTML = countries.filter(c => c.education_mobility).map(c => {
        let html = '';
        const edu = c.education_mobility;

        if (filter === 'all' || filter === 'languages') {
            html += `
                <div class="section-card" style="border-left: 4px solid var(--accent);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <h4 style="margin: 0;">${c.country} - Langues</h4>
                        <span class="badge ${edu.language_study.access === 'Facile' ? 'badge-green' : 'badge-red'}">${edu.language_study.access}</span>
                    </div>
                    <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Bac requis:</strong> ${edu.language_study.bac_required ? 'Oui' : 'Non'}</p>
                    <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Coût:</strong> ${edu.language_study.estimated_cost}</p>
                    <p style="font-size: 0.85rem; color: var(--text-light);">${edu.language_study.strategic_insight}</p>
                </div>
            `;
        }

        if (filter === 'all' || filter === 'technical') {
            html += `
                <div class="section-card" style="border-left: 4px solid var(--primary);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <h4 style="margin: 0;">${c.country} - Technique</h4>
                        <span class="badge badge-green">Formation Longue</span>
                    </div>
                    <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Accès sans Bac:</strong> ${edu.technical_training.access_no_bac ? 'Oui' : 'Non'}</p>
                    <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Secteurs:</strong> ${edu.technical_training.types.join(', ')}</p>
                    <p style="font-size: 0.85rem; color: var(--text-light);">${edu.technical_training.market_insight}</p>
                </div>
            `;
        }

        if (filter === 'all' || filter === 'short') {
            html += `
                <div class="section-card" style="border-left: 4px solid var(--success);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <h4 style="margin: 0;">${c.country} - Court</h4>
                        <span class="badge badge-green">${edu.short_courses.duration}</span>
                    </div>
                    <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Types:</strong> ${edu.short_courses.types.join(', ')}</p>
                    <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Visa:</strong> ${edu.short_courses.visa}</p>
                    <p style="font-size: 0.9rem;"><strong>Coût:</strong> ${edu.short_courses.cost}</p>
                </div>
            `;
        }

        return html;
    }).join('');
}

function filterEducation(type, btn) {
    document.querySelectorAll('#education .filter-btns .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderEducation(type);
}

// 7. Driving License
function renderDrivingLicense() {
    const container = document.getElementById('driving-grid');
    if (!container) return;

    container.innerHTML = countries.filter(c => c.driving_license).map(c => `
        <div class="section-card" style="border-left: 4px solid ${c.driving_license.status.includes('Valide') ? 'var(--success)' : 'var(--accent)'};">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <h4 style="margin: 0;">${c.country}</h4>
                <span class="badge ${c.driving_license.status.includes('Valide') ? 'badge-green' : 'badge-red'}">${c.driving_license.status}</span>
            </div>
            <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Durée autorisée:</strong> ${c.driving_license.duration}</p>
            <p style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Permis International:</strong> ${c.driving_license.international_required ? 'Requis' : 'Non requis'}</p>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p style="font-size: 0.85rem; font-weight: 700; color: var(--primary);">🔄 Conversion / Échange</p>
                <p style="font-size: 0.8rem; margin-top: 4px;">${c.driving_license.conversion_process}</p>
                <p style="font-size: 0.8rem; margin-top: 4px; color: var(--text-light);"><strong>Coût estimé:</strong> ${c.driving_license.cost}</p>
            </div>
            <p style="font-size: 0.8rem; color: var(--danger); margin-top: 12px;">⚠️ ${c.driving_license.restrictions}</p>
        </div>
    `).join('');
}

// SaaS Simulation Logic
function showAuth(type) {
    const email = prompt(`Simulation ${type === 'login' ? 'Connexion' : 'Inscription'} :\nEntrez votre email:`, "demo@visaflow.ma");
    if (email) {
        localStorage.setItem('visa_user', email);
        updateAuthUI();
    }
}

function logout() {
    localStorage.removeItem('visa_user');
    updateAuthUI();
}

function updateAuthUI() {
    const user = localStorage.getItem('visa_user');
    const authUI = document.getElementById('auth-ui');
    const userUI = document.getElementById('user-ui');
    const userDisplay = document.getElementById('user-display');

    if (user) {
        authUI.style.display = 'none';
        userUI.style.display = 'flex';
        userDisplay.innerText = user;
    } else {
        authUI.style.display = 'flex';
        userUI.style.display = 'none';
    }
}

// Initial Auth Check
updateAuthUI();

// 8. Terrain & Appointment Audit
function renderMoroccoReality() {
    const container = document.getElementById('morocco-insights-container');
    if (!container) return;

    // Sorting countries by real difficulty
    const sorted = [...countries].sort((a, b) => {
        const order = { "Zero": 0, "Easy": 1, "Accessible": 2, "Random (Loterie)": 3, "Extreme": 4, "Impossible (sans aide)": 5 };
        return (order[a.appointment_audit.real_difficulty] || 0) - (order[b.appointment_audit.real_difficulty] || 0);
    });

    let html = `
        <div class="section-card" style="background: var(--accent-soft); border: none; margin-bottom: 32px;">
            <h4>📈 Résumé Stratégique des Rendez-vous</h4>
            <p style="font-size: 0.9rem; margin-top: 8px;"><strong>Systèmes les plus transparents :</strong> Grèce, Portugal, Turquie.</p>
            <p style="font-size: 0.9rem; margin-top: 4px;"><strong>Systèmes critiques (Bloqués) :</strong> Espagne (BLS), Italie (TLS Casa).</p>
            <p style="font-size: 0.9rem; margin-top: 12px; font-weight: 700; color: var(--primary);">💡 Recommandation : Privilégiez les pays à transparence "Haute" pour éviter les frais d'intermédiaires et les risques de bannissement.</p>
        </div>
        <div class="grid-2">
    `;

    html += sorted.map(c => `
        <div class="insight-box ${['Extreme', 'Impossible (sans aide)'].includes(c.appointment_audit.real_difficulty) ? 'danger' : 'warning'}">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <h4 style="margin: 0;">${c.country}</h4>
                <span class="badge ${c.appointment_audit.real_difficulty === 'Easy' || c.appointment_audit.real_difficulty === 'Zero' ? 'badge-green' : 'badge-red'}">
                    ${c.appointment_audit.real_difficulty}
                </span>
            </div>
            <p style="font-size: 0.85rem; margin-bottom: 8px;"><strong>Plateforme :</strong> ${c.appointment_audit.platform}</p>
            <p style="font-size: 0.85rem; margin-bottom: 8px;"><strong>Transparence :</strong> ${c.appointment_audit.transparency}</p>
            <p style="font-size: 0.85rem; margin-bottom: 12px;"><strong>Problèmes :</strong> ${c.appointment_audit.issues.join(' • ')}</p>
            <div style="background: rgba(255,255,255,0.4); padding: 12px; border-radius: 8px;">
                <p style="font-size: 0.85rem;"><strong>Pratiques :</strong> ${c.appointment_audit.user_reports}</p>
                <p style="font-size: 0.85rem; color: var(--danger); margin-top: 8px;"><strong>Risque :</strong> ${c.appointment_audit.risks[0]}</p>
            </div>
        </div>
    `).join('');

    html += `</div>`;
    container.innerHTML = html;
}

// 7. Details & Comments
async function showCountryDetails(name) {
    const c = countries.find(x => x.country === name);
    if (!c) return;

    switchTab('details', document.querySelectorAll('.tab-btn')[0]); 
    const view = document.getElementById('country-detail-view');
    
    view.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 32px;">
            <div>
                <h2 style="font-size: 2.5rem; margin: 0;">${c.country}</h2>
                <span class="badge badge-green">${c.region}</span>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-light); text-transform: uppercase;">Réalité Brutale</div>
                <div style="font-size: 2.5rem; font-weight: 800; color: var(--accent);">${c.brutal_reality_score}/10</div>
            </div>
        </div>

        <div class="grid-2">
            <div>
                <h4 style="border-bottom: 2px solid var(--accent); padding-bottom: 8px; margin-bottom: 16px;">🛂 Système de Visa</h4>
                <p><strong>Tourisme:</strong> ${c.visa_system.tourism.difficulty} (${c.visa_system.tourism.cost})</p>
                <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 12px;">Procédure: ${c.visa_system.tourism.process}</p>
                
                <p><strong>Travail:</strong> ${c.visa_system.work.availability}</p>
                <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 12px;">Droits: ${c.visa_system.work.rights}</p>
                
                <p><strong>Business:</strong> ${c.visa_system.business.rights}</p>
                <p style="font-size: 0.85rem; color: var(--text-light);">${c.visa_system.business.conditions}</p>
            </div>
            <div class="insight-box danger">
                <h4 style="margin-bottom: 8px;">⚠️ Risques & Pièges</h4>
                <p style="font-size: 0.9rem;">${c.hidden_risks}</p>
            </div>
        </div>

        <div class="grid-2" style="margin-top: 32px;">
            <div class="section-card" style="background: var(--accent-soft); border: none;">
                <h4 style="margin-bottom: 12px;">🍜 Street Food Audit</h4>
                <div class="badge badge-green" style="margin-bottom: 8px;">Potentiel: ${c.street_food.opportunity}</div>
                <p style="font-size: 0.9rem;"><strong>CapEx min:</strong> ${c.street_food.investment_min}</p>
                <p style="font-size: 0.9rem;"><strong>Demande:</strong> ${c.street_food.demand}</p>
                <p style="font-size: 0.85rem; color: var(--text-light); margin-top: 8px;">${c.street_food.barriers}</p>
            </div>
            ${c.cbi_program ? `
            <div class="section-card" style="background: #f0fdf4; border: 1px solid #bcf0da;">
                <h4 style="margin-bottom: 12px; color: #166534;">💰 Citizenship by Investment</h4>
                <p style="font-size: 1.1rem; font-weight: 800; color: #166534;">${c.cbi_program.cost_min}</p>
                <p style="font-size: 0.9rem;"><strong>Type:</strong> ${c.cbi_program.type}</p>
                <p style="font-size: 0.9rem;"><strong>Délai:</strong> ${c.cbi_program.time}</p>
                <p style="font-size: 0.85rem; color: #166534; margin-top: 8px;">Status: ${c.cbi_program.status}</p>
            </div>
            ` : `
            <div class="section-card" style="opacity: 0.5;">
                <h4 style="margin-bottom: 12px;">💰 Passports</h4>
                <p style="font-size: 0.85rem;">Aucun programme de citoyenneté par investissement officiel disponible pour ce pays.</p>
            </div>
            `}
        </div>

        <div class="insight-box warning" style="margin-top: 32px;">
            <h4 style="margin-bottom: 8px;">🇲🇦 Note Locale ("${c.morocco_insights.darija_note}")</h4>
            <p style="font-size: 0.95rem;">${c.morocco_insights.reality}</p>
            <p style="font-size: 0.9rem; font-weight: 700; color: var(--primary); margin-top: 8px;">💡 Conseil Expert: ${c.morocco_insights.pro_tip}</p>
        </div>
    `;

    view.dataset.countryId = c.id;
    view.dataset.countryName = name;
    renderComments(c.id);
}

async function handleCommentSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('comment-name').value;
    const text = document.getElementById('comment-text').value;
    const countryId = document.getElementById('country-detail-view').dataset.countryId;

    if (!name || !text || !countryId) return alert("Veuillez remplir tous les champs.");

    try {
        const response = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 1, // Simulated current user
                countryId: parseInt(countryId),
                content: text
            })
        });

        if (response.ok) {
            alert("Commentaire envoyé ! Il apparaîtra après validation dans l'onglet Admin.");
            e.target.reset();
        }
    } catch (error) {
        console.error("Error submitting comment:", error);
    }
}

async function renderAdmin() {
    const container = document.getElementById('admin-comment-list');
    if (!container) return;

    try {
        // We'll need a special endpoint to get ALL pending comments
        const response = await fetch(`${API_URL}/admin/comments/pending`);
        // If this endpoint doesn't exist yet, we'll get an error.
        // I'll add it to server.js in the next step.
        const pending = await response.json();

        container.innerHTML = pending.length ? pending.map(cm => `
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid var(--warning);">
                <div style="font-size: 0.75rem; color: var(--text-light); margin-bottom: 8px;">
                    <strong>Utilisateur #${cm.userId}</strong> pour <strong>ID Pays: ${cm.countryId}</strong>
                </div>
                <p style="font-size: 0.9rem; margin-bottom: 12px;">${cm.content}</p>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" style="background: var(--success); color: white; padding: 4px 12px; font-size: 0.75rem;" onclick="approveComment(${cm.id})">Approuver</button>
                    <button class="btn" style="background: var(--danger); color: white; padding: 4px 12px; font-size: 0.75rem;" onclick="deleteComment(${cm.id})">Supprimer</button>
                </div>
            </div>
        `).join('') : '<p style="color: var(--text-light);">Aucun commentaire en attente.</p>';
    } catch (error) {
        container.innerHTML = '<p style="color: var(--danger);">Erreur de chargement des commentaires.</p>';
    }
}

async function approveComment(id) {
    try {
        const response = await fetch(`${API_URL}/admin/comments/${id}/approve`, { method: 'PATCH' });
        if (response.ok) renderAdmin();
    } catch (error) {
        console.error("Error approving comment:", error);
    }
}

async function deleteComment(id) {
    try {
        const response = await fetch(`${API_URL}/admin/comments/${id}`, { method: 'DELETE' });
        if (response.ok) renderAdmin();
    } catch (error) {
        console.error("Error deleting comment:", error);
    }
}

async function renderComments(countryId) {
    const list = document.getElementById('comment-list');
    
    try {
        const response = await fetch(`${API_URL}/comments/${countryId}`);
        const countryComments = await response.json();
        
        list.innerHTML = countryComments.length ? countryComments.map(cm => `
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid var(--accent);">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-light); margin-bottom: 8px;">
                    <strong>${cm.user?.name || 'Utilisateur'}</strong>
                    <span>${new Date(cm.createdAt).toLocaleDateString()}</span>
                </div>
                <p style="font-size: 0.9rem; margin: 0;">${cm.content}</p>
                <div style="font-size: 0.65rem; color: var(--success); margin-top: 8px;">✓ Validé par modération</div>
            </div>
        `).join('') : '<p style="color: var(--text-light); font-style: italic;">Aucun commentaire validé pour ce pays.</p>';
    } catch (error) {
        list.innerHTML = '<p style="color: var(--danger);">Erreur de chargement des commentaires.</p>';
    }
}

init();
