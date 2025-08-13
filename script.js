document.addEventListener('DOMContentLoaded', function() {
    gsap.registerPlugin(ScrollTrigger, Draggable);
    
    
    // No initial animation for corner navigation items
    
    gsap.fromTo('.hero-title', 
        {
            opacity: 0,
            y: 50
        },
        {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out'
        }
    );
    
    // Hero scroll effect
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
        // Create dynamic overlay for scroll effect
        const dynamicOverlay = document.createElement('div');
        dynamicOverlay.className = 'hero-scroll-overlay';
        heroSection.appendChild(dynamicOverlay);
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroHeight = heroSection.offsetHeight;
            
            // Calculate darkness based on scroll (0 to 1)
            const darkness = Math.min(scrolled / (heroHeight * 0.8), 1);
            dynamicOverlay.style.backgroundColor = `rgba(0, 0, 0, ${darkness})`;
        });
    }
    
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
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
                toggleActions: 'play none none reverse'
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
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: -20,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
    
    // Check if package cards exist
    if (document.querySelector('.package-card') && document.querySelector('.packages-grid')) {
        gsap.from('.package-card', {
            scrollTrigger: {
                trigger: '.packages-grid',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out'
        });
    }
    
    
    // Check if form groups exist
    if (document.querySelector('.form-group') && document.querySelector('.contact-form')) {
        gsap.from('.form-group', {
            scrollTrigger: {
                trigger: '.contact-form',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
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
    
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = target.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
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
});

// Onboarding form functionality
let currentStep = 0;
const totalSteps = 4;

function startForm() {
    currentStep = 1;
    showStep(currentStep);
}

function showStep(step) {
    const container = document.getElementById('steps-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const submitBtn = document.querySelector('.submit-btn');
    
    // Calculate transform position (step 1-4 = actual steps, no intro step)
    const translateX = -((step - 1) * 25);
    container.style.transform = `translateX(${translateX}%)`;
    
    
    // Update progress line for actual steps
    const progressWidth = (step / totalSteps) * 100;
    if (progressFill) progressFill.style.width = `${progressWidth}%`;
    
    // Update progress text
    if (progressText) progressText.textContent = `STAP ${step} VAN ${totalSteps}`;
    
    // Show/hide navigation buttons
    if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : 'inline-block';
    if (nextBtn) nextBtn.style.display = step === totalSteps ? 'none' : 'inline-block';
    if (submitBtn) submitBtn.style.display = step === totalSteps ? 'inline-block' : 'none';
}

function nextStep() {
    if (validateCurrentStep()) {
        currentStep++;
        showStep(currentStep);
    }
}

function previousStep() {
    currentStep--;
    showStep(currentStep);
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

function hideAllErrorMessages() {
    for (let i = 1; i <= totalSteps; i++) {
        hideErrorMessage(i);
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
    const personalMessage = document.querySelector('textarea[name="personal-message"]').value;
    
    const formattedData = {
        timestamp: new Date().toLocaleString('nl-NL'),
        goals: goals,
        experience: experience,
        trainingPreference: trainingPreference,
        personalMessage: personalMessage
    };
    
    return formattedData;
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

// Initialize form when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('onboarding-form')) {
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
    
    // Initialize reviews slider
    if (document.querySelector('.testimonials-wrapper')) {
        initReviewsSlider();
    }
});

// Reviews Slider - Met drag functionaliteit
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
            }, 400); // Wait for slide transition to complete
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
    
    let dragThreshold = 10;
    let hasDragged = false;
    let startX = 0;
    
    // Create draggable
    const draggable = Draggable.create(proxy, {
        type: "x",
        trigger: proxy,
        inertia: true,
        onPress: function(e) {
            startX = e.x || e.clientX;
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
            loop.toIndex(currentIndex, {duration: 0.6, ease: "power2.out"});
            
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
                loop.previous({duration: 0.4, ease: "power3.out"});
                setTimeout(startAutoPlay, 1000);
            } else if (clickX > centerX + 100) {
                // Click on right side - go to next
                clearInterval(autoPlayTimer);
                loop.next({duration: 0.4, ease: "power3.out"});
                setTimeout(startAutoPlay, 1000);
            }
        }
    });
    
    // Also keep original click handlers as backup
    boxes.forEach((box, i) => {
        box.addEventListener("click", (e) => {
            if (!isDragging && !hasDragged) {
                clearInterval(autoPlayTimer);
                loop.toIndex(i, {duration: 0.4, ease: "power3.out"});
                setTimeout(startAutoPlay, 1000);
            }
        });
    });
    
    // Add click handlers to avatars
    avatars.forEach((avatar, i) => {
        avatar.addEventListener("click", () => {
            if (!isDragging) {
                clearInterval(autoPlayTimer);
                loop.toIndex(i, {duration: 0.4, ease: "power3.out"});
                setTimeout(startAutoPlay, 1000);
            }
        });
    });
    
    // Auto-play functionality
    function startAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(() => {
            if (!isDragging) {
                loop.next({duration: 0.4, ease: "power1.inOut"});
            }
        }, 5000);
    }
    
    // Start auto-play
    startAutoPlay();
    
}

// Horizontal Loop Function (van jouw voorbeeld)
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
            onResize = () => refresh(true),
            proxy;
        
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
            gsap.killTweensOf(proxy);    
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