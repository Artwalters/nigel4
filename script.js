// ====================================
// GLOBAL VARIABLES & MOBILE DETECTION
// ====================================
const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768 && !/iPad/i.test(navigator.userAgent));

// ====================================
// WEBGL DISPLACEMENT EFFECT
// ====================================
function initWebGLEffect() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    
    const gl = canvas.getContext("webgl");
    if (!gl) {
        console.warn("WebGL not supported, fallback to normal hero section");
        return;
    }

    let originalImage = { width: 1, height: 1 };
    const originalTexture = twgl.createTexture(gl, {
        src: "img/hero.webp", 
        crossOrigin: '',
    }, (err, texture, source) => {
        originalImage = source;
    });
    
    const mapTexture = twgl.createTexture(gl, {
        src: "img/hero_depth.jpeg", 
        crossOrigin: '',
    });

    const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
    const bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

    const mouse = [0, 0];
    let autoAnimTime = 0;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) {
        // Desktop - mouse control
        document.addEventListener('mousemove', (event) => {
            mouse[0] = (event.clientX / gl.canvas.clientWidth * 2 - 1) * -0.01;
            mouse[1] = (event.clientY / gl.canvas.clientHeight * 2 - 1) * -0.01;
        });
    } else {
        // Touch devices - touch control
        document.addEventListener('touchmove', (event) => {
            if (event.touches[0]) {
                mouse[0] = (event.touches[0].clientX / gl.canvas.clientWidth * 2 - 1) * -0.01;
                mouse[1] = (event.touches[0].clientY / gl.canvas.clientHeight * 2 - 1) * -0.01;
            }
        });
    }
    
    let nMouse = [0, 0];

    function sizeCanvasToDisplaySize(canvas) {
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;
        
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
        }
    }

    function render() {
        sizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(programInfo.program);
        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

        const canvasAspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const imageAspect = originalImage.width / originalImage.height;
        
        // Responsive zoom factor for all devices
        const screenWidth = window.innerWidth;
        let zoomFactor;
        
        if (isMobile) {
            // Mobile - fixed zoom, no scaling
            zoomFactor = 1.0;
        } else if (screenWidth <= 1200) {
            // Small laptops
            zoomFactor = 3.2;
        } else if (screenWidth <= 1600) {
            // Desktop
            zoomFactor = 3.0;
        } else {
            // Large screens
            zoomFactor = 2.8;
        }
        
        const mat = m3.scaling((imageAspect / canvasAspect) * zoomFactor, -1 * zoomFactor);
        
        // Disable auto animation for touch devices to prevent scaling
        if (isTouchDevice && !isMobile) {
            autoAnimTime += 0.01;
            // Create smooth circular motion
            const autoX = Math.sin(autoAnimTime * 0.5) * 0.008;
            const autoY = Math.cos(autoAnimTime * 0.7) * 0.006;
            mouse[0] = autoX;
            mouse[1] = autoY;
        } else if (isMobile) {
            // Keep mobile completely static
            mouse[0] = 0;
            mouse[1] = 0;
        }
        
        nMouse[0] += (mouse[0] - nMouse[0]) * 0.05;
        nMouse[1] += (mouse[1] - nMouse[1]) * 0.05;

        twgl.setUniforms(programInfo, {
            u_matrix: mat,
            u_originalImage: originalTexture,
            u_mapImage: mapTexture,
            u_mouse: nMouse,
            u_time: performance.now() * 0.001,
            u_resolution: [gl.canvas.width, gl.canvas.height],
        });
        
        twgl.drawBufferInfo(gl, bufferInfo);
        requestAnimationFrame(render);
    }

    // Matrix 3x3 utilities
    const m3 = {
        scaling: function(sx, sy) {
            return [
                sx, 0, 0,
                0, sy, 0,
                0, 0, 1,
            ];
        }
    };

    requestAnimationFrame(render);
}


// ====================================
// CUSTOM CURSOR EFFECT
// ====================================
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    // Only initialize cursor on desktop
    if (window.innerWidth > 768) {
        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Smooth cursor following with delay
        function updateCursor() {
            cursorX += (mouseX - cursorX) * 0.15; // 0.15 creates subtle delay
            cursorY += (mouseY - cursorY) * 0.15;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(updateCursor);
        }
        
        updateCursor();
        
        // Hover effects for clickable elements
        const hoverElements = document.querySelectorAll('a, button, .package-btn, .nav-link, .nav-brand');
        
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
    }
}

// ====================================
// NAVIGATION SCROLL TRIGGER
// ====================================
function initNavigationScrollTrigger() {
    const navbarTop = document.querySelector('.navbar');
    const navbarBottom = document.querySelector('.navbar-bottom');
    
    if (navbarTop && navbarBottom) {
        // Initially hide both navbars
        navbarTop.classList.add('hidden');
        navbarBottom.classList.remove('visible');
        
        let ticking = false;
        
        function updateNavbars() {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const distanceFromBottom = documentHeight - (scrollY + windowHeight);
            
            // Top navbar: Show only when at very top (within 50px)
            if (scrollY <= 50) {
                navbarTop.classList.remove('hidden');
            } else {
                navbarTop.classList.add('hidden');
            }
            
            // Bottom navbar: Show only when near bottom (within 100px)
            if (distanceFromBottom <= 100) {
                navbarBottom.classList.add('visible');
            } else {
                navbarBottom.classList.remove('visible');
            }
            
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateNavbars);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick);
        window.addEventListener('resize', requestTick);
        
        // Check initial position
        updateNavbars();
    }
}

