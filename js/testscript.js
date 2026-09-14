document.getElementById('submit-button').addEventListener('click', () => {
    const form = document.getElementById('quiz-form');
    const resultDiv = document.getElementById('result');
    const scoreText = document.getElementById('score-text');
    const nextButton = document.getElementById('next-button');

    // Ключ теста (например "test", "havegot") и правильные ответы к нему.
    // Ответы лежат в quizdata.js отдельно от разметки, а не в value радиокнопок.
    const quizKey = form.dataset.quiz;
    const answerKey = (typeof quizData !== 'undefined' && quizData[quizKey]) || {};

    // Все вопросы
    const questions = form.querySelectorAll('.question');

    // Проверяем, что пользователь ответил на все вопросы
    const unanswered = Array.from(questions).filter((question) => {
        return !question.querySelector('input[type="radio"]:checked');
    });
    if (unanswered.length > 0) {
        alert(`Пожалуйста, ответьте на все вопросы. Осталось: ${unanswered.length}.`);
        return;
    }

    let correctAnswers = 0;

    questions.forEach((question) => {
        const selected = question.querySelector('input[type="radio"]:checked');
        const radios = question.querySelectorAll('input[type="radio"]');
        const questionName = radios.length > 0 ? radios[0].name : null;
        const correctValue = questionName ? answerKey[questionName] : null;
        const isCorrect = !!selected && !!correctValue && selected.value === correctValue;

        if (isCorrect) {
            correctAnswers++;
        }

        // Подсветка правильного/неправильного ответа для каждого вопроса
        radios.forEach((radio) => {
            const label = radio.closest('label');
            if (!label) return;
            label.classList.remove('answer-correct', 'answer-incorrect');
            if (correctValue && radio.value === correctValue) {
                label.classList.add('answer-correct');
            } else if (radio.checked) {
                label.classList.add('answer-incorrect');
            }
        });
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
    const isPerfect = correctAnswers === totalQuestions;

    // Комментарий к результату: для общего теста уровня и для тем грамматики
    // используются разные формулировки.
    const isMainLevelTest = quizKey === 'test';
    const comments = isMainLevelTest
        ? {
            perfect: 'Идеально! Ты прекрасно знаешь английский!',
            5: 'Отличный результат! У тебя высокий уровень английского.',
            4: 'Хороший результат! Ещё немного практики — и будет отлично.',
            3: 'Неплохое начало! Есть куда расти — продолжай заниматься.',
            2: 'Это только начало пути! Регулярные занятия быстро дадут результат.',
        }
        : {
            perfect: 'Идеально! Тема усвоена на отлично!',
            5: 'Отлично! Ты хорошо разобрался в теме.',
            4: 'Хорошо! Тема в целом понятна, продолжай в том же духе.',
            3: 'Неплохо! Стоит повторить тему ещё раз для уверенности.',
            2: 'Пока сложно — и это нормально! Повтори правило и попробуй снова.',
        };
    const comment = isPerfect ? comments.perfect : comments[grade];

    const commentEl = document.getElementById('score-comment');
    if (commentEl) {
        commentEl.textContent = comment;
        commentEl.className = isPerfect ? 'grade-perfect' : `grade-${grade}`;
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

    // Блокируем выбор после отправки, чтобы результат и подсветка не менялись
    form.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.disabled = true;
    });
    document.getElementById('submit-button').disabled = true;
});

document.getElementById('next-button').addEventListener('click', () => {
    window.location.href = "../table/table.html";
});
