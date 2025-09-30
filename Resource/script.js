function showSubject(subject) {
    // Hide all content areas
    document.querySelectorAll('.content-area').forEach(area => {
        area.classList.remove('active');
    });

    // Show selected content area
    document.getElementById(subject).classList.add('active');

    // Update button states
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Close any open hamburger menus
    closeAllMenus();
}

function showChapter(subject, chapterNum) {
    // Hide all chapters in this subject
    document.querySelectorAll(`#${subject} .chapter-content`).forEach(chapter => {
        chapter.classList.remove('active');
    });

    // Show selected chapter
    document.getElementById(`${subject}-chapter-${chapterNum}`).classList.add('active');

    // Update button states
    document.querySelectorAll(`#${subject} .chapter-btn`).forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll(`#${subject} .chapter-btn`)[chapterNum - 1].classList.add('active');

    // Close hamburger menu after selection (mobile)
    closeAllMenus();
}

function toggleChapterMenu(subject) {
    const wrapper = document.querySelector(`#${subject} .chapter-buttons-wrapper`);
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
});