// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const closeMenuButton = document.getElementById('close-menu');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.remove('translate-x-full');
});

closeMenuButton.addEventListener('click', () => {
    mobileMenu.classList.add('translate-x-full');
});

// Navigation highlight on scroll
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section[id]');
    const header = document.querySelector('header');

    function highlightNavOnScroll() {
        const scrollY = window.scrollY;

        // Add/remove scrolled class to header
        if (scrollY > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Highlight current section in navigation
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavOnScroll);
});

// Multi-step form handling
const form = document.getElementById('appointment-form');
const steps = document.querySelectorAll('.form-step');
const progressBar = document.querySelector('.progress-bar');
const stepIndicators = document.querySelectorAll('.step-indicator');
const nextBtn = document.querySelector('.next-step');
const prevBtn = document.querySelector('.prev-step');
const submitBtn = document.querySelector('.submit-form');
let currentStep = 0;

// Update progress bar and indicators
function updateProgress() {
    const progress = ((currentStep + 1) / steps.length) * 100;
    progressBar.style.width = `${progress}%`;
    
    stepIndicators.forEach((indicator, index) => {
        if (index === currentStep) {
            indicator.classList.add('active');
        } else if (index < currentStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else {
            indicator.classList.remove('active', 'completed');
        }
    });
}

// Show/hide steps
function showStep(stepIndex) {
    steps.forEach((step, index) => {
        step.classList.toggle('active', index === stepIndex);
    });

    // Update buttons
    prevBtn.classList.toggle('hidden', stepIndex === 0);
    nextBtn.classList.toggle('hidden', stepIndex === steps.length - 1);
    submitBtn.classList.toggle('hidden', stepIndex !== steps.length - 1);

    updateProgress();
}

// Handle next button click
nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
        if (currentStep === steps.length - 1) {
            updateSummary();
        }
    }
});

// Handle previous button click
prevBtn.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
});

// Validate each step
function validateStep(step) {
    const currentStepEl = steps[step];
    const inputs = currentStepEl.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value) {
            isValid = false;
            input.classList.add('border-red-500');
        } else {
            input.classList.remove('border-red-500');
        }
    });

    if (step === 1 && !document.querySelector('.service-option.selected')) {
        isValid = false;
        alert('Please select a service');
    }

    if (step === 2 && !document.querySelector('.time-slot.selected')) {
        isValid = false;
        alert('Please select an appointment time');
    }

    return isValid;
}

// Service selection
document.querySelectorAll('.service-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.service-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
    });
});

