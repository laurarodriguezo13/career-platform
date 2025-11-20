// Enhanced ESADE Career Platform - App.js
console.log('Enhanced App.js loaded');
let allJobs = [];
let filteredJobs = [];
let favorites = JSON.parse(localStorage.getItem('job_favorites') || '[]');
let currentFilters = {
    locations: [],
    jobTypes: [],
    minMatchScore: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializeFilters();
    updateFavoritesCount();
});

function setupEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    const headerSearchInput = document.getElementById('headerSearchInput');
    const matchScoreRange = document.getElementById('matchScoreRange');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', e => { 
            if (e.key === 'Enter') performSearch(); 
        });
    }
    
    // Header search
    if (headerSearchBtn && headerSearchInput) {
        headerSearchBtn.addEventListener('click', () => performHeaderSearch());
        headerSearchInput.addEventListener('keypress', e => { 
            if (e.key === 'Enter') performHeaderSearch(); 
        });
    }
    
    if (matchScoreRange) {
        matchScoreRange.addEventListener('input', (e) => {
            document.getElementById('matchScoreValue').textContent = e.target.value + '%+';
        });
    }
    
    // Favorites button
    const favoritesBtn = document.getElementById('favoritesBtn');
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', showFavorites);
    }
}

function performHeaderSearch() {
    const input = document.getElementById('headerSearchInput');
    const searchCard = document.getElementById('searchCard');
    const results = document.getElementById('searchResults');
    
    if (!input || !results) return;
    
    const term = input.value.toLowerCase().trim();
    if (!term) {
        if (searchCard) searchCard.style.display = 'none';
        return;
    }
    
    // Show search card
    if (searchCard) searchCard.style.display = 'block';
    
    // Scroll to search results
    searchCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    const filtered = allJobs.filter(j => 
        (j.title || '').toLowerCase().includes(term) || 
        (j.company || '').toLowerCase().includes(term) || 
        (j.location || '').toLowerCase().includes(term) ||
        (j.description || '').toLowerCase().includes(term) ||
        (j.skills || []).some(s => s.toLowerCase().includes(term))
    );
    
    if (!filtered.length) {
        results.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No results found</h3>
                <p>No jobs match "${escapeHtml(term)}". Try different keywords.</p>
            </div>
        `;
    } else {
        results.innerHTML = `
            <h4 style="margin: 1rem 0; color: var(--primary-color);">
                <i class="fas fa-search"></i> Found ${filtered.length} job(s) for "${escapeHtml(term)}"
            </h4>
        `;
        displayJobs(filtered, results);
    }
}

async function loadRecommendations() {
    const container = document.getElementById('recommendedJobs');
    if (!container) return;
    
    showLoading(container);
    
    try {
        const prefs = getUserPreferences();
        let url = CONFIG.api.endpoint + '/jobs';
        const params = new URLSearchParams();
        
        if (prefs.locations && prefs.locations[0]) {
            params.append('location', prefs.locations[0]);
        }
        if (prefs.skills && prefs.skills.length > 0) {
            params.append('skills', prefs.skills.join(','));
        }
        
        if (params.toString()) url += '?' + params.toString();
        
        const response = await fetch(url);
        const data = await response.json();
        filteredJobs = data.success ? data.jobs : [];
        
        // Load all jobs for search
        const allResponse = await fetch(CONFIG.api.endpoint + '/jobs');
        const allData = await allResponse.json();
        allJobs = allData.success ? allData.jobs : [];
        
        updateStatistics();
        
        // Display jobs after a short delay to ensure allJobs is populated
        setTimeout(() => {
            applyCurrentFilters();
            loadTrendingSkills();
        }, 200);
        
    } catch (e) {
        console.error('API Error:', e);
        showError(container, 'Failed to load jobs. Please try again.');
        filteredJobs = [];
        allJobs = [];
    }
}

function showLoading(container) {
    container.innerHTML = `
        <div class="skeleton" style="height: 200px; margin-bottom: 1rem;"></div>
        <div class="skeleton" style="height: 200px; margin-bottom: 1rem;"></div>
        <div class="skeleton" style="height: 200px;"></div>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3>Oops!</h3>
            <p>${message}</p>
        </div>
    `;
}

function updateStatistics() {
    const totalJobs = allJobs.length;
    const avgMatch = filteredJobs.length > 0 
        ? Math.round(filteredJobs.reduce((sum, j) => sum + (j.matchScore || 75), 0) / filteredJobs.length)
        : 0;
    
    updateStat('totalJobsStat', totalJobs);
    updateStat('matchRateStat', avgMatch + '%');
    updateStat('favoritesCount', favorites.length);
    updateStat('citiesCount', new Set(allJobs.map(j => j.location)).size);
}

function updateStat(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}

function displayJobs(jobs, container) {
    if (!jobs || !jobs.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No jobs found</h3>
                <p>Try adjusting your filters or preferences.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = jobs.map(job => {
        const isFavorite = favorites.some(f => f.jobId === job.jobId);
        return `
            <div class="job-item" onclick="showJobDetail('${job.jobId}')">
                <div class="job-item-header">
                    <div style="flex: 1;">
                        <div class="job-title">${escapeHtml(job.title || 'Job Title')}</div>
                        <div class="job-company">${escapeHtml(job.company || 'Company')}</div>
                    </div>
                    <button class="btn-icon ${isFavorite ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleFavorite('${job.jobId}')" 
                            title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="job-details">
                    <div class="job-detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${escapeHtml(job.location || 'Location')}</span>
                    </div>
                    <div class="job-detail-item">
                        <i class="fas fa-building"></i>
                        <span>${escapeHtml(job.industry || 'Industry')}</span>
                    </div>
                    <div class="match-score">
                        <i class="fas fa-star"></i>
                        ${job.matchScore || 75}% Match
                    </div>
                </div>
                <div class="job-description">${escapeHtml((job.description || '').substring(0, 150))}...</div>
                <div style="margin: 1rem 0;">
                    ${(job.skills || []).slice(0, 5).map(s => 
                        `<span class="skill-tag" onclick="event.stopPropagation(); filterBySkill('${s}')">${escapeHtml(s)}</span>`
                    ).join('')}
                </div>
                <div class="job-actions">
                    <a href="${job.url || '#'}" target="_blank" class="job-link" onclick="event.stopPropagation()">
                        <i class="fas fa-external-link-alt"></i> View Job
                    </a>
                    <button class="btn-outline" onclick="event.stopPropagation(); showJobDetail('${job.jobId}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showJobDetail(jobId) {
    const job = [...allJobs, ...filteredJobs].find(j => j.jobId === jobId);
    if (!job) {
        showToast('Job not found', 'error');
        return;
    }
    
    const modal = document.getElementById('jobDetailModal');
    const content = document.getElementById('jobDetailContent');
    const isFavorite = favorites.some(f => f.jobId === job.jobId);
    
    content.innerHTML = `
        <div class="job-detail-header">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div style="flex: 1;">
                    <h2 style="color: var(--primary-color); margin-bottom: 0.5rem;">${escapeHtml(job.title || 'Job Title')}</h2>
                    <div style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        <i class="fas fa-building"></i> ${escapeHtml(job.company || 'Company')}
                    </div>
                </div>
                <button class="btn-icon ${isFavorite ? 'active' : ''}" 
                        onclick="toggleFavorite('${job.jobId}'); showJobDetail('${job.jobId}')" 
                        title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div style="display: flex; gap: 2rem; flex-wrap: wrap; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                <div><i class="fas fa-map-marker-alt"></i> <strong>${escapeHtml(job.location || 'Location')}</strong></div>
                <div><i class="fas fa-briefcase"></i> <strong>${escapeHtml(job.industry || 'Industry')}</strong></div>
                <div class="match-score">${job.matchScore || 75}% Match</div>
            </div>
        </div>
        <div class="job-detail-body">
            <div class="job-detail-section">
                <h4><i class="fas fa-info-circle"></i> Description</h4>
                <p>${escapeHtml(job.description || 'No description available.')}</p>
            </div>
            <div class="job-detail-section">
                <h4><i class="fas fa-tags"></i> Required Skills</h4>
                <div>
                    ${(job.skills || []).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
                </div>
            </div>
            ${job.salary ? `
            <div class="job-detail-section">
                <h4><i class="fas fa-euro-sign"></i> Salary</h4>
                <p>${escapeHtml(job.salary)}</p>
            </div>
            ` : ''}
            <div class="job-actions" style="margin-top: 2rem;">
                <a href="${job.url || '#'}" target="_blank" class="btn-primary">
                    <i class="fas fa-external-link-alt"></i> Apply Now
                </a>
                <button class="btn-outline" onclick="closeJobDetail()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeJobDetail() {
    document.getElementById('jobDetailModal').style.display = 'none';
}

function toggleFavorite(jobId) {
    const job = [...allJobs, ...filteredJobs].find(j => j.jobId === jobId);
    if (!job) return;
    
    const index = favorites.findIndex(f => f.jobId === jobId);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removed from favorites', 'success');
    } else {
        favorites.push(job);
        showToast('Added to favorites', 'success');
    }
    
    localStorage.setItem('job_favorites', JSON.stringify(favorites));
    updateFavoritesCount();
    
    // Refresh display if on favorites page
    if (document.getElementById('favoritesSection')) {
        showFavorites();
    } else {
        loadRecommendations();
    }
}

function updateFavoritesCount() {
    const countEl = document.getElementById('favoritesCount');
    if (countEl) {
        countEl.textContent = favorites.length;
    }
}

function showFavorites() {
    const dashboardSection = document.getElementById('dashboardSection');
    if (!dashboardSection) return;
    
    const favoritesSection = document.getElementById('favoritesSection') || createFavoritesSection();
    dashboardSection.style.display = 'none';
    favoritesSection.style.display = 'block';
    
    if (favorites.length === 0) {
        document.getElementById('favoritesContent').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❤️</div>
                <h3>No favorites yet</h3>
                <p>Start saving jobs you're interested in!</p>
            </div>
        `;
    } else {
        displayJobs(favorites, document.getElementById('favoritesContent'));
    }
}

