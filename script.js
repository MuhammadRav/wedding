document.addEventListener('DOMContentLoaded', () => {

    // Element Selection
    const floralCanvas = document.getElementById('floral-canvas');
    const heroSection = document.getElementById('hero-section');
    const mainContent = document.getElementById('main-content');
    const openInvitationBtn = document.getElementById('openInvitationBtn');
    const backgroundMusic = document.getElementById('background-music');
    const toggleMusicBtn = document.getElementById('toggleMusicBtn');
    const countdownTimerEl = document.getElementById('countdown-timer');
    const guestNameEl = document.querySelector('.guest-name');
    const rsvpForm = document.getElementById('rsvp-form');
    const showGiftButton = document.getElementById('showGiftButton');
    const giftCardContainer = document.getElementById('giftCardContainer');
    
    const playIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    const pauseIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;

    // ===== Main Logic =====

    // 1. Initial State
    document.body.style.overflow = 'hidden';
    mainContent.classList.add('hidden');
    toggleMusicBtn.innerHTML = playIconSVG;
    
    displayGuestName();
    updateCountdown();
    setupEventListeners();
    
    // ===== Floral Animation (No Changes) =====
    const ctx = floralCanvas.getContext('2d');
    let flowers = [];
    let loadedImages = [];
    const flowerImagePaths = ['foto/flower1.png', 'foto/flower2.png', 'foto/flower3.png', 'foto/flower4.png', 'foto/flower5.png'];
    let animationFrameId;

    function preloadImages(urls, callback) {
        let loadedCount = 0;
        if (urls.length === 0) {
            if (callback) callback();
            return;
        }
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                loadedCount++;
                loadedImages.push(img);
                if (loadedCount === urls.length) if (callback) callback();
            };
            img.onerror = () => {
                loadedCount++;
                console.error(`Failed to load image: ${url}`);
                if (loadedCount === urls.length) if (callback) callback();
            }
        });
    }
    
    function resizeCanvas() {
        floralCanvas.width = window.innerWidth;
        floralCanvas.height = window.innerHeight;
    }
    class Flower {
        constructor() {
            this.x = Math.random() * floralCanvas.width;
            this.y = Math.random() * floralCanvas.height - floralCanvas.height;
            this.size = Math.random() * 20 + 15;
            this.speed = Math.random() * 1 + 0.5;
            this.image = loadedImages[Math.floor(Math.random() * loadedImages.length)];
            this.rotation = Math.random() * 2 * Math.PI;
            this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        }
        update() {
            this.y += this.speed;
            this.rotation += this.rotationSpeed;
            if (this.y > floralCanvas.height + this.size) {
                this.y = -this.size;
                this.x = Math.random() * floralCanvas.width;
            }
        }
        draw() {
            if (!this.image || !this.image.complete || this.image.naturalHeight === 0) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }
    function initFlowers() {
        flowers = [];
        const numberOfFlowers = Math.floor(window.innerWidth / 50);
        for (let i = 0; i < numberOfFlowers; i++) {
            flowers.push(new Flower());
        }
    }
    function animate() {
        ctx.clearRect(0, 0, floralCanvas.width, floralCanvas.height);
        flowers.forEach(flower => {
            flower.update();
            flower.draw();
        });
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // ===== Functions =====
    
    function displayGuestName() {
        const urlParams = new URLSearchParams(window.location.search);
        const guest = urlParams.get('untuk');
        if (guest) {
            guestNameEl.textContent = guest.replace(/_/g, ' ');
        }
    }

    function updateCountdown() {
        const weddingDate = new Date('2027-07-20T10:00:00').getTime();
        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = weddingDate - now;
            if (distance < 0) {
                clearInterval(timerInterval);
                countdownTimerEl.innerHTML = "<h4>Acara Telah Selesai</h4>";
                return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            countdownTimerEl.innerHTML = `
                <div class="timer-box"><span>${days}</span><p>Hari</p></div>
                <div class="timer-box"><span>${hours}</span><p>Jam</p></div>
                <div class="timer-box"><span>${minutes}</span><p>Menit</p></div>
                <div class="timer-box"><span>${seconds}</span><p>Detik</p></div>`;
        }, 1000);
    }

    // --- FUNGSI INI DIUBAH ---
    function setupIntersectionObserver() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Jika elemen masuk ke layar, tambahkan kelas .is-visible
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } 
                // Jika elemen keluar dari layar, hapus kelas .is-visible agar animasi bisa terulang
                else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, { 
            threshold: 0.1 // Seberapa banyak elemen harus terlihat sebelum animasi main
        });

        elements.forEach(el => observer.observe(el));
    }

    function handleRsvpForm() {
        if (!rsvpForm) return;
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(rsvpForm);
            const submitButton = rsvpForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Mengirim...';

            fetch(rsvpForm.action, {
                method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    submitButton.textContent = 'Terkirim! Terima Kasih';
                    rsvpForm.reset();
                } else {
                    submitButton.textContent = 'Gagal, Coba Lagi';
                }
            }).catch(() => {
                submitButton.textContent = 'Gagal, Coba Lagi';
            }).finally(() => {
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }, 3000);
            });
        });
    }

    // ===== Event Listeners =====
    function setupEventListeners() {
        openInvitationBtn.addEventListener('click', () => {
            heroSection.style.transform = 'translateY(-100%)';
            document.body.style.overflow = 'auto';
            mainContent.classList.remove('hidden');

            if (backgroundMusic.paused) {
                backgroundMusic.play().catch(e => console.error("Autoplay was prevented:", e));
                toggleMusicBtn.innerHTML = pauseIconSVG;
                toggleMusicBtn.classList.add('playing');
            }
            
            setTimeout(() => {
                 setupIntersectionObserver();
            }, 500); // Dipersingkat agar animasi langsung aktif
        });

        toggleMusicBtn.addEventListener('click', () => {
            if (backgroundMusic.paused) {
                backgroundMusic.play();
                toggleMusicBtn.innerHTML = pauseIconSVG;
                toggleMusicBtn.classList.add('playing');
            } else {
                backgroundMusic.pause();
                toggleMusicBtn.innerHTML = playIconSVG;
                toggleMusicBtn.classList.remove('playing');
            }
        });

        if (showGiftButton && giftCardContainer) {
            showGiftButton.addEventListener('click', () => {
                giftCardContainer.classList.add('is-visible');
                showGiftButton.style.display = 'none';
            });
        }

        window.addEventListener('resize', () => {
            if(animationFrameId) cancelAnimationFrame(animationFrameId);
            resizeCanvas();
            initFlowers();
            animate();
        });

        const clipboard = new ClipboardJS('.copy-button');
        clipboard.on('success', function(e) {
            const originalText = e.trigger.textContent;
            e.trigger.textContent = 'Berhasil Disalin!';
            e.trigger.style.background = '#28a745';
            setTimeout(() => {
                e.trigger.textContent = originalText;
                e.trigger.style.background = '';
            }, 2000);
            e.clearSelection();
        });
        clipboard.on('error', function(e) {
            e.trigger.textContent = 'Gagal Menyalin';
             setTimeout(() => {
                e.trigger.textContent = 'Salin Rekening';
            }, 2000);
        });

        handleRsvpForm();
    }
    
    preloadImages(flowerImagePaths, () => {
        resizeCanvas();
        initFlowers();
        animate();
    });
});