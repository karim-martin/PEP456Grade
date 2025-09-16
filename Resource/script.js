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
}