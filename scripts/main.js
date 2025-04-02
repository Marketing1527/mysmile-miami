// Mobile menu functionality
const mobileMenuButton = document.querySelector('.md\\:hidden');
const mobileMenu = document.querySelector('.mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Intersection Observer for animations
const animatedElements = document.querySelectorAll('.animate-fade-in');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

animatedElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    observer.observe(element);
});

// Form handling
const appointmentForm = document.querySelector('#appointment-form');

appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(appointmentForm);
    const submitButton = appointmentForm.querySelector('button[type="submit"]');
    
    try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="loading-spinner"></div>';
        
        // Add your form submission logic here
        // For example:
        // await fetch('/api/appointments', {
        //     method: 'POST',
        //     body: formData
        // });
        
        // Show success message
        alert('Thank you! We will contact you shortly to confirm your appointment.');
        appointmentForm.reset();
    } catch (error) {
        alert('There was an error submitting your appointment request. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Book Appointment';
    }
});

// Before/After image comparison slider
const comparisonSliders = document.querySelectorAll('.comparison-slider');

comparisonSliders.forEach(slider => {
    const beforeImage = slider.querySelector('.before-image');
    const afterImage = slider.querySelector('.after-image');
    const handle = slider.querySelector('.slider-handle');
    
    let isResizing = false;
    
    const resize = (e) => {
        if (!isResizing) return;
        
        const rect = slider.getBoundingClientRect();
        const x = Math.min(Math.max(0, e.pageX - rect.left), rect.width);
        const percent = (x / rect.width) * 100;
        
        handle.style.left = `${percent}%`;
        beforeImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    };
    
    handle.addEventListener('mousedown', () => {
        isResizing = true;
    });
    
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', () => {
        isResizing = false;
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            mobileMenu.classList.remove('active');
        }
    });
});

// Calendar functionality for appointment booking
const calendar = document.querySelector('#appointment-calendar');
if (calendar) {
    // Initialize calendar with available dates
    // This is a placeholder - you'll need to integrate with your actual calendar system
    const today = new Date();
    const availableDates = [];
    
    for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Example: make weekdays available
        if (date.getDay() !== 0 && date.getDay() !== 6) {
            availableDates.push(date);
        }
    }
    
    // Add your calendar initialization code here
    // For example, if using a library like FullCalendar:
    // new FullCalendar.Calendar(calendar, {
    //     initialView: 'dayGridMonth',
    //     selectable: true,
    //     events: availableDates.map(date => ({
    //         start: date,
    //         display: 'background'
    //     }))
    // }).render();
}

// Video optimization
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
    // Load video based on connection speed
    if (navigator.connection && navigator.connection.effectiveType.includes('4g')) {
        heroVideo.src = 'videos/hero-high.mp4';
    } else {
        heroVideo.src = 'videos/hero-low.mp4';
    }
    
    // Pause video when not in viewport
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroVideo.play();
            } else {
                heroVideo.pause();
            }
        });
    }, { threshold: 0.5 });
    
    videoObserver.observe(heroVideo);
} 