// Update summary
function updateSummary() {
    const name = document.querySelector('input[name="name"]').value;
    const service = document.querySelector('.service-option.selected h3').textContent;
    const dateTime = document.querySelector('.time-slot.selected').textContent;

    document.querySelector('.summary-name').textContent = name;
    document.querySelector('.summary-service').textContent = service;
    document.querySelector('.summary-datetime').textContent = dateTime;
}

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
        try {
            // Generate a unique child key
            const childKey = 'child_' + Math.random().toString(36).substr(2, 9);
            
            // Collect form data
            const formData = {
                child_key: childKey,
                name: document.querySelector('input[name="name"]').value,
                email: document.querySelector('input[name="email"]').value,
                phone: document.querySelector('input[name="phone"]').value,
                insurance: document.querySelector('input[name="insurance"]').value,
                service: document.querySelector('.service-option.selected h3').textContent,
                dateTime: document.querySelector('.time-slot.selected').textContent,
                notes: document.querySelector('textarea[name="notes"]').value,
                timestamp: new Date().toISOString()
            };

            console.log('Form data being sent:', formData);

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';

            // Send data to both Zapier and Google Drive
            const [zapierResponse, googleResponse] = await Promise.all([
                // Send to Zapier
                fetch('https://hooks.zapier.com/hooks/catch/16248818/2ck0eqv/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                }).catch(error => {
                    console.error('Zapier fetch error:', error);
                    return { ok: false, status: 'Zapier error', message: error.message };
                }),
                // Send to Google Apps Script
                fetch('https://script.google.com/macros/s/AKfycbyMe2B7m7eK_kSxS9vytY62M-xTo_n3hPo4Ax3vJuNfDaqhnW1Em9Xp-3YQoR-fbK5tsQ/exec', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                }).catch(error => {
                    console.error('Google Script fetch error:', error);
                    return { ok: false, status: 'Google Script error', message: error.message };
                })
            ]);

            // Get response data
            let zapierData, googleData;
            try {
                zapierData = await zapierResponse.json();
                console.log('Zapier Response:', zapierData);
            } catch (error) {
                console.error('Error parsing Zapier response:', error);
                zapierData = { message: 'Error parsing response' };
            }

            try {
                googleData = await googleResponse.json();
                console.log('Google Response:', googleData);
            } catch (error) {
                console.error('Error parsing Google response:', error);
                googleData = { message: 'Error parsing response' };
            }

            if (zapierResponse.ok && googleResponse.ok) {
                // Create and show confirmation page
                const confirmationHTML = `
                    <div class="text-center py-12">
                        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Appointment Booked Successfully!</h3>
                        <p class="text-gray-600 mb-6">Your reference number is: <span class="font-bold">${childKey}</span></p>
                        <p class="text-gray-600 mb-8">We will send you a confirmation email shortly.</p>
                        <div class="space-y-4">
                            <p class="text-gray-600">Name: <span class="font-medium">${formData.name}</span></p>
                            <p class="text-gray-600">Service: <span class="font-medium">${formData.service}</span></p>
                            <p class="text-gray-600">Date & Time: <span class="font-medium">${formData.dateTime}</span></p>
                        </div>
                        <div class="mt-8">
                            <a href="#book" class="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-8 py-3 rounded-full text-lg hover:shadow-lg transition duration-300 inline-block">
                                Book Another Appointment
                            </a>
                        </div>
                    </div>
                `;

                // Replace the entire form container with confirmation
                const formContainer = document.querySelector('.bg-white.rounded-xl.shadow-xl.p-8');
                formContainer.innerHTML = confirmationHTML;
                
                // Reset form data
                form.reset();
                currentStep = 0;
            } else {
                // Check which service failed
                let errorMessage = 'Error submitting appointment:\n';
                if (!zapierResponse.ok) {
                    errorMessage += `\n- Zapier: ${zapierData.message || 'Unknown error'}`;
                }
                if (!googleResponse.ok) {
                    errorMessage += `\n- Google Sheet: ${googleData.message || 'Unknown error'}`;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error details:', error);
            console.error('Form data that failed to submit:', formData);
            
            // Show more detailed error message
            alert(`There was an error submitting your appointment:\n${error.message}\n\nPlease try again or contact us directly at (305) 269-1440.`);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Appointment';
        }
    }
});

// Initialize time slots
const timeSlots = document.getElementById('time-slots');
const times = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
];

times.forEach(time => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.textContent = time;
    slot.addEventListener('click', () => {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
    });
    timeSlots.appendChild(slot);
});

// Before/After image reveal on click
document.querySelectorAll('.before-after-card').forEach(card => {
    const blurElement = card.querySelector('.backdrop-blur-md');
    const clickInstruction = card.querySelector('p:last-child');
    
    card.addEventListener('click', function() {
        if (blurElement) {
            blurElement.classList.add('clicked');
            clickInstruction.style.opacity = '0';
        }
    });

    // Reset on mouse leave (optional)
    card.addEventListener('mouseleave', function() {
        if (blurElement && !blurElement.classList.contains('clicked')) {
            clickInstruction.style.opacity = '0';
        }
    });
});

// Instagram Carousel Functionality
let currentSlide = 0;
const feed = document.querySelector('.instagram-feed');
const posts = document.querySelectorAll('.instagram-post');
const postWidth = 328; // 300px + 28px margin

function moveCarousel(direction) {
    const maxSlides = posts.length - 1;
    currentSlide = Math.max(0, Math.min(currentSlide + direction, maxSlides));
    
    feed.style.transform = `translateX(-${currentSlide * postWidth}px)`;
}

// Initialize carousel position
feed.style.transform = `translateX(0)`;

// Service card animations
const serviceCards = document.querySelectorAll('.service-card');
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

serviceCards.forEach(card => {
    observer.observe(card);
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
}); 