// ====================================
// LENIS SMOOTH SCROLL INITIALIZATION
// ====================================
function initSmoothScroll() {
    // Initialize Lenis smooth scroll - optimized for performance
    const lenis = new Lenis({
        duration: isMobile ? 0.4 : 0.8,
        easing: (t) => 1 - Math.pow(1 - t, 2), // Lighter easing
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: !isMobile, // Disable smooth scroll on mobile
        mouseMultiplier: 1.2,
        smoothTouch: false, // Disable smooth touch completely
        touchMultiplier: 2, // Faster touch response
        infinite: false,
        lerp: isMobile ? 1 : 0.12, // Instant on mobile
        wheelMultiplier: 1.2,
        autoResize: true,
        syncTouch: false // Native scroll on mobile
    });

    // Update ScrollTrigger on Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    // GSAP ticker for Lenis with requestAnimationFrame
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Lenis Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const headerOffset = 80;
                const targetPosition = target.offsetTop - headerOffset;
                
                // Use Lenis scrollTo method - faster on mobile
                lenis.scrollTo(targetPosition, {
                    duration: isMobile ? 0.6 : 2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });
}

// ====================================
// GSAP ANIMATIONS & SCROLL TRIGGERS
// ====================================
function initMainAnimations() {
    gsap.registerPlugin(ScrollTrigger, Draggable);
    
    // Button text stagger animation
    function createButtonAnimation(button) {
        const textElement = button.querySelector('.btn-text');
        if (!textElement) {
            console.log('No .btn-text found in button:', button);
            return;
        }
        
        const originalText = textElement.textContent.trim();
        const letters = originalText.split('');
        
        // Create spans for each letter
        textElement.innerHTML = letters.map(letter => 
            letter === ' ' ? '<span>&nbsp;</span>' : `<span>${letter}</span>`
        ).join('');
        
        const spans = textElement.querySelectorAll('span');
        console.log('Created spans for button:', originalText, spans.length);
        
        // Set initial position
        gsap.set(spans, { y: 0 });
        
        let isAnimating = false;
        
        button.addEventListener('mouseenter', () => {
            if (isAnimating) return;
            isAnimating = true;
            
            // Stagger animation: text out (up) and new text in (from bottom)
            const tl = gsap.timeline({
                onComplete: () => {
                    isAnimating = false;
                }
            });
            
            // Letters go up almost simultaneously
            tl.to(spans, {
                y: -30,
                opacity: 0,
                duration: 0.15,
                stagger: 0.008, // Minimal stagger
                ease: "power2.in"
            })
            // Set letters below for return
            .set(spans, {
                y: 30,
                opacity: 1
            })
            // Letters come back almost at once
            .to(spans, {
                y: 0,
                duration: 0.12,
                stagger: 0.005, // Even less stagger
                ease: "power2.out"
            });
        });
    }
    
    // Initialize all buttons after a small delay to ensure DOM is ready
    setTimeout(() => {
        const buttons = document.querySelectorAll('.hero-btn, .package-btn, .submit-btn, .community-btn, .nigel-cta-button');
        console.log('Found buttons:', buttons.length);
        buttons.forEach(createButtonAnimation);
    }, 100);
    
    // Subtle parallax effect for images
    function initParallax() {
        const parallaxElements = document.querySelectorAll('.about-image, .philosophy-image');
        
        parallaxElements.forEach(element => {
            gsap.fromTo(element, 
                {
                    y: -30
                }, 
                {
                    y: 30,
                    ease: "none",
                    scrollTrigger: {
                        trigger: element,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0.5 // Very smooth
                    }
                }
            );
        });
        
        // Rocks background - mega subtle parallax
        const rocksBackground = document.querySelector('.rocks-background');
        if (rocksBackground) {
            gsap.to(rocksBackground, {
                backgroundPositionY: "10px",
                ease: "none",
                scrollTrigger: {
                    trigger: rocksBackground,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 2 // Very slow and smooth
                }
            });
        }
    }
    
    // Initialize parallax
    initParallax();

    // Intro clients rollout animation - CLEAN VERSION
    
    // Set initial state for all client icons
    gsap.set('.client-icon', { 
        opacity: 0,
        left: '50%',
        top: '50%',
        rotation: 0,
        transform: 'translate(-50%, -50%)'
    });
    
    // Create clean timeline with proper reset
    const clientsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.intro',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            onLeave: () => {
                // Reset all icons when leaving
                gsap.set('.client-icon', { 
                    opacity: 0,
                    left: '50%',
                    rotation: 0,
                    transform: 'translate(-50%, -50%)'
                });
            },
            onEnterBack: () => {
                // Ensure proper state when scrolling back
                clientsTimeline.restart();
            }
        }
    });
    
    // Smooth rolling animation - all icons roll out from center
    clientsTimeline
        .to(['.client-icon.left-1', '.client-icon.left-2', '.client-icon.left-3'], {
            opacity: 1,
            duration: 0.1
        })
        .to(['.client-icon.right-1', '.client-icon.right-2', '.client-icon.right-3'], {
            opacity: 1,
            duration: 0.1
        }, '<')
        .to('.client-icon.left-1', {
            left: '8%',
            rotation: 360,
            duration: 0.6,
            ease: 'power2.out'
        }, '<0.1')
        .to('.client-icon.left-2', {
            left: '22%',
            rotation: 360,
            duration: 0.6,
            ease: 'power2.out'
        }, '<0.05')
        .to('.client-icon.left-3', {
            left: '36%',
            rotation: 360,
            duration: 0.6,
            ease: 'power2.out'
        }, '<0.05')
        .to('.client-icon.right-1', {
            left: '64%',
            rotation: -360,
            duration: 0.6,
            ease: 'power2.out'
        }, '<-0.15')
        .to('.client-icon.right-2', {
            left: '78%',
            rotation: -360,
            duration: 0.6,
            ease: 'power2.out'
        }, '<0.05')
        .to('.client-icon.right-3', {
            left: '92%',
            rotation: -360,
            duration: 0.6,
            ease: 'power2.out'
        }, '<0.05');

    
    // Hero scroll effect
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
        // Create dynamic overlay for scroll effect
        const dynamicOverlay = document.createElement('div');
        dynamicOverlay.className = 'hero-scroll-overlay';
        heroSection.appendChild(dynamicOverlay);
        
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const heroHeight = heroSection.offsetHeight;
                    
                    // Calculate darkness based on scroll (0 to 1)
                    const darkness = Math.min(scrolled / (heroHeight * 0.8), 1);
                    dynamicOverlay.style.backgroundColor = `rgba(0, 0, 0, ${darkness})`;
                    scrollTimeout = null;
                });
            }
        });
    }
    
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                once: true
            },
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out'
        });
        
        gsap.from(title.querySelector('::after'), {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                once: true
            },
            width: 0,
            duration: 0.8,
            delay: 0.5,
            ease: 'power2.out'
        });
    });
    
    // Check if elements exist before animating
    if (document.querySelector('.feature-list li, .audience-list li') && document.querySelector('.coaching-content')) {
        gsap.from('.feature-list li, .audience-list li', {
            scrollTrigger: {
                trigger: '.coaching-content',
                start: 'top 75%',
                once: true
            },
            opacity: 0,
            x: -20,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
    
    // Check if form groups exist
    if (document.querySelector('.form-group') && document.querySelector('.contact-form')) {
        gsap.from('.form-group', {
            scrollTrigger: {
                trigger: '.contact-form',
                start: 'top 75%',
                once: true
            },
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
    
    // Check if contact form exists
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name')?.value || '',
                email: document.getElementById('email')?.value || '',
                goal: document.getElementById('goal')?.value || '',
                experience: document.getElementById('experience')?.value || '',
                challenge: document.getElementById('challenge')?.value || ''
            };
            
            console.log('Form submitted:', formData);
            
            const submitButton = document.querySelector('.submit-button');
            if (submitButton) {
                const originalText = submitButton.textContent;
                
                gsap.to(submitButton, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    onComplete: function() {
                        submitButton.textContent = 'BEDANKT! WE NEMEN CONTACT OP';
                        submitButton.style.backgroundColor = 'var(--orange-bright)';
                        
                        setTimeout(() => {
                            submitButton.textContent = originalText;
                            submitButton.style.backgroundColor = '';
                            contactForm.reset();
                        }, 3000);
                    }
                });
            }
        });
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// ====================================
// ONBOARDING FORM FUNCTIONALITY
// ====================================
let currentStep = 0;
const totalSteps = 4;

function startForm() {
    currentStep = 1;
    
    // Reset all form steps for mobile
    if (isMobile) {
        const container = document.getElementById('steps-container');
        const allSteps = document.querySelectorAll('.form-step');
        
        // Reset container
        if (container) {
            container.style.transform = 'none';
            container.style.transition = 'none';
        }
        
        // Hide all steps first
        allSteps.forEach(step => {
            step.style.display = 'none';
            step.classList.remove('active');
        });
    }
    
    showStep(currentStep);
    
    // Initialize auto-advance functionality
    autoAdvanceOnSelection();
}

function showStep(step) {
    const container = document.getElementById('steps-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const submitBtn = document.querySelector('.submit-btn');
    
    // Check if mobile (simple card layout) or desktop (sliding layout)
    if (isMobile) {
        // Mobile: Simple show/hide approach
        const allSteps = document.querySelectorAll('.form-step');
        allSteps.forEach((stepElement, index) => {
            if (index + 1 === step) {
                stepElement.classList.add('active');
                stepElement.style.display = 'flex';
            } else {
                stepElement.classList.remove('active');
                stepElement.style.display = 'none';
            }
        });
    } else {
        // Desktop: Sliding animation
        const translateX = -((step - 1) * 25);
        requestAnimationFrame(() => {
            if (container) {
                container.style.transform = `translateX(${translateX}%)`;
                container.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }
        });
    }
    
    // Update progress line for actual steps
    const progressWidth = (step / totalSteps) * 100;
    if (progressFill) {
        progressFill.style.width = `${progressWidth}%`;
        progressFill.style.transition = 'width 0.3s ease';
    }
    
    // Update progress text
    if (progressText) progressText.textContent = `Stap ${step} van ${totalSteps}`;
    
    // Show/hide navigation buttons
    if (prevBtn) {
        prevBtn.style.display = step === 1 ? 'none' : 'inline-block';
    }
    if (nextBtn) {
        nextBtn.style.display = step === totalSteps ? 'none' : 'inline-block';
    }
    if (submitBtn) {
        submitBtn.style.display = step === totalSteps ? 'block' : 'none';
    }
    
    // Hide any visible error messages when changing steps
    const errorElement = document.getElementById(`error-step-${step}`);
    if (errorElement && errorElement.classList.contains('show')) {
        errorElement.classList.remove('show');
        errorElement.classList.add('hide');
    }
}

function nextStep() {
    if (validateCurrentStep()) {
        currentStep++;
        showStep(currentStep);
    }
}

// Auto-advance when option is selected
function autoAdvanceOnSelection() {
    // Add event listeners to all radio buttons and checkboxes
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    const checkboxInputs = document.querySelectorAll('input[type="checkbox"]');
    
    radioInputs.forEach(input => {
        input.addEventListener('change', () => {
            // Small delay for visual feedback
            setTimeout(() => {
                if (currentStep < totalSteps) {
                    nextStep();
                }
            }, 300);
        });
    });
    
    checkboxInputs.forEach(input => {
        input.addEventListener('change', () => {
            // For checkboxes, advance after a selection is made
            const checkedBoxes = document.querySelectorAll(`input[name="${input.name}"]:checked`);
            if (checkedBoxes.length > 0) {
                setTimeout(() => {
                    if (currentStep < totalSteps) {
                        nextStep();
                    }
                }, 500); // Longer delay to allow multiple selections
            }
        });
    });
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function showErrorMessage(step, message) {
    const errorElement = document.getElementById(`error-step-${step}`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hide');
        errorElement.classList.add('show');
        
        // Ensure error message stays visible for at least 3 seconds
        errorElement.setAttribute('data-show-time', Date.now().toString());
        
        // Auto-hide after 3 seconds if user hasn't made a selection
        setTimeout(() => {
            // Only hide if no selection has been made and 3 seconds have passed
            const showTime = parseInt(errorElement.getAttribute('data-show-time') || '0');
            const currentTime = Date.now();
            if (currentTime - showTime >= 3000 && errorElement.classList.contains('show')) {
                // Check if step still has no selection before hiding
                if (!isStepValid(step)) {
                    // Keep showing - user still hasn't made a selection
                    return;
                }
            }
        }, 3000);
    }
}

function hideErrorMessage(step) {
    const errorElement = document.getElementById(`error-step-${step}`);
    if (errorElement) {
        const showTime = parseInt(errorElement.getAttribute('data-show-time') || '0');
        const currentTime = Date.now();
        const timeSinceShow = currentTime - showTime;
        
        // If less than 3 seconds have passed, delay hiding
        if (timeSinceShow < 3000 && showTime > 0) {
            const remainingTime = 3000 - timeSinceShow;
            setTimeout(() => hideErrorMessage(step), remainingTime);
            return;
        }
        
        errorElement.classList.remove('show');
        errorElement.classList.add('hide');
        setTimeout(() => {
            errorElement.textContent = '';
            errorElement.classList.remove('hide');
            errorElement.removeAttribute('data-show-time');
        }, 300);
    }
}

function isStepValid(step) {
    if (step === 1) {
        const checkboxes = document.querySelectorAll('input[name="goals"]:checked');
        return checkboxes.length > 0;
    }
    
    if (step === 2) {
        const experience = document.querySelector('input[name="experience"]:checked');
        return !!experience;
    }
    
    if (step === 3) {
        const preference = document.querySelector('input[name="training-preference"]:checked');
        return !!preference;
    }
    
    return true;
}

function validateCurrentStep() {
    // Hide any existing error messages first
    hideErrorMessage(currentStep);
    
    if (currentStep === 1) {
        const checkboxes = document.querySelectorAll('input[name="goals"]:checked');
        if (checkboxes.length === 0) {
            showErrorMessage(1, 'Selecteer minstens één doel om verder te gaan.');
            return false;
        }
    }
    
    if (currentStep === 2) {
        const experience = document.querySelector('input[name="experience"]:checked');
        if (!experience) {
            showErrorMessage(2, 'Kies je huidige ervaring niveau om door te gaan.');
            return false;
        }
    }
    
    if (currentStep === 3) {
        const preference = document.querySelector('input[name="training-preference"]:checked');
        if (!preference) {
            showErrorMessage(3, 'Selecteer je trainingsvoorkeur om verder te gaan.');
            return false;
        }
    }
    
    return true;
}

function setupFormValidation() {
    // Step 1 - Goals checkboxes
    const goalCheckboxes = document.querySelectorAll('input[name="goals"]');
    goalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkedBoxes = document.querySelectorAll('input[name="goals"]:checked');
            if (checkedBoxes.length > 0) {
                hideErrorMessage(1);
            }
        });
    });
    
    // Step 2 - Experience radio buttons
    const experienceRadios = document.querySelectorAll('input[name="experience"]');
    experienceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            hideErrorMessage(2);
        });
    });
    
    // Step 3 - Training preference radio buttons
    const preferenceRadios = document.querySelectorAll('input[name="training-preference"]');
    preferenceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            hideErrorMessage(3);
        });
    });
}

