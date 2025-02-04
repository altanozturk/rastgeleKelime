let words = [];
let scoreA = 0;
let scoreB = 0;
let currentTeam = 'A'; // Hangi takımın sırası olduğunu tutacak
let gameStarted = false;
let timeLeft = 15; // 15 saniyeye düşürdük
let timerInterval;
let teamAName = '';
let teamBName = '';
let selectedTime = 60; // Varsayılan süre 1 dakika
let selectedRounds = 3; // Varsayılan el sayısını 3 yap
let currentRound = 0; // Mevcut el sayısını tutacak değişken
let totalRounds = 0; // Toplam oynanacak el sayısı (her takım için ayrı)

// Tüm kelimeleri bir dizide toplama
function getAllWords() {
    fetch('words.json')
        .then(response => response.json())
        .then(data => {
            // İsimler kategorisindeki tüm alt kategorilerin kelimelerini birleştir
            for (let category in data.isimler) {
                words = words.concat(data.isimler[category]);
            }
        });
}

// Rastgele kelime seçme
function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

// Yeni kelime gösterme
function getNewWord() {
    const wordElement = document.getElementById('word');
    wordElement.textContent = getRandomWord();
}

// Skoru güncelleme
function updateScore() {
    const scoreElementA = document.getElementById('scoreA');
    const scoreElementB = document.getElementById('scoreB');
    scoreElementA.textContent = scoreA;
    scoreElementB.textContent = scoreB;
}

// Timer'ı güncelleme
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Takım göstergesini güncelleme
function updateTeamDisplay() {
    const teamDisplay = document.getElementById('currentTeamDisplay');
    teamDisplay.textContent = currentTeam === 'A' ? teamAName : teamBName;
}

// Timer'ı başlatma
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = selectedTime;
    updateTimer();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endTurn();
        }
    }, 1000);
}

// Takım isimlerini ayarlama ve oyunu başlatma
function initializeGame() {
    const teamAInput = document.getElementById('teamAName');
    const teamBInput = document.getElementById('teamBName');
    
    // Boş input kontrolü
    if (!teamAInput.value.trim() || !teamBInput.value.trim()) {
        // Input'ları kırmızı yap ve uyarı ver
        if (!teamAInput.value.trim()) {
            teamAInput.style.borderColor = '#ff6b6b';
            teamAInput.classList.add('shake');
            setTimeout(() => teamAInput.classList.remove('shake'), 500);
        }
        if (!teamBInput.value.trim()) {
            teamBInput.style.borderColor = '#ff6b6b';
            teamBInput.classList.add('shake');
            setTimeout(() => teamBInput.classList.remove('shake'), 500);
        }
        return; // Fonksiyonu sonlandır
    }
    
    teamAName = teamAInput.value.trim();
    teamBName = teamBInput.value.trim();
    
    // Oyun değişkenlerini sıfırla
    scoreA = 0;
    scoreB = 0;
    currentRound = 0;
    totalRounds = selectedRounds * 2; // Her takım için seçilen el sayısı kadar
    currentTeam = 'A';
    
    // Takım isimlerini güncelle
    document.getElementById('teamALabel').textContent = teamAName;
    document.getElementById('teamBLabel').textContent = teamBName;
    
    // Timer'ı seçilen süreye ayarla
    timeLeft = selectedTime;
    updateTimer();
    
    // Modal'ı gizle ve oyun container'ını göster
    document.getElementById('teamNamesModal').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
}

// Sıranın bitişi
function endTurn() {
    gameStarted = false;
    clearInterval(timerInterval);
    
    // Butonları gizle
    document.getElementById('passButton').style.display = 'none';
    document.getElementById('correctButton').style.display = 'none';
    
    // El sayısını artır
    currentRound++;
    
    // Oyun bitti mi kontrol et
    if (currentRound >= totalRounds) {
        // Oyun bitti
        const wordElement = document.getElementById('word');
        const startButton = document.getElementById('startButton');
        const restartButton = document.getElementById('restartButton');
        
        // Kazananı belirle
        let winnerMessage;
        if (scoreA > scoreB) {
            winnerMessage = `Oyun Bitti!\n${teamAName} kazandı! (${scoreA}-${scoreB})`;
        } else if (scoreB > scoreA) {
            winnerMessage = `Oyun Bitti!\n${teamBName} kazandı! (${scoreA}-${scoreB})`;
        } else {
            winnerMessage = `Oyun Bitti!\nBerabere! (${scoreA}-${scoreB})`;
        }
        
        wordElement.textContent = winnerMessage;
        startButton.style.display = 'none';
        restartButton.style.display = 'inline-block'; // Yeniden başlat butonunu göster
        return;
    }
    
    // Başlat butonunu göster
    document.getElementById('startButton').style.display = 'inline-block';
    
    // Önce mesajı göster, sonra takımı değiştir
    const wordElement = document.getElementById('word');
    const nextTeam = currentTeam === 'A' ? 'B' : 'A';  // Bir sonraki takımı belirle
    const nextTeamName = nextTeam === 'A' ? teamAName : teamBName;
    wordElement.textContent = 'Sıra ' + nextTeamName + ' Takımında!';
    
    // Takımı değiştir
    switchTeam();
}

