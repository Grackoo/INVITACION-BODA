document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. HERO CAROUSEL LOGIC ---
    // STRICT requirement: automatic change every 1 second with a smooth fade
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;

    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3000);
    }

    // --- 2. COUNTDOWN LOGIC ---
    // Target date from implementation plan: December 8, 2026 16:00:00 (assuming 4 PM based on ceremony time we set)
    const targetDate = new Date('December 8, 2026 16:00:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            daysEl.textContent = days.toString().padStart(2, '0');
            hoursEl.textContent = hours.toString().padStart(2, '0');
            minutesEl.textContent = minutes.toString().padStart(2, '0');
        } else {
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minutesEl.textContent = "00";
        }
    }

    // Update every minute (or second, since we only show min, updating every second is perfectly safe but we can update every minute if we prefer)
    // We update every second to make sure it's accurate and triggers cleanly across minute boundaries.
    updateCountdown();
    setInterval(updateCountdown, 1000);


    // --- 3. BACKGROUND MINI HOUSES ANIMATION ---
    const balloonsContainer = document.getElementById('balloons-container');
    
    function createMiniHouse() {
        if (!balloonsContainer) return;
        const house = document.createElement('div');
        house.classList.add('mini-house');

        const leftPosition = Math.random() * 100; // 0 to 100 vw
        
        // Factor de profundidad / tamaño (0.0 a 1.0)
        // Pequeño = background (lento), Grande = foreground (rápido)
        const sizeFactor = Math.random(); 
        const sizePx = 40 + (sizeFactor * 80); // 40px hasta 120px ancho
        
        house.style.width = `${sizePx}px`;
        house.style.height = `${sizePx * 1.5}px`; 
        
        // Velocidad con parallax inverso (los grandes van más rápido que los pequeños del fo ndo)
        const animationDuration = 30 - (sizeFactor * 15); // de 30s a 15s
        
        house.style.left = `${leftPosition}vw`;
        house.style.animationDuration = `${animationDuration}s`;

        balloonsContainer.appendChild(house);

        // Remover cuando termine su vuelo
        setTimeout(() => {
            house.remove();
        }, animationDuration * 1000);
    }

    // Sembrar una armada inicial (para que no esté vacío al inicio)
    for (let i = 0; i < 15; i++) {
        setTimeout(createMiniHouse, Math.random() * 5000);
    }
    
    // Generación continua e incesante de casitas miniaturas
    setInterval(createMiniHouse, 900);


    // --- 4. RSVP FORM SUBMISSION ---
    const rsvpForm = document.getElementById('rsvp-form');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');
    
    // Lógica condicional para el número de acompañantes
    const attendanceSelect = document.getElementById('attendance');
    const guestsGroup = document.getElementById('guests-group');
    const guestsInput = document.getElementById('guests');
    
    if (attendanceSelect && guestsGroup && guestsInput) {
        attendanceSelect.addEventListener('change', (e) => {
            if (e.target.value === 'yes') {
                guestsGroup.style.display = 'block';
                guestsInput.required = true;
            } else {
                guestsGroup.style.display = 'none';
                guestsInput.required = false;
                guestsInput.value = ''; // limpiar en caso de que cambie a no asiste
            }
        });
    }

    // Using user-provided script URL
    const googleAppsScriptURL = 'https://script.google.com/macros/s/AKfycby3gxt1lYxiuEADYJlqMU6aPJp62C3alXc5dJjvN7ldySGNArkFxTb_TQOkUyKghwEGbg/exec';

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Native validation check (HTML5) is handled automatically, but we can do extra checks if we want.
            const formData = new FormData(rsvpForm);
            
            // El backend de Google Apps Script espera leer un JSON de e.postData.contents
            const payload = {
                nombre: formData.get('fullName'),
                telefono: formData.get('phone'),
                asistencia: formData.get('attendance'),
                acompanantes: formData.get('guests'),
                mensaje: "Respuesta desde Web"
            };
            
            // UI feedback
            submitBtn.classList.add('loading');
            submitBtn.innerHTML = '<span>Enviando...</span>';
            formMessage.className = 'form-message hidden';

            try {
                // Post to Google Apps Script enviando la cadena JSON en el body
                await fetch(googleAppsScriptURL, {
                    method: 'POST',
                    mode: 'no-cors', // Evita bloqueo CORS al navegador
                    headers: {
                        'Content-Type': 'text/plain' // Se usa text/plain para que no haga options preflight, e.postData.contents extraerá el texto sin problema
                    },
                    body: JSON.stringify(payload)
                });

                // Al usar no-cors la respuesta es opaca, si no lanza error de red, la asuminos exitosa.
                formMessage.textContent = '¡Gracias! Hemos recibido tu confirmación correctamente.';
                formMessage.className = 'form-message success';
                rsvpForm.reset();
            } catch (error) {
                console.error('Error submitting form:', error);
                formMessage.textContent = 'Hubo un error de conexión al enviar. Por favor intenta más tarde.';
                formMessage.className = 'form-message error';
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.innerHTML = '<span>Enviar Confirmación</span>';
            }
        });
    }

    // --- 5. AUDIO PLAYER LOGIC ---
    const musicBtn = document.getElementById('music-btn');
    const bgMusic = document.getElementById('bg-music');

    if (musicBtn && bgMusic) {
        bgMusic.volume = 0.5; // Start with half volume so it's not too loud

        musicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().then(() => {
                    musicBtn.classList.add('playing');
                    musicBtn.innerHTML = '⏸️'; 
                }).catch(error => {
                    console.error("Playback failed: ", error);
                });
            } else {
                bgMusic.pause();
                musicBtn.classList.remove('playing');
                musicBtn.innerHTML = '🎵';
            }
        });
    }

    // --- 6. GIFTS MODAL LOGIC ---
    const giftsList = [
        { name: "Juego De Sábanas Matrimonial Microfibra Premium", link: "https://www.mercadolibre.com.mx/p/MLM27394715" },
        { name: "Buró Mesita De Noche Con Usb Y Cajón", link: "https://www.mercadolibre.com.mx/up/MLMU3115788539" },
        { name: "Mueble De Tv Moderno De Madera Flotante Con Luces Led", link: "https://www.mercadolibre.com.mx/up/MLMU3841330510" },
        { name: "Artic Jarra De Vidrio De 2.8 Lt Con Refrigerante", link: "https://www.mercadolibre.com.mx/up/MLMU720384769" },
        { name: "Set 2 De Mesas De Centro Y Auxiliar", link: "https://www.mercadolibre.com.mx/p/MLM54484894" },
        { name: "Lámpara de pie Moderna Rgb Inteligente", link: "https://www.mercadolibre.com.mx/p/MLM54943595" },
        { name: "Dispensador De Agua Eléctrico Tarwik", link: "https://www.mercadolibre.com.mx/p/MLM45569075" },
        { name: "Batidora De Mano Inmersión Con 8 Accesorios", link: "https://articulo.mercadolibre.com.mx/MLM-4032682290" },
        { name: "Edredón Ligero King Doble Vista", link: "https://articulo.mercadolibre.com.mx/MLM-2347765935" },
        { name: "Plancha De Ropa Con Suela Cerámica Vapor Vertical", link: "https://www.mercadolibre.com.mx/up/MLMU562816502" },
        { name: "Buro Alto 6 Niveles con Luz Led", link: "https://www.mercadolibre.com.mx/p/MLM62062607" },
        { name: "Ventilador De Pedestal Mytek 18 Pulgadas", link: "https://www.mercadolibre.com.mx/p/MLM18054226" },
        { name: "Cerámica Juego De Baño 4 Piezas", link: "https://articulo.mercadolibre.com.mx/MLM-2265329525" },
        { name: "Juego Sábanas Matrimonial Tacto Algodón Egipcio", link: "https://articulo.mercadolibre.com.mx/MLM-2052191723" },
        { name: "Funda Cubre Sillones Sala Sofá 3pz Azul Marino", link: "https://www.mercadolibre.com.mx/p/MLM61105918" },
        { name: "Set 6 Pzs Fundas Protectora Elástica Para Silla Comedor", link: "https://articulo.mercadolibre.com.mx/MLM-3112491480" },
        { name: "Mantel Protector De Mesa Transparente", link: "https://www.mercadolibre.com.mx/p/MLM56674797" },
        { name: "Set 3 Repisas Flotantes 80x20cm Dos Colores", link: "https://articulo.mercadolibre.com.mx/MLM-2471693293" }
    ];

    const openGiftsBtn = document.getElementById('open-gifts-btn');
    const closeGiftsBtn = document.getElementById('close-modal-btn');
    const giftsModal = document.getElementById('gifts-modal');
    const giftsListContainer = document.getElementById('gifts-list-container');

    if (openGiftsBtn && giftsModal) {
        // Generar lista dinamicamente
        giftsList.forEach(gift => {
            const itemHTML = `
                <div class="gift-item">
                    <div class="gift-title">${gift.name}</div>
                    <a href="${gift.link}" target="_blank" class="btn primary-btn">Ver en Mercado Libre 🛒</a>
                </div>
            `;
            giftsListContainer.insertAdjacentHTML('beforeend', itemHTML);
        });

        // Eventos para abrir/cerrar
        openGiftsBtn.addEventListener('click', () => {
            giftsModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevenir scroll al abrir modal
        });

        closeGiftsBtn.addEventListener('click', () => {
            giftsModal.classList.add('hidden');
            document.body.style.overflow = ''; 
        });

        // Cerrar al clickear fuera del modal
        giftsModal.addEventListener('click', (e) => {
            if (e.target === giftsModal) {
                giftsModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

});