function formatFormData() {
    const goals = Array.from(document.querySelectorAll('input[name="goals"]:checked'))
        .map(checkbox => checkbox.value);
    const experience = document.querySelector('input[name="experience"]:checked')?.value;
    const trainingPreference = document.querySelector('input[name="training-preference"]:checked')?.value;
    const personalMessage = document.querySelector('textarea[name="personal-message"]')?.value || '';
    
    return {
        timestamp: new Date().toLocaleString('nl-NL'),
        goals: goals,
        experience: experience,
        trainingPreference: trainingPreference,
        personalMessage: personalMessage
    };
}

function generateEmailContent(formData) {
    let goalsList = formData.goals.map(goal => `• ${goal.charAt(0).toUpperCase() + goal.slice(1).replace('-', ' ')}`).join('\n');
    
    const experienceMap = {
        'beginner': 'Beginner (Weinig tot geen sportervaring)',
        'intermediate': 'Gemiddeld (Enige ervaring met sporten/fitness)',
        'advanced': 'Gevorderd (Veel ervaring en kennis)'
    };
    
    const preferenceMap = {
        'thuis': 'Thuis trainen (Met minimale apparatuur)',
        'gym': 'In de sportschool (Met volledige uitrusting)',
        'hybrid': 'Combinatie (Zowel thuis als gym)'
    };
    
    return `
NIEUWE ONBOARDING AANVRAAG - FITLIKE NIGEL
========================================

Datum: ${formData.timestamp}

DOELEN:
${goalsList}

ERVARING:
${experienceMap[formData.experience] || formData.experience}

TRAININGSVOORKEUR:
${preferenceMap[formData.trainingPreference] || formData.trainingPreference}

PERSOONLIJK BERICHT:
${formData.personalMessage || 'Geen bericht toegevoegd.'}

========================================
Dit bericht is automatisch gegenereerd via de onboarding pagina van fitlikenigel.nl
    `.trim();
}

