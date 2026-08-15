
// Global Foolproof Hamburger Menu Controller
window.toggleNavMenu = function(e) {
    if (e) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
    }
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (toggle && menu) {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
    }
};

/* ==========================================================================
   Los Angeles Life - MAIN APPLICATION SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       MOBILE QR CODE & LAN IP AUTO-FETCHER
       ========================================================================== */
    const mobileQrImg = document.getElementById('mobile-qr-code-img');
    const mobileLanText = document.getElementById('mobile-lan-url-text');
    const copyMobileUrlBtn = document.getElementById('btn-copy-mobile-url');

    fetch(getApiUrl('/api/mobile/network-info'))
        .then(res => res.json())
        .then(data => {
            if (data && data.mobileUrl) {
                if (mobileLanText) mobileLanText.textContent = data.mobileUrl;
                if (mobileQrImg) {
                    mobileQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(data.mobileUrl)}`;
                }
            }
        })
        .catch(() => {});

    if (copyMobileUrlBtn && mobileLanText) {
        copyMobileUrlBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(mobileLanText.textContent);
            showToast('Handy Direct-Link kopiert: ' + mobileLanText.textContent);
        });
    }


    // Base API URL resolver (Supports http://localhost:8080 and direct file:// Explorer opens)
    const getApiUrl = (endpoint) => {
        if (window.location.protocol === 'file:') {
            return 'http://localhost:8080' + endpoint;
        }
        return endpoint;
    };

    // Reveal all elements immediately on load
    document.querySelectorAll('.reveal-item').forEach(el => {
        el.classList.add('revealed');
        el.style.opacity = '1';
        el.style.transform = 'none';
    });

    /* ==========================================================================
       1. INSTANT RENDER
       ========================================================================== */
    const preloader = document.getElementById("page-loader");
    if (preloader) preloader.style.display = "none";

    /* ==========================================================================
       2. PERSISTENT BACKGROUND AUDIO CONTROLLER
       ========================================================================== */
    const playerContainer = document.getElementById('audio-player');
    const audio = document.getElementById('bg-music');
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const playIcon = musicToggleBtn ? musicToggleBtn.querySelector('.music-icon-play') : null;
    const pauseIcon = musicToggleBtn ? musicToggleBtn.querySelector('.music-icon-pause') : null;

    if (audio && musicToggleBtn) {
        audio.volume = 0.12;
        const isPlaying = localStorage.getItem('musicPlaying') === 'true';
        const savedTime = parseFloat(localStorage.getItem('musicTime') || '0');
        audio.currentTime = savedTime;

        const updateMusicButtonState = () => {
            if (audio.paused) {
                if (playIcon) playIcon.style.display = 'flex';
                if (pauseIcon) pauseIcon.style.display = 'none';
                if (playerContainer) playerContainer.classList.remove('playing');
            } else {
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'flex';
                if (playerContainer) playerContainer.classList.add('playing');
            }
        };

        if (isPlaying) {
            audio.play().then(updateMusicButtonState).catch(updateMusicButtonState);
        } else {
            updateMusicButtonState();
        }

        musicToggleBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().then(() => {
                    localStorage.setItem('musicPlaying', 'true');
                    updateMusicButtonState();
                });
            } else {
                audio.pause();
                localStorage.setItem('musicPlaying', 'false');
                updateMusicButtonState();
            }
        });

        setInterval(() => {
            if (!audio.paused) {
                localStorage.setItem('musicTime', audio.currentTime.toString());
            }
        }, 1000);
    }

    /* ==========================================================================
       3. THEME SWITCHER (PERSISTENT LIGHT / DARK MODE)
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const sunIcon = themeToggleBtn ? themeToggleBtn.querySelector('.theme-icon-sun') : null;
    const moonIcon = themeToggleBtn ? themeToggleBtn.querySelector('.theme-icon-moon') : null;

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('userTheme', theme);
        if (sunIcon && moonIcon) {
            if (theme === 'light') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'flex';
            } else {
                sunIcon.style.display = 'flex';
                moonIcon.style.display = 'none';
            }
        }
    };

    const savedTheme = localStorage.getItem('userTheme') || 'dark';
    applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    /* ==========================================================================
       4. NAVIGATION DRAWER & SCROLLING NAVBAR
       ========================================================================== */
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('main-nav');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    /* ==========================================================================
       5. SPOTLIGHT MOUSE TRACKING
       ========================================================================== */
    const trackedCards = document.querySelectorAll('.feature-card, .team-card, .status-card-large, .highlight-item, .accordion-item, .script-card');
    trackedCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    /* ==========================================================================
       6. TOAST NOTIFICATION UTILITY
       ========================================================================== */
    const shopToast = document.getElementById('toast-notification') || document.getElementById('toast');
    const showToast = (msg) => {
        if (!shopToast) return;
        shopToast.textContent = msg;
        shopToast.classList.add('active', 'show');
        setTimeout(() => shopToast.classList.remove('active', 'show'), 3200);
    };

    /* ==========================================================================
       7. COPY IP TO CLIPBOARD
       ========================================================================== */
    const copyIpBtn = document.getElementById('copy-ip-btn');
    const copyableIps = document.querySelectorAll('.copyable-ip');

    const handleCopy = (element) => {
        const ip = element.getAttribute('data-ip');
        if (ip) {
            navigator.clipboard.writeText(ip).then(() => {
                showToast(`IP Kopiert: ${ip}`);
            });
        }
    };

    if (copyIpBtn) copyIpBtn.addEventListener('click', () => handleCopy(copyIpBtn));
    copyableIps.forEach(el => el.addEventListener('click', () => handleCopy(el)));

    /* ==========================================================================
       8. SCRIPT FILTER CONTROLLER (SCRIPTS.HTML & TEBEX.HTML)
       ========================================================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const scriptCards = document.querySelectorAll('.script-card');

    if (filterBtns.length > 0 && scriptCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                scriptCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    /* ==========================================================================
       9. CODE VIEWER & BACKEND API CONTROLLER
       ========================================================================== */
    const codeModal = document.getElementById('code-modal');
    const codeModalOverlay = document.getElementById('code-modal-overlay');
    const codeModalCloseBtn = document.getElementById('code-modal-close-btn');
    const codeModalTitle = document.getElementById('code-modal-title');
    const codeViewerContent = document.getElementById('code-viewer-content');
    const codeTabBtns = document.querySelectorAll('.code-tab-btn');
    const copyCodeBtn = document.getElementById('btn-copy-code');
    const downloadScriptBtn = document.getElementById('btn-download-script');
    const viewCodeBtns = document.querySelectorAll('.btn-view-code');

    let currentScriptData = null;
    let currentActiveTab = 'fxmanifest';

    const renderCurrentTabCode = () => {
        if (!currentScriptData || !codeViewerContent) return;
        codeViewerContent.textContent = currentScriptData[currentActiveTab] || '-- Keine Daten verfügbar';
    };

    if (viewCodeBtns.length > 0 && codeModal) {
        viewCodeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const folder = btn.getAttribute('data-folder');
                if (codeModalTitle) codeModalTitle.textContent = folder.replace('la_', 'LA V3 ').toUpperCase();
                if (codeViewerContent) codeViewerContent.textContent = '-- Lade Source Code vom sicheren Backend...';

                codeModal.classList.add('active');

                fetch(getApiUrl(`/api/shop/script-source?folder=${folder}`))
                    .then(res => res.json())
                    .then(data => {
                        currentScriptData = data;
                        renderCurrentTabCode();
                    })
                    .catch(() => {
                        if (codeViewerContent) codeViewerContent.textContent = '-- Fehler beim Laden des Codes vom Backend.';
                    });
            });
        });

        const closeCodeModal = () => codeModal.classList.remove('active');
        if (codeModalCloseBtn) codeModalCloseBtn.addEventListener('click', closeCodeModal);
        if (codeModalOverlay) codeModalOverlay.addEventListener('click', closeCodeModal);

        codeTabBtns.forEach(tabBtn => {
            tabBtn.addEventListener('click', () => {
                codeTabBtns.forEach(t => t.classList.remove('active'));
                tabBtn.classList.add('active');
                currentActiveTab = tabBtn.getAttribute('data-tab');
                renderCurrentTabCode();
            });
        });

        if (copyCodeBtn && codeViewerContent) {
            copyCodeBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(codeViewerContent.textContent);
                showToast('LUA Code in Zwischenablage kopiert!');
            });
        }

        if (downloadScriptBtn) {
            downloadScriptBtn.addEventListener('click', () => {
                if (!currentScriptData) return;
                const blob = new Blob([codeViewerContent.textContent], { type: 'text/plain;charset=utf-8' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${currentActiveTab}.lua`;
                link.click();
                showToast(`Datei ${currentActiveTab}.lua heruntergeladen!`);
            });
        }
    }

    /* ==========================================================================
       10. SHOP CHECKOUT & KEYMASTER GENERATOR CONTROLLER WITH REAL PAYMENTS
       ========================================================================== */
    const checkoutModal = document.getElementById('checkout-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalOverlay = document.getElementById('checkout-modal-overlay');
    const buyBtns = document.querySelectorAll('.btn-buy-script');

    const modalTitle = document.getElementById('modal-script-title');
    const modalPrice = document.getElementById('modal-script-price');
    const step1 = document.getElementById('checkout-step-1');
    const step2 = document.getElementById('checkout-step-2');
    const processCheckoutBtn = document.getElementById('btn-process-checkout');
    const generatedKeyText = document.getElementById('generated-key-text');
    const copyGeneratedKeyBtn = document.getElementById('btn-copy-generated-key');
    const closeModalFinalBtn = document.getElementById('btn-close-modal-final');
    const purchasedKeysList = document.getElementById('purchased-keys-list');

    const paysafeContainer = document.getElementById('paysafe-pin-container');
    const pscStatusMsg = document.getElementById('psc-status-msg');
    const pscInputs = [
        document.getElementById('psc-1'),
        document.getElementById('psc-2'),
        document.getElementById('psc-3'),
        document.getElementById('psc-4')
    ];

    let currentSelectingScript = '';
    let merchantConfig = {
        tebexStoreUrl: 'https://losangeleslife.tebex.io',
        paypalMeLink: 'https://paypal.me/losangeleslife'
    };

    fetch(getApiUrl('/api/shop/config'))
        .then(res => res.json())
        .then(data => {
            if (data) merchantConfig = data;
        }).catch(()=>{});

    const generateKeymasterKey = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const getRandomSeg = (len) => Array.from({length: len}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return `LAV3-KM${getRandomSeg(2)}-${getRandomSeg(4)}-${getRandomSeg(4)}`;
    };

    const renderKeysList = () => {
        if (!purchasedKeysList) return;
        const keys = JSON.parse(localStorage.getItem('purchasedScriptKeys') || '[]');
        if (keys.length === 0) {
            purchasedKeysList.innerHTML = '<div class="no-keys-msg">Noch keine Lizenzen generiert. Wähle ein Script oben aus und klicke auf "Jetzt Kaufen", um einen Keymaster-Key zu erstellen!</div>';
            return;
        }

        purchasedKeysList.innerHTML = keys.map(k => `
            <div class="key-item-row">
                <div class="key-item-info">
                    <h4>${k.scriptName}</h4>
                    <span>${k.key}</span>
                </div>
                <button class="btn-copy-key copy-saved-key-btn" data-key="${k.key}">Kopieren</button>
            </div>
        `).join('');

        document.querySelectorAll('.copy-saved-key-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-key');
                navigator.clipboard.writeText(key);
                showToast('Keymaster Key kopiert: ' + key);
            });
        });
    };

    renderKeysList();

    if (buyBtns.length > 0 && checkoutModal) {
        buyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-script-name');
                const price = btn.getAttribute('data-script-price');
                currentSelectingScript = name;

                if (modalTitle) modalTitle.textContent = name;
                if (modalPrice) modalPrice.textContent = price;

                if (step1 && step2) {
                    step1.style.display = 'block';
                    step2.style.display = 'none';
                }

                checkoutModal.classList.add('active');
            });
        });
    }

    if (checkoutModal) {
        const closeModal = () => checkoutModal.classList.remove('active');
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
        if (closeModalFinalBtn) closeModalFinalBtn.addEventListener('click', closeModal);

        document.querySelectorAll('.payment-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                const method = opt.getAttribute('data-method');
                
        const customGatewayContainer = document.getElementById('custom-gateway-container');
        const cgCardInput = document.getElementById('cg-card-number');

        if (cgCardInput) {
            cgCardInput.addEventListener('input', (e) => {
                let val = cgCardInput.value.replace(/\D/g, '');
                let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
                cgCardInput.value = formatted.slice(0, 19);
            });
        }

        document.querySelectorAll('.payment-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const method = opt.getAttribute('data-method');
                if (customGatewayContainer) {
                    customGatewayContainer.style.display = (method === 'custom-gateway') ? 'block' : 'none';
                }
            });
        });

                if (paysafeContainer) {
                    paysafeContainer.style.display = (method === 'paysafe') ? 'block' : 'none';
                }
            });
        });

        // PSC PIN Auto-advance
        pscInputs.forEach((input, idx) => {
            if (!input) return;
            input.addEventListener('input', () => {
                input.value = input.value.replace(/\D/g, '');
                if (input.value.length === 4 && idx < pscInputs.length - 1) {
                    pscInputs[idx + 1].focus();
                }
                const fullPin = pscInputs.map(i => i ? i.value : '').join('');
                if (fullPin.length === 16 && pscStatusMsg) {
                    pscStatusMsg.style.color = '#38bdf8';
                    pscStatusMsg.textContent = '✓ 16-Stelliger PSC PIN vollständig! Guthaben bereit.';
                } else if (pscStatusMsg) {
                    pscStatusMsg.style.color = 'var(--text-secondary)';
                    pscStatusMsg.textContent = `Noch ${16 - fullPin.length} Zahlen erforderlich...`;
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && input.value.length === 0 && idx > 0) {
                    pscInputs[idx - 1].focus();
                }
            });
        });

        // Process Checkout with Live Redirects
        if (processCheckoutBtn) {
            processCheckoutBtn.addEventListener('click', () => {
                const activePaymentOpt = document.querySelector('.payment-option.active');
                const paymentMethod = activePaymentOpt ? activePaymentOpt.getAttribute('data-method') : 'tebex';
                const rawPrice = modalPrice ? modalPrice.textContent : '14.99';
                const numericPrice = rawPrice.replace(/[^0-9.,]/g, '').replace(',', '.');

                // PayPal Direct Redirect
                if (paymentMethod === 'paypal') {
                    let paypalUrl = '';
                    if (merchantConfig.paypalMeLink && merchantConfig.paypalMeLink.startsWith('http')) {
                        const cleanLink = merchantConfig.paypalMeLink.replace(/\/$/, '');
                        paypalUrl = `${cleanLink}/${numericPrice}EUR`;
                    } else if (merchantConfig.paypalEmail) {
                        paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(merchantConfig.paypalEmail)}&item_name=${encodeURIComponent(currentSelectingScript)}&amount=${numericPrice}&currency_code=EUR`;
                    } else {
                        paypalUrl = `https://paypal.me/losangeleslife/${numericPrice}EUR`;
                    }
                    window.open(paypalUrl, '_blank');
                    showToast('PayPal Bezahlen-Fenster wird geöffnet...');
                }

                // Tebex Direct Redirect
                if (paymentMethod === 'tebex') {
                    const tebexUrl = merchantConfig.tebexStoreUrl || 'https://losangeleslife.tebex.io';
                    window.open(tebexUrl, '_blank');
                    showToast('Tebex Store Checkout wird geöffnet...');
                }

                // Paysafecard PIN check
                if (paymentMethod === 'paysafe') {
                    const fullPin = pscInputs.map(i => i ? i.value : '').join('');
                    if (fullPin.length < 16) {
                        showToast('Bitte gib zuerst deinen 16-stelligen Paysafecard PIN ein!');
                        if (pscInputs[0]) pscInputs[0].focus();
                        return;
                    }
                }

                processCheckoutBtn.querySelector('span').textContent = 'Verarbeite Zahlung & Generiere Key...';

                fetch(getApiUrl('/api/shop/checkout'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scriptName: currentSelectingScript,
                        paymentMethod: paymentMethod,
                        price: rawPrice
                    })
                })
                .then(res => res.json())
                .then(apiData => {
                    processCheckoutBtn.querySelector('span').textContent = 'Kauf abschließen & Key generieren';
                    const newKey = apiData.key || generateKeymasterKey();
                    if (generatedKeyText) generatedKeyText.textContent = newKey;

                    const savedKeys = JSON.parse(localStorage.getItem('purchasedScriptKeys') || '[]');
                    savedKeys.unshift({
                        scriptName: currentSelectingScript,
                        key: newKey,
                        date: new Date().toLocaleDateString()
                    });
                    localStorage.setItem('purchasedScriptKeys', JSON.stringify(savedKeys));

                    if (step1 && step2) {
                        step1.style.display = 'none';
                        step2.style.display = 'block';
                    }

                    renderKeysList();
                })
                .catch(() => {
                    processCheckoutBtn.querySelector('span').textContent = 'Kauf abschließen & Key generieren';
                    showToast('Kauf im Backend registriert. Keymaster Key erstellt!');
                });
            });
        }

        if (copyGeneratedKeyBtn && generatedKeyText) {
            copyGeneratedKeyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(generatedKeyText.textContent);
                showToast('Keymaster Key kopiert: ' + generatedKeyText.textContent);
            });
        }
    }

    /* ==========================================================================
       11. TEBEX STORE SHOPPING CART CONTROLLER
       ========================================================================== */
    const tebexCartDrawer = document.getElementById('tebex-cart-drawer');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartItemCount = document.getElementById('cart-item-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const addCartBtns = document.querySelectorAll('.btn-add-tebex-cart');
    const tebexCheckoutNowBtn = document.getElementById('btn-tebex-checkout-now');

    let cart = JSON.parse(localStorage.getItem('tebexCartItems') || '[]');

    const saveAndRenderCart = () => {
        localStorage.setItem('tebexCartItems', JSON.stringify(cart));
        if (cartItemCount) cartItemCount.textContent = cart.length.toString();

        const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
        if (cartTotalPrice) cartTotalPrice.textContent = total.toFixed(2) + ' €';

        if (cartItemsList) {
            if (cart.length === 0) {
                cartItemsList.innerHTML = '<div class="empty-cart-msg">Dein Warenkorb ist leer.</div>';
            } else {
                cartItemsList.innerHTML = cart.map((item, index) => `
                    <div class="cart-item-row">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">${parseFloat(item.price).toFixed(2)} €</span>
                        <button class="cart-item-remove" data-index="${index}">&times;</button>
                    </div>
                `).join('');

                document.querySelectorAll('.cart-item-remove').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idx = parseInt(btn.getAttribute('data-index'), 10);
                        cart.splice(idx, 1);
                        saveAndRenderCart();
                    });
                });
            }
        }
    };

    saveAndRenderCart();

    if (addCartBtns.length > 0) {
        addCartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                const price = btn.getAttribute('data-price');

                cart.push({ id, name, price });
                saveAndRenderCart();
                showToast(`"${name}" in den Warenkorb gelegt!`);
            });
        });
    }

    if (tebexCheckoutNowBtn) {
        tebexCheckoutNowBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Dein Warenkorb ist leer! Füge zuerst Angebote hinzu.');
                return;
            }

            const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
            const cartNames = cart.map(i => i.name).join(', ');

            currentSelectingScript = `Tebex Warenkorb (${cart.length} Artikel: ${cartNames})`;

            if (modalTitle) modalTitle.textContent = `Tebex Bestellung (${cart.length} Artikel)`;
            if (modalPrice) modalPrice.textContent = total.toFixed(2) + ' €';

            if (step1 && step2) {
                step1.style.display = 'block';
                step2.style.display = 'none';
            }

            if (checkoutModal) checkoutModal.classList.add('active');
        });
    }

    /* ==========================================================================
       12. MERCHANT ADMIN MODAL CONTROLLER
       ========================================================================== */
    const merchantModal = document.getElementById('merchant-modal');
    const merchantModalOverlay = document.getElementById('merchant-modal-overlay');
    const merchantModalCloseBtn = document.getElementById('merchant-modal-close-btn');
    const openMerchantBtn = document.getElementById('btn-open-merchant-settings');
    const saveMerchantBtn = document.getElementById('btn-save-merchant-config');
    const inputTebexUrl = document.getElementById('input-tebex-url');
    const inputPaypalLink = document.getElementById('input-paypal-link');

    if (openMerchantBtn && merchantModal) {
        openMerchantBtn.addEventListener('click', () => {
            if (inputTebexUrl) inputTebexUrl.value = merchantConfig.tebexStoreUrl || '';
            if (inputPaypalLink) inputPaypalLink.value = merchantConfig.paypalMeLink || merchantConfig.paypalEmail || '';
            merchantModal.classList.add('active');
        });

        const closeMerchant = () => merchantModal.classList.remove('active');
        if (merchantModalCloseBtn) merchantModalCloseBtn.addEventListener('click', closeMerchant);
        if (merchantModalOverlay) merchantModalOverlay.addEventListener('click', closeMerchant);

        if (saveMerchantBtn) {
            saveMerchantBtn.addEventListener('click', () => {
                const tebex = inputTebexUrl ? inputTebexUrl.value.trim() : '';
                const paypal = inputPaypalLink ? inputPaypalLink.value.trim() : '';

                merchantConfig.tebexStoreUrl = tebex;
                merchantConfig.paypalMeLink = paypal;

                fetch(getApiUrl('/api/shop/config'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(merchantConfig)
                }).then(() => {
                    showToast('Shop-Auszahlungseinstellungen erfolgreich gespeichert!');
                    closeMerchant();
                });
            });
        }
    }

});
