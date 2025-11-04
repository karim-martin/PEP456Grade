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

    // Close hamburger menu after selection (mobile)
    closeAllMenus();
}

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