function initOnboardingForm() {
    currentStep = 1;
    showStep(1);
    
    // Add event listeners to hide error messages when selections are made
    setupFormValidation();
    
    // Handle form submission
    document.getElementById('onboarding-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }
        
        const formData = formatFormData();
        const emailContent = generateEmailContent(formData);
        
        // Create mailto link
        const subject = encodeURIComponent('Nieuwe Onboarding Aanvraag - Fitlike Nigel');
        const body = encodeURIComponent(emailContent);
        const mailtoLink = `mailto:nigel@fitlikenigel.nl?subject=${subject}&body=${body}`;
        
        // Show success message
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'AANVRAAG WORDT VERSTUURD...';
        submitBtn.disabled = true;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show confirmation
        setTimeout(() => {
            submitBtn.textContent = 'BEDANKT! JE EMAIL CLIENT IS GEOPEND';
            submitBtn.style.backgroundColor = 'var(--orange-bright)';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.backgroundColor = '';
                submitBtn.disabled = false;
                
                // Reset form
                document.getElementById('onboarding-form').reset();
                currentStep = 1;
                showStep(1);
            }, 3000);
        }, 1000);
    });
}

// ====================================
// REVIEWS SLIDER WITH DRAG FUNCTIONALITY
// ====================================
function initReviewsSlider() {
    const wrapper = document.querySelector('.testimonials-wrapper');
    const boxes = gsap.utils.toArray('.testimonial-box');
    const avatars = gsap.utils.toArray('.client-avatars .avatar');
    
    if (!wrapper || boxes.length === 0) return;
    
    let activeElement;
    let isDragging = false;
    let autoPlayTimer;
    let highlightTimeout;
    
    const loop = horizontalLoop(boxes, {
        paused: true,
        draggable: false,
        center: true,
        onChange: (element, index) => {
            // Clear any pending highlight timeout
            if (highlightTimeout) {
                clearTimeout(highlightTimeout);
            }
            
            // Remove active state from previous elements immediately
            activeElement && activeElement.classList.remove("active");
            avatars.forEach(avatar => avatar.classList.remove("active"));
            
            // Add active class to new testimonial and avatar after animation completes
            highlightTimeout = setTimeout(() => {
                element.classList.add("active");
                activeElement = element;
                
                if (avatars[index]) {
                    avatars[index].classList.add("active");
                }
                highlightTimeout = null;
            }, 200); // Reduced wait time for smoother feel
        }
    });
    
    // Create proxy element for dragging
    const proxy = document.createElement("div");
    proxy.style.position = "absolute";
    proxy.style.width = "100%";
    proxy.style.height = "100%";
    proxy.style.top = "0";
    proxy.style.left = "0";
    proxy.style.zIndex = "10";
    proxy.style.cursor = "grab";
    proxy.style.pointerEvents = "auto";
    wrapper.appendChild(proxy);
    
    let hasDragged = false;
    
    // Create draggable
    const draggable = Draggable.create(proxy, {
        type: "x",
        trigger: proxy,
        inertia: true,
        onPress: function() {
            hasDragged = false;
        },
        onDragStart: function() {
            isDragging = true;
            hasDragged = true;
            proxy.style.cursor = "grabbing";
            clearInterval(autoPlayTimer);
            this.startProgress = loop.progress();
        },
        onDrag: function() {
            const sensitivity = 0.3; // Increased sensitivity
            let progress = this.startProgress - (this.x / wrapper.offsetWidth) * sensitivity;
            
            // Wrap progress to keep infinite loop
            if (progress < 0) {
                progress = progress + 1;
            } else if (progress > 1) {
                progress = progress - 1;
            }
            
            loop.progress(progress);
        },
        onDragEnd: function() {
            isDragging = false;
            proxy.style.cursor = "grab";
            
            // Reset proxy position
            gsap.set(this.target, {x: 0});
            this.x = 0;
            
            // Snap to nearest item
            const currentIndex = loop.closestIndex(true);
            loop.toIndex(currentIndex, {duration: 0.4, ease: "power3.out"});
            
            // Restart autoplay after delay
            setTimeout(() => {
                if (!isDragging) {
                    startAutoPlay();
                }
            }, 1000);
            
            // Reset drag flag after animation
            setTimeout(() => {
                hasDragged = false;
            }, 500);
        },
        onClick: function(e) {
            // Only allow click if we haven't dragged significantly
            if (hasDragged) {
                e.stopPropagation();
                return false;
            }
        }
    })[0];
    
    // Click handlers - handle clicks on proxy to allow clicking through
    proxy.addEventListener("click", (e) => {
        if (!hasDragged && !isDragging) {
            // Find which testimonial was clicked
            const rect = wrapper.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const centerX = rect.width / 2;
            
            // Check if click is on left or right side
            if (clickX < centerX - 100) {
                // Click on left side - go to previous
                clearInterval(autoPlayTimer);
                loop.previous({duration: 0.3, ease: "power2.out"});
                setTimeout(startAutoPlay, 1000);
            } else if (clickX > centerX + 100) {
                // Click on right side - go to next
                clearInterval(autoPlayTimer);
                loop.next({duration: 0.3, ease: "power2.out"});
                setTimeout(startAutoPlay, 1000);
            }
        }
    });
    
    // Also keep original click handlers as backup
    boxes.forEach((box, i) => {
        box.addEventListener("click", (e) => {
            if (!isDragging && !hasDragged) {
                clearInterval(autoPlayTimer);
                loop.toIndex(i, {duration: 0.3, ease: "power2.out"});
                setTimeout(startAutoPlay, 1000);
            }
        });
    });
    
    // Add click handlers to avatars
    avatars.forEach((avatar, i) => {
        avatar.addEventListener("click", () => {
            if (!isDragging) {
                clearInterval(autoPlayTimer);
                loop.toIndex(i, {duration: 0.3, ease: "power2.out"});
                setTimeout(startAutoPlay, 1000);
            }
        });
    });
    
    // Auto-play functionality
    function startAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(() => {
            if (!isDragging) {
                loop.next({duration: 0.5, ease: "power2.inOut"});
            }
        }, 5000);
    }
    
    // Start auto-play
    startAutoPlay();
}

