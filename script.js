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
    let isTurningPage = false;

    // --- LOGIC CHÍNH ---

    // Cài đặt nút bật/tắt âm thanh
    soundToggleBtn.addEventListener('click', () => {
        backgroundAudio.muted = !backgroundAudio.muted;
        updateSoundIcon();
    });

    function updateSoundIcon() {
        soundToggleBtn.classList.toggle('sound-off', backgroundAudio.muted);
        soundToggleBtn.classList.toggle('sound-on', !backgroundAudio.muted);
    }

    // XỬ LÝ KHI NHẤN NÚT BẮT ĐẦU
    startBtn.addEventListener('click', () => {
        // Cú nhấp chuột của người dùng đã "mở khóa" quyền phát âm thanh cho trình duyệt
        console.log("Start button clicked. Unlocking audio...");

        // 1. Phát nhạc nền và cập nhật icon
        backgroundAudio.play().catch(e => console.error("Lỗi phát nhạc nền:", e));
        updateSoundIcon();

        // 2. Phát audio giới thiệu
        introAudio.play().catch(e => console.error("Lỗi phát audio giới thiệu:", e));

        // 3. Ẩn nút bắt đầu đi để người dùng không nhấn lần nữa
        startBtn.classList.add('hidden');

        // 4. SAU KHI audio giới thiệu phát xong, mới chuyển sang phần câu hỏi
        introAudio.onended = () => {
            console.log("Intro audio ended. Starting quiz...");
            part1.classList.add('hidden');
            part2.classList.remove('hidden');
            document.body.style.backgroundImage = "url('background_questions.jpg')";
            showQuestion(currentQuestionIndex);
        };
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

    function turnPage(direction) {
        if (isTurningPage) return;
        isTurningPage = true;

        playPageTurnSound();
        part2.classList.add('is-turning-out');

        part2.addEventListener('animationend', () => {
            if (direction === 'next') {
                currentQuestionIndex++;
            } else if (direction === 'back') {
                currentQuestionIndex--;
            }

            showQuestion(currentQuestionIndex);

            part2.classList.remove('is-turning-out');
            part2.classList.add('is-turning-in');

            part2.addEventListener('animationend', () => {
                part2.classList.remove('is-turning-in');
                isTurningPage = false;
            }, { once: true });

        }, { once: true });
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
        isTurningPage = false;

        resultWrapper.classList.add('hidden');
        part3.classList.remove('is-visible');
        resultText.classList.remove('is-visible');
        restartBtn.classList.remove('is-visible');
        resultText.innerHTML = '';

        part1.classList.remove('hidden'); // Hiển thị lại màn hình bắt đầu
        startBtn.classList.remove('hidden'); // Hiển thị lại nút bắt đầu
        document.body.style.backgroundImage = "url('background_main.jpg')";
    }
    
    // Sửa hàm reset để nó quay về màn hình đầu tiên một cách chính xác
    restartBtn.addEventListener('click', () => {
        userAnswers.fill(0);
        currentQuestionIndex = 0;
        isTurningPage = false; 

        resultWrapper.classList.add('hidden');
        part3.classList.remove('is-visible');
        resultText.classList.remove('is-visible');
        restartBtn.classList.remove('is-visible');
        resultText.innerHTML = '';
        
        // Không hiện câu hỏi ngay mà quay về màn hình chờ nhấn nút bắt đầu
        part1.classList.remove('hidden');
        startBtn.classList.remove('hidden'); 
        document.body.style.backgroundImage = "url('background_main.jpg')";
    });
});
