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


    // --- 3. BACKGROUND BALLOONS ANIMATION (DESACTIVADO A FAVOR DEL FONDO ESTÁTICO) ---
    /*
    const balloonsContainer = document.getElementById('balloons-container');
    const balloonColors = ['#FF4500', '#FFD700', '#1E90FF', '#FF00FF', '#32CD32']; // Rojo, Amarillo, Azul, Magenta, Verde

    function createBalloon() {
        if (!balloonsContainer) return;
        const balloon = document.createElement('div');
...
    // Generate new balloons periodically
    setInterval(createBalloon, 3500);
    */


    // --- 4. RSVP FORM SUBMISSION ---
    const rsvpForm = document.getElementById('rsvp-form');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');
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

});