// ====================================
// HORIZONTAL LOOP FUNCTION (FOR REVIEWS SLIDER)
// ====================================
function horizontalLoop(items, config) {
    let timeline;
    items = gsap.utils.toArray(items);
    config = config || {};
    gsap.context(() => {
        let onChange = config.onChange,
            lastIndex = 0,
            tl = gsap.timeline({
                repeat: config.repeat, 
                onUpdate: onChange && function() {
                    let i = tl.closestIndex();
                    if (lastIndex !== i) {
                        lastIndex = i;
                        onChange(items[i], i);
                    }
                }, 
                paused: config.paused, 
                defaults: {ease: "none"}, 
                onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
            }),
            length = items.length,
            startX = items[0].offsetLeft,
            times = [],
            widths = [],
            spaceBefore = [],
            xPercents = [],
            curIndex = 0,
            indexIsDirty = false,
            center = config.center,
            pixelsPerSecond = (config.speed || 1) * 100,
            snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
            timeOffset = 0,
            container = center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode,
            totalWidth,
            getTotalWidth = () => items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX + spaceBefore[0] + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX") + (parseFloat(config.paddingRight) || 0),
            populateWidths = () => {
                let b1 = container.getBoundingClientRect(), b2;
                items.forEach((el, i) => {
                    widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
                    xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / widths[i] * 100 + gsap.getProperty(el, "xPercent"));
                    b2 = el.getBoundingClientRect();
                    spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
                    b1 = b2;
                });
                gsap.set(items, {
                    xPercent: i => xPercents[i]
                });
                totalWidth = getTotalWidth();
            },
            timeWrap,
            populateOffsets = () => {
                timeOffset = center ? tl.duration() * (container.offsetWidth / 2) / totalWidth : 0;
                center && times.forEach((t, i) => {
                    times[i] = timeWrap(tl.labels["label" + i] + tl.duration() * widths[i] / 2 / totalWidth - timeOffset);
                });
            },
            getClosest = (values, value, wrap) => {
                let i = values.length,
                    closest = 1e10,
                    index = 0, d;
                while (i--) {
                    d = Math.abs(values[i] - value);
                    if (d > wrap / 2) {
                        d = wrap - d;
                    }
                    if (d < closest) {
                        closest = d;
                        index = i;
                    }
                }
                return index;
            },
            populateTimeline = () => {
                let i, item, curX, distanceToStart, distanceToLoop;
                tl.clear();
                for (i = 0; i < length; i++) {
                    item = items[i];
                    curX = xPercents[i] / 100 * widths[i];
                    distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
                    distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
                    tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
                      .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
                      .add("label" + i, distanceToStart / pixelsPerSecond);
                    times[i] = distanceToStart / pixelsPerSecond;
                }
                timeWrap = gsap.utils.wrap(0, tl.duration());
            },
            refresh = (deep) => {
                let progress = tl.progress();
                tl.progress(0, true);
                populateWidths();
                deep && populateTimeline();
                populateOffsets();
                deep && tl.draggable && tl.paused() ? tl.time(times[curIndex], true) : tl.progress(progress, true);
            },
            onResize = () => refresh(true);
        
        gsap.set(items, {x: 0});
        populateWidths();
        populateTimeline();
        populateOffsets();
        window.addEventListener("resize", onResize);
        
        function toIndex(index, vars) {
            vars = vars || {};
            (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
            let newIndex = gsap.utils.wrap(0, length, index),
                time = times[newIndex];
            if (time > tl.time() !== index > curIndex && index !== curIndex) {
                time += tl.duration() * (index > curIndex ? 1 : -1);
            }
            if (time < 0 || time > tl.duration()) {
                vars.modifiers = {time: timeWrap};
            }
            curIndex = newIndex;
            vars.overwrite = true;
            gsap.killTweensOf();    
            return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
        }
        
        tl.toIndex = (index, vars) => toIndex(index, vars);
        tl.closestIndex = setCurrent => {
            let index = getClosest(times, tl.time(), tl.duration());
            if (setCurrent) {
                curIndex = index;
                indexIsDirty = false;
            }
            return index;
        };
        tl.current = () => indexIsDirty ? tl.closestIndex(true) : curIndex;
        tl.next = vars => toIndex(tl.current()+1, vars);
        tl.previous = vars => toIndex(tl.current()-1, vars);
        tl.times = times;
        tl.progress(1, true).progress(0, true);
        
        if (config.reversed) {
            tl.vars.onReverseComplete();
            tl.reverse();
        }
        
        timeline = tl;
        return () => window.removeEventListener("resize", onResize);
    });
    return timeline;
}