function createFavoritesSection() {
    const main = document.querySelector('main');
    const section = document.createElement('section');
    section.id = 'favoritesSection';
    section.style.display = 'none';
    section.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-heart"></i> Your Favorite Jobs</h2>
                <button class="btn-outline" onclick="document.getElementById('favoritesSection').style.display='none'; document.getElementById('dashboardSection').style.display='block';">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
            <div id="favoritesContent"></div>
        </div>
    `;
    main.appendChild(section);
    return section;
}

function initializeFilters() {
    const locations = ['Barcelona', 'Madrid', 'London', 'Paris', 'Berlin', 'Amsterdam'];
    const jobTypes = ['Data Scientist', 'Consultant', 'Product Manager', 'Analyst'];
    
    const locationContainer = document.getElementById('locationFilters');
    const jobTypeContainer = document.getElementById('jobTypeFilters');
    
    if (locationContainer) {
        locationContainer.innerHTML = locations.map(loc => `
            <div class="filter-option">
                <input type="checkbox" id="filter-loc-${loc}" value="${loc}" onchange="updateFilters()">
                <label for="filter-loc-${loc}">${loc}</label>
            </div>
        `).join('');
    }
    
    if (jobTypeContainer) {
        jobTypeContainer.innerHTML = jobTypes.map(type => `
            <div class="filter-option">
                <input type="checkbox" id="filter-type-${type}" value="${type}" onchange="updateFilters()">
                <label for="filter-type-${type}">${type}</label>
            </div>
        `).join('');
    }
}

function updateFilters() {
    const locationChecks = Array.from(document.querySelectorAll('#locationFilters input[type="checkbox"]:checked'));
    const typeChecks = Array.from(document.querySelectorAll('#jobTypeFilters input[type="checkbox"]:checked'));
    const minScore = parseInt(document.getElementById('matchScoreRange').value);
    
    currentFilters.locations = locationChecks.map(c => c.value);
    currentFilters.jobTypes = typeChecks.map(c => c.value);
    currentFilters.minMatchScore = minScore;
}

function applyFilters() {
    updateFilters();
    applyCurrentFilters();
    showToast('Filters applied', 'success');
}

function clearFilters() {
    document.querySelectorAll('#locationFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('#jobTypeFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('matchScoreRange').value = 0;
    document.getElementById('matchScoreValue').textContent = '0%+';
    currentFilters = { locations: [], jobTypes: [], minMatchScore: 0 };
    applyCurrentFilters();
    showToast('Filters cleared', 'success');
}

function applyCurrentFilters() {
    let jobs = [...filteredJobs];
    
    if (currentFilters.locations.length > 0) {
        jobs = jobs.filter(j => currentFilters.locations.some(loc => 
            (j.location || '').toLowerCase().includes(loc.toLowerCase())
        ));
    }
    
    if (currentFilters.jobTypes.length > 0) {
        jobs = jobs.filter(j => currentFilters.jobTypes.some(type => 
            (j.title || '').toLowerCase().includes(type.toLowerCase())
        ));
    }
    
    if (currentFilters.minMatchScore > 0) {
        jobs = jobs.filter(j => (j.matchScore || 0) >= currentFilters.minMatchScore);
    }
    
    displayJobs(jobs, document.getElementById('recommendedJobs'));
}

function toggleFilters() {
    const sidebar = document.getElementById('filtersSidebar');
    if (sidebar) {
        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    }
}

function refreshJobs() {
    showToast('Refreshing jobs...', 'success');
    loadRecommendations();
}

function performSearch() {
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;
    
    const term = input.value.toLowerCase().trim();
    if (!term) {
        results.innerHTML = '<p style="color: var(--text-secondary);">Enter a search term to find jobs.</p>';
        return;
    }
    
    const filtered = allJobs.filter(j => 
        (j.title || '').toLowerCase().includes(term) || 
        (j.company || '').toLowerCase().includes(term) || 
        (j.location || '').toLowerCase().includes(term) ||
        (j.description || '').toLowerCase().includes(term) ||
        (j.skills || []).some(s => s.toLowerCase().includes(term))
    );
    
    if (!filtered.length) {
        results.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No results found</h3>
                <p>No jobs match "${escapeHtml(term)}". Try different keywords.</p>
            </div>
        `;
    } else {
        results.innerHTML = `
            <h4 style="margin: 1rem 0; color: var(--primary-color);">
                <i class="fas fa-search"></i> Found ${filtered.length} job(s) for "${escapeHtml(term)}"
            </h4>
        `;
        displayJobs(filtered, results);
    }
}