// Sırayı değiştirme
function switchTeam() {
    currentTeam = currentTeam === 'A' ? 'B' : 'A';
    updateTeamDisplay();
}

// Oyunu başlatma
function startGame() {
    gameStarted = true;
    
    // Başlat butonunu gizle
    document.getElementById('startButton').style.display = 'none';
    
    // Pas ve Doğru butonlarını göster
    document.getElementById('passButton').style.display = 'inline-block';
    document.getElementById('correctButton').style.display = 'inline-block';
    
    startTimer();
    updateTeamDisplay();
    getNewWord();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    getAllWords();
    
    // Başlangıçta current team göstergesini gizle
    document.querySelector('.current-team').style.display = 'none';

    // Karşılama ekranından takım formu ekranına geçiş
    document.getElementById('welcomeStartButton').addEventListener('click', () => {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('teamNamesModal').style.display = 'flex';
    });

    const startButton = document.getElementById('startButton');
    const passButton = document.getElementById('passButton');
    const correctButton = document.getElementById('correctButton');

    startButton.addEventListener('click', () => {
        // Oyun başladığında current team göstergesini göster
        document.querySelector('.current-team').style.display = 'block';
        startGame();
    });

    passButton.addEventListener('click', () => {
        if (gameStarted) {
            getNewWord();
        }
    });

    correctButton.addEventListener('click', () => {
        if (gameStarted) {
            // Doğru bildiğinde mevcut takımın puanını artır
            if (currentTeam === 'A') {
                scoreA++;
            } else {
                scoreB++;
            }
            updateScore();
            getNewWord();
        }
    });

    // Modal başlat butonu
    document.getElementById('startGameButton').addEventListener('click', () => {
        initializeGame();
    });

    // Enter tuşu ile de formu gönderme
    const inputs = document.querySelectorAll('.team-input input');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                initializeGame();
            }
        });
    });

    // Input'lara focus olduğunda kırmızı kenarlığı kaldır
    const inputsFocus = document.querySelectorAll('.team-input input');
    inputsFocus.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.borderColor = 'rgba(108, 92, 231, 0.2)';
        });
    });

    // Süre seçenekleri için event listeners
    const timeOptions = document.querySelectorAll('.time-option');
    timeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Önceki seçimi kaldır
            timeOptions.forEach(opt => opt.classList.remove('selected'));
            // Yeni seçimi işaretle
            option.classList.add('selected');
            // Seçilen süreyi kaydet
            selectedTime = parseInt(option.dataset.seconds);
            // Timer'ı güncelle
            timeLeft = selectedTime;
            updateTimer();
        });
    });

    // Varsayılan olarak 1 dakikayı seç
    document.querySelector('[data-seconds="60"]').classList.add('selected');

    // El sayısı input kontrolü
    const roundsInput = document.getElementById('roundsInput');
    
    roundsInput.addEventListener('change', () => {
        let value = parseInt(roundsInput.value);
        
        // Minimum ve maksimum değer kontrolü
        if (value < 1) {
            value = 1;
            roundsInput.value = 1;
        } else if (value > 50) {
            value = 50;
            roundsInput.value = 50;
        }
        
        selectedRounds = value;
    });

    // Input'a focus olduğunda border rengini değiştir
    roundsInput.addEventListener('focus', () => {
        roundsInput.style.borderColor = 'rgba(108, 92, 231, 0.2)';
    });

    // Yeniden başlat butonu için event listener
    document.getElementById('restartButton').addEventListener('click', () => {
        // Oyun containerını gizle
        document.querySelector('.container').style.display = 'none';
        
        // Karşılama ekranını göster
        document.getElementById('welcomeScreen').style.display = 'flex';
        
        // Butonları sıfırla
        document.getElementById('startButton').style.display = 'inline-block';
        document.getElementById('passButton').style.display = 'none';
        document.getElementById('correctButton').style.display = 'none';
        document.getElementById('restartButton').style.display = 'none';
        
        // Skoru sıfırla
        scoreA = 0;
        scoreB = 0;
        updateScore();
        
        // Diğer değişkenleri sıfırla
        currentRound = 0;
        totalRounds = 0;
        gameStarted = false;
        currentTeam = 'A';
        
        // Timer'ı sıfırla
        clearInterval(timerInterval);
        timeLeft = selectedTime;
        updateTimer();
        
        // Kelime alanını sıfırla
        document.getElementById('word').textContent = 'Oyuna Başla!';
    });
}); 