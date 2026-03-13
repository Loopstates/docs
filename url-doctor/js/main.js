// Main Interactions
document.addEventListener('DOMContentLoaded', () => {

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 17, 21, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(15, 17, 21, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Once visible, stay visible
            }
        });
    }, observerOptions);

    // Observe all elements with .reveal class
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // --- Traffic Simulator Logic Cycler ---
    const scenarios = [
        {
            name: "Device Targeting",
            cards: [
                { icon: 'apple', title: 'App Store', meta: 'iOS Detected' },
                { icon: 'smartphone', title: 'Play Store', meta: 'Android Detected' },
                { icon: 'monitor', title: 'Website', meta: 'Desktop Detected' }
            ]
        },
        {
            name: "Geo Routing",
            cards: [
                { icon: 'map', title: 'US Store', meta: 'USA Traffic' },
                { icon: 'globe-2', title: 'EU Store', meta: 'Europe Traffic' },
                { icon: 'flag', title: 'Global', meta: 'Rest of World' }
            ]
        },
        {
            name: "A/B Testing",
            cards: [
                { icon: 'flask-conical', title: 'Variant A', meta: 'Experimental' },
                { icon: 'flask-round', title: 'Variant B', meta: 'Control Group' },
                { icon: 'users', title: 'Fallback', meta: 'Standard Flow' }
            ]
        },
        {
            name: "Bot Protection",
            cards: [
                { icon: 'user-check', title: 'Real User', meta: 'Allowed' },
                { icon: 'bot', title: 'Bot Detected', meta: 'Blocked' },
                { icon: 'shield-alert', title: 'Suspicious', meta: 'Challenge' }
            ]
        },
        {
            name: "Time Scheduling",
            cards: [
                { icon: 'sun', title: 'During Day', meta: 'Sales Team' },
                { icon: 'moon', title: 'After Hours', meta: 'Support Ticket' },
                { icon: 'calendar-clock', title: 'Weekend', meta: 'Self Service' }
            ]
        }
    ];

    let currentScenario = 0;
    const destCards = [
        document.querySelector('.dest-ios'),
        document.querySelector('.dest-android'),
        document.querySelector('.dest-web')
    ];
    const trafficContainer = document.querySelector('.traffic-simulation');

    function updateLogicContent() {
        return new Promise(resolve => {
            currentScenario = (currentScenario + 1) % scenarios.length;
            const scenario = scenarios[currentScenario];

            destCards.forEach((card, index) => {
                if (!card) return;
                const data = scenario.cards[index];

                const titleEl = card.querySelector('.dest-title');
                const metaEl = card.querySelector('.dest-meta');
                const iconContainer = card.querySelector('.dest-icon');

                // Fade Out
                titleEl.style.opacity = '0';
                metaEl.style.opacity = '0';
                iconContainer.style.opacity = '0';
                iconContainer.style.transform = 'scale(0.8)';

                setTimeout(() => {
                    titleEl.textContent = data.title;
                    metaEl.textContent = data.meta;
                    iconContainer.innerHTML = `<i data-lucide="${data.icon}"></i>`;

                    if (window.lucide) lucide.createIcons({
                        root: iconContainer,
                        nameAttr: 'data-lucide',
                        attrs: { class: "lucide" }
                    });

                    // Fade In
                    titleEl.style.opacity = '1';
                    metaEl.style.opacity = '1';
                    iconContainer.style.opacity = '1';
                    iconContainer.style.transform = 'scale(1)';
                }, 300);
            });
            // Resolve after transition completes
            setTimeout(resolve, 800);
        });
    }

    async function runSimulationLoop() {
        while (true) {
            // 1. Start Traffic Flow
            trafficContainer.classList.add('running');

            // Wait for full animation cycle (Extended for staggered particles: 3.8s start + 4s duration = ~8s needed)
            await new Promise(r => setTimeout(r, 8000));

            // 2. Stop Traffic Flow (Cleanup)
            trafficContainer.classList.remove('running');

            // Wait a moment (silence)
            await new Promise(r => setTimeout(r, 1000));

            // 3. Swap Logic Items
            await updateLogicContent();

            // Wait another moment (absorb change)
            await new Promise(r => setTimeout(r, 1000));

            // Loop restarts -> Traffic flows again
        }
    }

    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCHxofItALg_e2c1iRAwniog1zv4H9p5KI",
        authDomain: "url-doctor.firebaseapp.com",
        projectId: "url-doctor",
        storageBucket: "url-doctor.firebasestorage.app",
        messagingSenderId: "457178108478",
        appId: "1:457178108478:web:2a06f707951578016a776f",
        measurementId: "G-7WCSNSNM6L"
    };

    // n8n Webhook Configuration
    const USE_TEST_MODE = false; // Set to false when ready for production
    const WEBHOOK_URL_PROD = "https://automate.loopstates.com/webhook/1605b1a5-d1f1-4522-9531-41f3c7135a0a";
    const WEBHOOK_URL_TEST = "https://automate.loopstates.com/webhook-test/1605b1a5-d1f1-4522-9531-41f3c7135a0a";

    const WEBHOOK_URL = USE_TEST_MODE ? WEBHOOK_URL_TEST : WEBHOOK_URL_PROD;

    // Lazy load Firebase
    let db;
    let draftId;

    async function initFirebase() {
        if (db) return;

        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);

        // Generate Draft ID if not exists
        if (!draftId) {
            draftId = crypto.randomUUID();
            sessionStorage.setItem('migration_draft_id', draftId);
        }

        window.firebaseOps = { doc, setDoc, serverTimestamp };
    }

    async function saveDraft(stepData, currentStep) {
        try {
            await initFirebase();
            const { doc, setDoc, serverTimestamp } = window.firebaseOps;

            const docRef = doc(db, "migration_drafts", draftId);
            await setDoc(docRef, {
                ...stepData,
                lastStep: currentStep,
                updatedAt: serverTimestamp(),
                status: 'draft'
            }, { merge: true });

            console.log('Draft saved:', draftId);
        } catch (e) {
            console.error('Error saving draft:', e);
        }
    }

    async function submitApplication() {
        try {
            const submitBtn = document.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            // 1. Final Firebase Update
            if (db) {
                const { doc, setDoc, serverTimestamp } = window.firebaseOps;
                await setDoc(doc(db, "migration_drafts", draftId), {
                    status: 'submitted',
                    submittedAt: serverTimestamp()
                }, { merge: true });
            }

            // 2. Gather all data
            const formData = {
                draftId,
                subscription: document.querySelector('input[name="has_subscription"]:checked')?.value,
                provider: document.querySelector('input[name="provider"]:checked')?.value,
                providerOther: document.getElementById('provider-other')?.value,
                features: Array.from(document.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value),
                reason: document.getElementById('reason')?.value,
                contact: {
                    name: document.getElementById('contact-name')?.value,
                    email: document.getElementById('contact-email')?.value,
                    phone: document.getElementById('contact-phone')?.value
                },
                referral: document.querySelector('input[name="referral"]:checked')?.value,
                submittedAt: new Date().toISOString()
            };

            // 3. Send to n8n
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Show Success
                const steps = document.querySelectorAll('.modal-step');
                const progressBar = document.querySelector('.progress-bar');

                steps.forEach(s => s.classList.remove('active'));
                document.querySelector('.modal-step[data-step="success"]').classList.add('active');
                progressBar.style.width = '100%';
                sessionStorage.removeItem('migration_draft_id');
            } else {
                throw new Error('Submission failed');
            }

        } catch (e) {
            console.error('Submission error:', e);
            alert('Something went wrong. Please try again.');
            const submitBtn = document.querySelector('.btn-submit');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Application';
        }
    }

    // --- Migration Offer Modal Logic ---
    function initMigrationModal() {
        const modal = document.getElementById('migration-modal');
        // Use event delegation for the open button
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href*="offer=migration"]');
            if (target) {
                e.preventDefault();
                modal.classList.add('active');
                initFirebase(); // Start loading Firebase SDK
            }
        });

        const closeBtn = document.querySelector('.modal-close');
        const steps = document.querySelectorAll('.modal-step');
        const progressBar = document.querySelector('.progress-bar');

        let currentStep = 1;

        // Close Modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Navigation & Logic
        const updateProgress = () => {
            const progress = (currentStep / 6) * 100;
            progressBar.style.width = `${progress}%`;
        };

        const showStep = (step) => {
            steps.forEach(s => s.classList.remove('active'));
            const target = document.querySelector(`.modal-step[data-step="${step}"]`);
            if (target) {
                target.classList.add('active');
                currentStep = step;
                updateProgress();
            }
        };

        // Handle Next/Back Buttons
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', async () => {
                // Save Draft on every step
                const stepData = {
                    step: currentStep,
                    timestamp: new Date().toISOString()
                };

                // Capture specific step data
                if (currentStep === 1) stepData.subscription = document.querySelector('input[name="has_subscription"]:checked')?.value;
                if (currentStep === 2) {
                    stepData.provider = document.querySelector('input[name="provider"]:checked')?.value;
                    stepData.providerOther = document.getElementById('provider-other')?.value;
                }
                if (currentStep === 3) stepData.features = Array.from(document.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value);
                if (currentStep === 4) stepData.reason = document.getElementById('reason')?.value;
                if (currentStep === 5) {
                    stepData.contact = {
                        name: document.getElementById('contact-name')?.value,
                        email: document.getElementById('contact-email')?.value,
                        phone: document.getElementById('contact-phone')?.value
                    };
                }

                saveDraft(stepData, currentStep);

                if (currentStep < 6) {
                    showStep(currentStep + 1);
                }
            });
        });

        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep > 1) {
                    showStep(currentStep - 1);
                }
            });
        });

        // Submit Final Step
        document.querySelector('.btn-submit')?.addEventListener('click', () => {
            submitApplication();
        });

        // Input Validation & State Management
        // Step 1
        document.querySelectorAll('input[name="has_subscription"]').forEach(input => {
            input.addEventListener('change', () => {
                document.querySelector('[data-step="1"] .btn-next').disabled = false;
            });
        });

        // Step 2
        document.querySelectorAll('input[name="provider"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const otherGroup = document.getElementById('provider-other-group');
                if (e.target.value === 'other') {
                    otherGroup.classList.remove('hidden');
                } else {
                    otherGroup.classList.add('hidden');
                }
                document.querySelector('[data-step="2"] .btn-next').disabled = false;
            });
        });

        // Step 3
        document.querySelectorAll('input[name="features"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const otherGroup = document.getElementById('features-other-group');
                if (e.target.value === 'other') {
                    if (e.target.checked) otherGroup.classList.remove('hidden');
                    else otherGroup.classList.add('hidden');
                }
                const anyChecked = document.querySelectorAll('input[name="features"]:checked').length > 0;
                document.querySelector('[data-step="3"] .btn-next').disabled = !anyChecked;
            });
        });

        // Step 4
        document.getElementById('reason').addEventListener('input', (e) => {
            document.querySelector('[data-step="4"] .btn-next').disabled = e.target.value.length < 3;
        });

        // Step 5 (Contact Info)
        const contactInputs = document.querySelectorAll('#contact-name, #contact-email');
        contactInputs.forEach(input => {
            input.addEventListener('input', () => {
                const name = document.getElementById('contact-name').value;
                const email = document.getElementById('contact-email').value;
                const isValid = name.length > 2 && email.includes('@') && email.includes('.');
                document.querySelector('[data-step="5"] .btn-next').disabled = !isValid;
            });
        });

        // Step 6
        document.querySelectorAll('input[name="referral"]').forEach(input => {
            input.addEventListener('change', () => {
                document.querySelector('.btn-submit').disabled = false;
            });
        });
    }

    // Initialize all
    if (window.lucide) {
        lucide.createIcons();
    }

    // Start Systems
    initMigrationModal();

    // Start the loop
    runSimulationLoop();
});