// ====================================
// LIST ANIMATIONS (TEXT & LINES)
// ====================================
function initListAnimations() {
    // List items stagger animation - Text comes from bottom to top behind lines
    const lists = [
        { selector: '.about .services-list', items: null },
        { selector: '.philosophy .philosophy-list', items: null },
        { selector: '.onboarding .services-list', items: null }
    ];
    
    lists.forEach(listObj => {
        const list = document.querySelector(listObj.selector);
        if (!list) return;
        
        const items = list.querySelectorAll('li');
        listObj.items = items;
        
        if (items.length > 0) {
            // Wrap each li text in containers for overflow hidden effect
            items.forEach(item => {
                const text = item.innerHTML;
                item.innerHTML = `
                    <div class="li-text-container">
                        <span class="li-text">${text}</span>
                    </div>
                `;
            });
            
            // Select the text containers and spans
            const textElements = list.querySelectorAll('.li-text');
            
            // Set initial state - text starts below the container
            gsap.set(textElements, {
                y: "100%", // Start completely below the container
                opacity: 1
            });
            
            // Create timeline for text animation
            const textTimeline = gsap.timeline({
                paused: true
            });
            
            // Add each text to the timeline
            textElements.forEach((textElement, index) => {
                textTimeline.to(textElement, {
                    y: "0%", // Move to normal position
                    duration: 0.6,
                    ease: "power3.out"
                }, index * 0.3); // Same timing as lines
            });
            
            // ScrollTrigger to start the text timeline
            ScrollTrigger.create({
                trigger: list,
                start: "top 80%",
                onEnter: () => textTimeline.play(),
                onLeaveBack: () => textTimeline.reverse()
            });
        }
    });

    // List item ::after lines stagger animation - Horizontal lines fill from left to right
    lists.forEach(listObj => {
        const list = document.querySelector(listObj.selector);
        if (!list) return;
        
        const items = list.querySelectorAll('li');
        
        if (items.length > 0) {
            // Set initial state for the ::after lines
            items.forEach((item) => {
                item.style.setProperty('--line-scale', '0');
            });
            
            // Create timeline for this list
            const tl = gsap.timeline({
                paused: true
            });
            
            // Add each line to the timeline with fixed delays
            items.forEach((item, index) => {
                tl.to(item, {
                    '--line-scale': '1',
                    duration: 0.6,
                    ease: "power3.out"
                }, index * 0.3); // Fixed 0.3s between each line
            });
            
            // ScrollTrigger to start the whole timeline
            ScrollTrigger.create({
                trigger: list,
                start: "top 80%",
                onEnter: () => tl.play(),
                onLeaveBack: () => tl.reverse()
            });
        }
    });
}

