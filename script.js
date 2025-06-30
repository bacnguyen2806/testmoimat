document.addEventListener('DOMContentLoaded', () => {
    // --- LẤY CÁC PHẦN TỬ HTML ---
    const backgroundAudio = document.getElementById('background-audio');
    const introAudio = document.getElementById('intro-audio');
    const pageTurnSound = document.getElementById('page-turn-sound');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    
    const questionAudios = Array.from(document.querySelectorAll('#question-audios audio'));
    const resultAudios = Array.from(document.querySelectorAll('#result-audios audio'));
    
    const part1 = document.getElementById('part1');
    const startBtn = document.getElementById('start-btn');
    const part2 = document.getElementById('part2');
    
    const resultWrapper = document.getElementById('result-wrapper');
    const part3 = document.getElementById('part3');
    const resultText = document.getElementById('result-text');
    const restartBtn = document.getElementById('restart-btn');

    const questionTitle = document.getElementById('question-title');
    const levelOptions = document.querySelectorAll('input[name="level"]');
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    const resultsBtn = document.getElementById('results-btn');
    
    // --- DỮ LIỆU VÀ TRẠNG THÁI ---
    const questions = [
        "Bạn có cảm thấy khó chịu quanh mắt?", "Mắt bạn có bị khô không?", "Mắt bạn có bị ngứa, châm chích?",
        "Mắt bạn có cảm giác đau?", "Bạn có cảm giác nặng mí mắt?", "Mắt bạn có cảm giác căng không?",
        "Mắt bạn có nhạy cảm với ánh sáng không?", "Khi sử dụng điện thoại di động hoặc máy tính, độ sáng của màn hình có gây khó chịu cho mắt bạn không?",
        "Bạn có phải nheo mắt?", "Bạn có cảm thấy vất vả khi nhìn gần?", "Mắt bạn có bị mờ hoặc nhoè khi nhìn gần?",
        "Bạn có cảm thấy đọc chậm hơn do các triệu chứng ở mắt?", "Bạn có cảm thấy khó chịu khi nhìn vào các vật thể chuyển động?",
        "Bạn có thiếu tập trung khi sử dụng mắt?", "Bạn có thấy khó nhớ những gì vừa đọc?",
        "Bạn có bị chóng mặt hay đau đầu khi sử dụng mắt không?", "Sự khó chịu về mắt có khiến bạn cảm thấy lo lắng hay chán nản không?"
    ];

    let currentQuestionIndex = 0;
    let userAnswers = Array(questions.length).fill(0);
    let currentPlayingAudio = null;
    let isTurningPage = false; // Thêm biến cờ để tránh nhấn nút liên tục khi animation đang chạy

    // --- LOGIC CHÍNH ---

    function setupBackgroundMusic() {
        const playPromise = backgroundAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => updateSoundIcon()).catch(error => {
                document.body.addEventListener('click', () => backgroundAudio.play(), { once: true });
            });
        }
        soundToggleBtn.addEventListener('click', () => {
            backgroundAudio.muted = !backgroundAudio.muted;
            updateSoundIcon();
        });
    }

    function updateSoundIcon() {
        soundToggleBtn.classList.toggle('sound-off', backgroundAudio.muted);
        soundToggleBtn.classList.toggle('sound-on', !backgroundAudio.muted);
    }

    setupBackgroundMusic();

    setTimeout(() => {
        introAudio.play();
    }, 4000);

    introAudio.onended = () => {
        startBtn.classList.remove('hidden');
    };

    startBtn.addEventListener('click', () => {
        part1.classList.add('hidden');
        part2.classList.remove('hidden');
        document.body.style.backgroundImage = "url('background_questions.jpg')";
        showQuestion(currentQuestionIndex);
    });

    function showQuestion(index) {
        if (currentPlayingAudio && !currentPlayingAudio.paused) {
            currentPlayingAudio.pause();
            currentPlayingAudio.currentTime = 0;
        }
        currentPlayingAudio = questionAudios[index];
        currentPlayingAudio.play().catch(e => console.error("Lỗi phát audio câu hỏi:", e));
        questionTitle.textContent = questions[index];
        const savedScore = userAnswers[index];
        levelOptions.forEach(radio => {
            radio.checked = (parseInt(radio.value) === savedScore);
        });
        backBtn.classList.toggle('hidden', index === 0);
        nextBtn.classList.toggle('hidden', index === questions.length - 1);
        resultsBtn.classList.toggle('hidden', index !== questions.length - 1);
    }
    
    // THAY ĐỔI: Hàm xử lý hiệu ứng lật trang và timing
    function turnPage(direction) {
        if (isTurningPage) return; // Nếu đang lật trang thì không làm gì cả
        isTurningPage = true;

        playPageTurnSound();
        part2.classList.add('is-turning-out');

        // Lắng nghe sự kiện khi animation "lật đi" kết thúc
        part2.addEventListener('animationend', () => {
            // Cập nhật chỉ số câu hỏi
            if (direction === 'next') {
                currentQuestionIndex++;
            } else if (direction === 'back') {
                currentQuestionIndex--;
            }

            // Cập nhật nội dung câu hỏi mới
            showQuestion(currentQuestionIndex);

            // Gỡ bỏ các class animation cũ và thêm class cho animation "lật vào"
            part2.classList.remove('is-turning-out');
            part2.classList.add('is-turning-in');

            // Lắng nghe sự kiện khi animation "lật vào" kết thúc để reset trạng thái
            part2.addEventListener('animationend', () => {
                part2.classList.remove('is-turning-in');
                isTurningPage = false; // Reset cờ, cho phép nhấn nút tiếp
            }, { once: true });

        }, { once: true }); // { once: true } để event listener chỉ chạy 1 lần
    }

    function saveCurrentAnswer() {
        const selectedOption = document.querySelector('input[name="level"]:checked');
        userAnswers[currentQuestionIndex] = selectedOption ? parseInt(selectedOption.value) : 0;
    }

    function playPageTurnSound() {
        const sound = pageTurnSound.cloneNode(true);
        sound.volume = 0.7;
        sound.play().catch(e => console.error("Lỗi âm thanh lật trang:", e));
    }

    nextBtn.addEventListener('click', () => {
        saveCurrentAnswer();
        turnPage('next');
    });

    backBtn.addEventListener('click', () => {
        saveCurrentAnswer();
        turnPage('back');
    });

    resultsBtn.addEventListener('click', () => {
        saveCurrentAnswer();
        calculateAndShowResults();
    });

    function calculateAndShowResults() {
        if (currentPlayingAudio) currentPlayingAudio.pause();
        const totalScore = userAnswers.reduce((sum, score) => sum + score, 0);
        let resultString = '';
        let resultAudio = null;

        if (totalScore <= 12) resultString = "Không mỏi mắt", resultAudio = resultAudios[0];
        else if (totalScore <= 17) resultString = "Mỏi mắt nhẹ", resultAudio = resultAudios[1];
        else if (totalScore <= 33) resultString = "Mỏi mắt trung bình", resultAudio = resultAudios[2];
        else resultString = "Mỏi mắt nặng", resultAudio = resultAudios[3];
        
        part2.classList.add('hidden');
        resultWrapper.classList.remove('hidden');
        document.body.style.backgroundImage = "url('background_main.jpg')";
        
        part3.classList.add('is-visible');

        resultText.innerHTML = '';

        if (resultAudio) {
            resultAudio.play().catch(e => console.error("Lỗi phát audio kết quả:", e));
            resultAudio.onended = () => {
                restartBtn.classList.add('is-visible');
            };
        } else {
            restartBtn.classList.add('is-visible');
        }
        
        setTimeout(() => {
            const letters = resultString.split('').map(char => `<span>${char === ' ' ? '&nbsp;' : char}</span>`).join('');
            resultText.innerHTML = letters;
            const letterSpans = resultText.querySelectorAll('span');
            letterSpans.forEach((span, index) => {
                span.style.animationDelay = `${index * 0.05}s`;
            });
            resultText.classList.add('is-visible');
        }, 3000);
    }

    function resetTest() {
        userAnswers.fill(0);
        currentQuestionIndex = 0;
        isTurningPage = false; // Quan trọng: reset cờ lật trang

        resultWrapper.classList.add('hidden');
        part3.classList.remove('is-visible');
        resultText.classList.remove('is-visible');
        restartBtn.classList.remove('is-visible');
        resultText.innerHTML = '';

        part2.classList.remove('hidden');
        document.body.style.backgroundImage = "url('background_questions.jpg')";
        showQuestion(currentQuestionIndex);
    }

    restartBtn.addEventListener('click', resetTest);
});