// Affiliate Table Interaction
function toggleRow(row) {
    const details = row.nextElementSibling;
    const isOpen = details.classList.contains('open');

    // Close all other rows
    document.querySelectorAll('.row-details').forEach(el => {
        el.classList.remove('open');
    });

    document.querySelectorAll('.table-row').forEach(el => {
        el.style.background = ''; // Reset background
    });

    // Toggle current row
    if (!isOpen) {
        details.classList.add('open');
        row.style.background = 'rgba(255, 255, 255, 0.05)'; // Keep highlight
    }
}

// Campaign List Interaction
function toggleFolder(item) {
    const details = item.nextElementSibling;
    const isOpen = details.classList.contains('open');

    // Close all other folders
    document.querySelectorAll('.folder-details').forEach(el => {
        el.classList.remove('open');
    });

    document.querySelectorAll('.folder-item').forEach(el => {
        el.style.background = ''; // Reset background
    });

    // Toggle current folder
    if (!isOpen) {
        details.classList.add('open');
        item.style.background = 'rgba(255, 255, 255, 0.05)'; // Keep highlight
    }
}

// Analytics Chart Interaction
const chartData = {
    '24h': {
        path: "M0,80 C50,80 50,40 100,50 C150,60 150,20 200,30 C250,40 250,10 300,20"
    },
    '7d': {
        path: "M0,50 C50,60 100,80 150,40 C200,20 250,30 300,10"
    },
    '30d': {
        path: "M0,90 C80,80 120,20 180,40 C240,60 280,10 300,30"
    }
};

function switchChart(period, tab) {
    // Update tabs
    document.querySelectorAll('.chart-tabs span').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Update path
    const pathEl = document.getElementById('chart-path');
    if (pathEl && chartData[period]) {
        pathEl.setAttribute('d', chartData[period].path);
    }
}