function loadTrendingSkills() {
    const container = document.getElementById('trendingSkills');
    if (!container) return;
    
    // Combine all jobs for skill counting
    const allJobsCombined = [...allJobs, ...filteredJobs];
    
    if (allJobsCombined.length === 0) {
        // Show default skills if no jobs loaded yet
        const defaultSkills = ['Machine Learning', 'Python', 'Data Analysis', 'Communication', 'Agile', 'Excel', 'SQL', 'AWS'];
        container.innerHTML = defaultSkills.map(s => 
            `<span class="skill-tag" onclick="filterBySkill('${s}')">${escapeHtml(s)}</span>`
        ).join('');
        return;
    }
    
    const skillCounts = {};
    allJobsCombined.forEach(job => {
        const skills = job.skills || [];
        if (Array.isArray(skills)) {
            skills.forEach(skill => {
                if (skill && typeof skill === 'string') {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                }
            });
        }
    });
    
    const topSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill]) => skill);
    
    // Fallback to default if no skills found
    if (topSkills.length === 0) {
        const defaultSkills = ['Machine Learning', 'Python', 'Data Analysis', 'Communication', 'Agile', 'Excel', 'SQL', 'AWS'];
        container.innerHTML = defaultSkills.map(s => 
            `<span class="skill-tag" onclick="filterBySkill('${s}')">${escapeHtml(s)}</span>`
        ).join('');
        return;
    }
    
    container.innerHTML = topSkills.map(s => 
        `<span class="skill-tag" onclick="filterBySkill('${s}')">${escapeHtml(s)}</span>`
    ).join('');
}