// ====================================
// FOOTER BICEP EMOJI EFFECT
// ====================================
function initBicepEmojiEffect() {
    const followTitle = document.querySelector('.follow-title');
    const bicepEmoji = document.querySelector('.bicep-emoji');
    
    if (followTitle && bicepEmoji) {
        let mouseX = 0;
        let emojiX = 0;
        let centerX = 0;
        let fixedY = 0;
        let isHovering = false;
        let animationScale = 0;
        
        // Update title center position
        function updateTitleCenter() {
            const titleRect = followTitle.getBoundingClientRect();
            centerX = titleRect.left + (titleRect.width / 2);
            fixedY = titleRect.top + (titleRect.height / 2) - 120;
        }
        
        // Initial setup
        updateTitleCenter();
        window.addEventListener('resize', updateTitleCenter);
        window.addEventListener('scroll', updateTitleCenter);
        
        // Mouse move handler
        function handleMouseMove(e) {
            mouseX = e.clientX;
        }
        
        // Smooth emoji animation
        function animateEmoji() {
            if (isHovering) {
                // Scale in animation
                animationScale += (1 - animationScale) * 0.15;
                
                // Move from center to mouse position
                emojiX += (mouseX - emojiX) * 0.05;
            } else {
                // Scale out animation
                animationScale += (0 - animationScale) * 0.15;
                
                // Move back to center
                emojiX += (centerX - emojiX) * 0.1;
            }
            
            // Position emoji
            bicepEmoji.style.left = (emojiX - 120) + 'px';
            bicepEmoji.style.top = fixedY + 'px';
            
            // Apply scale and opacity based on animationScale
            bicepEmoji.style.opacity = animationScale;
            
            // Subtle rotation only during hover
            const rotation = isHovering ? (mouseX - emojiX) * 0.05 : 0;
            bicepEmoji.style.transform = `scale(${animationScale}) rotate(${rotation}deg)`;
            
            requestAnimationFrame(animateEmoji);
        }
        
        // Start animation loop
        animateEmoji();
        
        // Hover events
        followTitle.addEventListener('mouseenter', function(e) {
            isHovering = true;
            updateTitleCenter();
            // Start from the middle
            emojiX = centerX;
            mouseX = e.clientX;
            document.addEventListener('mousemove', handleMouseMove);
        });
        
        followTitle.addEventListener('mouseleave', function() {
            isHovering = false;
            document.removeEventListener('mousemove', handleMouseMove);
            // Set mouse position to center for smooth return
            mouseX = centerX;
        });
    }
}

