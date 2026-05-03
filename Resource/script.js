// Subject metadata used by the in-page subject badge
const SUBJECT_META = {
    science:  { name: 'Science',         emoji: '🔬' },
    social:   { name: 'Social Studies',  emoji: '🗺️' },
    math:     { name: 'Mathematics',     emoji: '🔢' },
    language: { name: 'Language Arts',   emoji: '📚' }
};

function updateSubjectBadge(subjectId) {
    const meta = SUBJECT_META[subjectId];
    if (!meta) return;
    const emojiEl = document.getElementById('currentSubjectEmoji');
    const nameEl  = document.getElementById('currentSubjectName');
    if (emojiEl) emojiEl.textContent = meta.emoji;
    if (nameEl)  nameEl.textContent  = meta.name;
}

function showSubject(subject) {
    // Hide all content areas
    document.querySelectorAll('.content-area').forEach(area => {
        area.classList.remove('active');
    });

    // Show selected content area
    document.getElementById(subject).classList.add('active');
    updateSubjectBadge(subject);

    // Update button states (legacy: only runs if subject buttons exist on the page)
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (typeof event !== 'undefined' && event && event.target && event.target.classList) {
        event.target.classList.add('active');
    }

    // Close any open hamburger menus
    closeAllMenus();
}

function showChapter(subject, chapterNum) {
    // Hide all chapters in this subject
    document.querySelectorAll(`#${subject} .chapter-content`).forEach(chapter => {
        chapter.classList.remove('active');
    });

    // Show selected chapter
    const targetChapter = document.getElementById(`${subject}-chapter-${chapterNum}`);

    if (targetChapter) {
        targetChapter.classList.add('active');
    }

    // Update button states
    const buttons = document.querySelectorAll(`#${subject} .chapter-btn`);
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    if (buttons[chapterNum - 1]) {
        buttons[chapterNum - 1].classList.add('active');
    }

    // Refresh completion ticks (a child may have just finished a chapter this session)
    refreshChapterMenuState();

    // Close hamburger menu after selection (mobile)
    closeAllMenus();
}

// Mark sidebar buttons whose chapter the learner has finished. Called on load,
// when navigating chapters, and after the boss quiz finishes (lesson-player.js).
function refreshChapterMenuState() {
    if (!window.PEP || typeof PEP.getProgress !== 'function') return;
    document.querySelectorAll('.chapter-btn[data-chapter-id]').forEach(btn => {
        const id = btn.dataset.chapterId;
        const prog = PEP.getProgress(id);
        const done = !!prog;
        btn.classList.toggle('is-done', done);
        if (done) {
            const baseLabel = (btn.dataset.baseLabel ||= btn.textContent.trim());
            btn.setAttribute('aria-label', `${baseLabel} (completed)`);
        } else {
            btn.removeAttribute('aria-label');
        }
    });
}
window.refreshChapterMenuState = refreshChapterMenuState;

function toggleChapterMenu(subject) {
    const wrapper = document.getElementById(`${subject}-menu`);
    const overlay = document.getElementById('menu-overlay');

    if (wrapper && overlay) {
        wrapper.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function closeAllMenus() {
    document.querySelectorAll('.chapter-buttons-wrapper').forEach(wrapper => {
        wrapper.classList.remove('active');
    });
    const overlay = document.getElementById('menu-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Close menu when clicking overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('menu-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeAllMenus);
    }

    // Activate the subject the user picked on the home page (?s=science|social|math|language).
    // Falls back to whatever content-area already has the .active class for direct visits.
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('s');
    const allowed = ['science', 'social', 'math', 'language'];
    if (requested && allowed.includes(requested)) {
        const target = document.getElementById(requested);
        if (target && target.classList.contains('content-area')) {
            document.querySelectorAll('.content-area').forEach(area => area.classList.remove('active'));
            target.classList.add('active');
        }
    }

    // Sync the header subject badge with whichever content-area is now active
    const activeArea = document.querySelector('.content-area.active');
    if (activeArea && SUBJECT_META[activeArea.id]) {
        updateSubjectBadge(activeArea.id);
    }

    // Mark already-completed chapters in the sidebar. PEP loads with `defer` too,
    // so it should be ready by DOMContentLoaded — but guard with a microtask in
    // case load order ever changes.
    if (window.PEP) refreshChapterMenuState();
    else setTimeout(refreshChapterMenuState, 0);

    // Make YouTube Video Search Terms clickable
    document.querySelectorAll('.video-search ul li').forEach(li => {
        let text = li.textContent.trim();
        // Strip surrounding quotes if present
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
            text = text.slice(1, -1).trim();
        }
        // Create YouTube search link
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(text)}`;
        li.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });
});