function filterBySkill(skill) {
    const prefs = getUserPreferences();
    if (!prefs.skills.includes(skill)) {
        prefs.skills.push(skill);
        localStorage.setItem('user_preferences', JSON.stringify(prefs));
    }
    showToast(`Filtering by ${skill}`, 'success');
    loadRecommendations();
}

function getUserPreferences() {
    const saved = localStorage.getItem('user_preferences');
    return saved ? JSON.parse(saved) : {
        skills: ['Python', 'Data Analysis'], 
        locations: ['Barcelona'], 
        industries: ['Technology']
    };
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Legacy functions for compatibility
function addPreferencesButton() {
    // Already in HTML
}

function showPreferencesModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    const prefs = getUserPreferences();
    modal.innerHTML = `
        <div class="modal-content" style="max-width:600px">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="fas fa-cog"></i> Your Preferences</h2>
            <div class="form-group">
                <label><i class="fas fa-tags"></i> Skills (comma-separated)</label>
                <input type="text" id="prefsSkills" value="${prefs.skills.join(', ')}" placeholder="Python, SQL, Machine Learning">
            </div>
            <div class="form-group">
                <label><i class="fas fa-map-marker-alt"></i> Preferred Location</label>
                <select id="prefsLocations">
                    <option value="Barcelona" ${prefs.locations[0]==='Barcelona'?'selected':''}>🇪🇸 Barcelona</option>
                    <option value="Madrid" ${prefs.locations[0]==='Madrid'?'selected':''}>🇪🇸 Madrid</option>
                    <option value="London" ${prefs.locations[0]==='London'?'selected':''}>🇬🇧 London</option>
                    <option value="Paris" ${prefs.locations[0]==='Paris'?'selected':''}>🇫🇷 Paris</option>
                    <option value="Berlin" ${prefs.locations[0]==='Berlin'?'selected':''}>🇩🇪 Berlin</option>
                    <option value="Amsterdam" ${prefs.locations[0]==='Amsterdam'?'selected':''}>🇳🇱 Amsterdam</option>
                </select>
            </div>
            <div class="form-group">
                <label><i class="fas fa-industry"></i> Industries (comma-separated)</label>
                <input type="text" id="prefsIndustries" value="${prefs.industries.join(', ')}" placeholder="Technology, Consulting, Finance">
            </div>
            <button onclick="savePreferences()" class="btn-primary btn-block">
                <i class="fas fa-save"></i> Save & Refresh
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function savePreferences() {
    const prefs = {
        skills: document.getElementById('prefsSkills').value.split(',').map(s => s.trim()).filter(s => s),
        locations: [document.getElementById('prefsLocations').value],
        industries: document.getElementById('prefsIndustries').value.split(',').map(s => s.trim()).filter(s => s)
    };
    localStorage.setItem('user_preferences', JSON.stringify(prefs));
    document.querySelector('.modal').remove();
    showToast('Preferences saved!', 'success');
    loadRecommendations();
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