// ====================================
// FEATURED BADGE ANIMATION
// ====================================
ScrollTrigger.create({
    trigger: ".packages",
    start: "top 70%",
    onEnter: () => {
        const badge = document.querySelector(".featured-badge");
        if (badge) {
            gsap.fromTo(badge, 
                {
                    scale: 0,
                    opacity: 0
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.6,
                    ease: "back.out(1.7)"
                }
            );
        }
    },
    once: true
});

// ====================================
// MAIN INITIALIZATION - DOM CONTENT LOADED
// ====================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize WebGL effects
    initWebGLEffect();
    // initCombinedEffects(); // Disabled grain/noise effect
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Initialize navigation scroll trigger
    initNavigationScrollTrigger();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // Initialize GSAP animations & scroll triggers
    initMainAnimations();
    
    // Initialize form if present
    if (document.getElementById('onboarding-form')) {
        initOnboardingForm();
    }
    
    // Initialize reviews slider if present
    if (document.querySelector('.testimonials-wrapper')) {
        initReviewsSlider();
    }
    
    // Initialize list animations
    initListAnimations();
    
    // Initialize footer bicep emoji effect
    initBicepEmojiEffect();

    // Initialize page transitions
    initPageTransitions();

    // Initialize all title animations with scroll triggers
    initAllTitleAnimations();

    // Play hero title animation on page load
    setTimeout(() => {
        playHeroTitleAnimation();
    }, 500); // 500ms delay before hero animation starts
});

// ====================================
// TITLE STAGGER ANIMATIONS
// ====================================
function createTitleStaggerAnimation(selector) {
    const titleLines = document.querySelectorAll(`${selector} .title-line`);

    if (titleLines.length === 0) return null;

    // Create timeline for title stagger animation
    const titleTimeline = gsap.timeline({ paused: true });

    // Reset all lines to starting position
    gsap.set(titleLines, { y: "120%" });

    // Add each line to timeline with stagger
    titleLines.forEach((line, index) => {
        titleTimeline.to(line, {
            y: "10%",
            duration: 1.0,
            ease: "power3.out"
        }, index * 0.25); // Each line starts 0.25s after the previous
    });

    return titleTimeline;
}

function initHeroTitleAnimation() {
    return createTitleStaggerAnimation('.hero-title');
}

function playHeroTitleAnimation() {
    const heroTitleTL = initHeroTitleAnimation();
    if (heroTitleTL) {
        heroTitleTL.play();
    }
}

function initAllTitleAnimations() {
    // Define all titles that should have stagger animations
    const titleSelectors = [
        '.intro-title',
        '.about-title',
        '.philosophy-title',
        '.packages-title',
        '.reviews-hero-title',
        '.onboarding-title',
        '.follow-title'
    ];

    titleSelectors.forEach(selector => {
        const titleElement = document.querySelector(selector);
        if (!titleElement) return;

        // Create timeline for this title
        const timeline = createTitleStaggerAnimation(selector);
        if (!timeline) return;

        // Create scroll trigger - only plays once
        ScrollTrigger.create({
            trigger: titleElement,
            start: "top 80%",
            once: true, // Only trigger once, never again
            onEnter: () => {
                timeline.play();
            }
        });
    });
}

// ====================================
// PAGE TRANSITIONS
// ====================================
function initPageTransitions() {
    const $frameOrange = document.querySelector('.page-transition__orange');
    const $frameBlack = document.querySelector('.page-transition__black');

    if (!$frameOrange || !$frameBlack) return;

    // Handle all links to trajectory.html (including with query parameters)
    const navLinks = document.querySelectorAll('a[href^="trajectory.html"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');

            // Create enter animation (top to bottom)
            const tlEnter = gsap.timeline()
                .fromTo($frameOrange, {
                    scaleY: 0
                }, {
                    scaleY: 1,
                    transformOrigin: 'top',
                    duration: 0.9,
                    ease: 'power4.inOut'
                })
                .fromTo($frameBlack, {
                    scaleY: 0
                }, {
                    scaleY: 1,
                    transformOrigin: 'top',
                    duration: 0.9,
                    ease: 'power4.inOut'
                }, 0.1);

            // Navigate when black screen is fully visible
            setTimeout(() => {
                sessionStorage.setItem('pageTransitionActive', 'true');
                window.location.href = href;
            }, 1100);
        });
    });

    // Always play page load animation (on every refresh or page visit)
    // Start with frames fully covering screen at bottom position
    gsap.set($frameOrange, { yPercent: 0, scaleY: 1 });
    gsap.set($frameBlack, { yPercent: 0, scaleY: 1 });

    // GSAP animation - slides up from bottom to top
    gsap.timeline({ delay: 0.3 })
        .to($frameBlack, {
            yPercent: -100,
            duration: 0.8,
            ease: 'power2.inOut'
        })
        .to($frameOrange, {
            yPercent: -100,
            duration: 0.8,
            ease: 'power2.inOut'
        }, 0.1)
        .call(() => {
            // Reset frames for next transition
            gsap.set($frameOrange, { yPercent: 0, scaleY: 0 });
            gsap.set($frameBlack, { yPercent: 0, scaleY: 0 });
            // Play hero title animation after transition
            playHeroTitleAnimation();
        });

    // Clean up session storage if it exists
    if (sessionStorage.getItem('pageTransitionActive')) {
        sessionStorage.removeItem('pageTransitionActive');
    }
}