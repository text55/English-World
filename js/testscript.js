document.getElementById('submit-button').addEventListener('click', () => {
    const form = document.getElementById('quiz-form');
    const resultDiv = document.getElementById('result');
    const scoreText = document.getElementById('score-text');
    const nextButton = document.getElementById('next-button');

    // Все вопросы
    const questions = form.querySelectorAll('.question');
    let correctAnswers = 0;

    questions.forEach((question) => {
        const selected = question.querySelector('input[type="radio"]:checked');
        if (selected && selected.value === 'correct') {
            correctAnswers++;
        }
    });

    // Подсчёт процентов
    const totalQuestions = questions.length;
    const percentage = (correctAnswers / totalQuestions) * 100;

    // Определение оценки
    let grade;
    if (percentage >= 80) {
        grade = 5;
    } else if (percentage >= 60) {
        grade = 4;
    } else if (percentage >= 40) {
        grade = 3;
    } else {
        grade = 2;
    }

    // localStorage
    const progress = JSON.parse(localStorage.getItem('progress')) || { testsTaken: 0, totalCorrect: 0, totalQuestions: 0 };
    progress.testsTaken++;
    progress.totalCorrect += correctAnswers;
    progress.totalQuestions += totalQuestions;
    localStorage.setItem('progress', JSON.stringify(progress));

    // Вывод результата
    scoreText.textContent = `Ваш результат: ${correctAnswers} из ${totalQuestions}. Ваша оценка: ${grade}.`;
    resultDiv.classList.remove('hidden');
    nextButton.classList.remove('hidden');
});

document.getElementById('next-button').addEventListener('click', () => {
    window.location.href = "../table/table.html";
});
