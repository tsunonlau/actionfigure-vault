// PayPal Configuration with Multi-Currency Support
const PAYPAL_CONFIG = {
    CLIENT_ID: 'AQwR0albcg6vvwYGQiVRlYVAExSV_l7nXUUd6F3Rcv4-RU9ytyk3os5PtqDnGNJE6etd8tuj573OWJ3h',
    ENVIRONMENT: 'sandbox',
    SERVER_URL: 'https://actionfigure-vault.onrender.com'
};

// Currency Configuration
const CURRENCY_CONFIG = {
    'HK': { 
        code: 'HKD', 
        symbol: 'HK$', 
        rate: 7.8, 
        name: 'Hong Kong Dollar',
        flag: '🇭🇰',
        shipping: {
            free: true,
            standard: { cost: 0, days: '3-5' },
            express: { cost: 9.99, days: '1-2' }
        }
    },
    'US': { 
        code: 'USD', 
        symbol: '$', 
        rate: 1.0, 
        name: 'US Dollar',
        flag: '🇺🇸',
        shipping: {
            free: false,
            standard: { cost: 9.99, days: '5-7' },
            express: { cost: 19.99, days: '2-3' }
        }
    },
    'GB': { 
        code: 'GBP', 
        symbol: '£', 
        rate: 0.79, 
        name: 'British Pound',
        flag: '🇬🇧',
        shipping: {
            free: false,
            standard: { cost: 8.99, days: '5-8' },
            express: { cost: 18.99, days: '2-4' }
        }
    }
};

// Current settings
let currentCountry = 'HK';
let currentCurrency = CURRENCY_CONFIG[currentCountry];

// Enhanced Product Data with Multi-Currency Support
const products = [
    {
        id: 1,
        name: "Iron Man Mark 85 - Hot Toys",
        category: "marvel",
        basePrice: 299.99, // Base price in USD
        sku: "HT-IM-MK85-001",
        upc: "630509987654",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%23dc2626'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3EIron Man Figure%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/iron-man-mk85-main.jpg",
        url: "https://actionfigurevault.com/products/iron-man-mark-85-hot-toys",
        description: "Premium 1/6 scale collectible figure featuring movie-accurate details and LED light-up arc reactor.",
        specs: ["1/6 Scale (12 inches)", "Die-cast metal construction", "LED light features", "Multiple articulation points", "Authentic accessories"],
        badge: "new",
        inStock: true,
        weight: 1.2 // kg for shipping calculations
    },
    {
        id: 2,
        name: "Darth Vader - Sideshow Collectibles",
        category: "star-wars",
        basePrice: 275.00,
        sku: "SS-SW-DV-002",
        upc: "630509876543",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%23000000'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3EDarth Vader%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/darth-vader-sideshow-main.jpg",
        url: "https://actionfigurevault.com/products/darth-vader-sideshow-collectibles",
        description: "Iconic Dark Lord of the Sith with detailed armor, fabric cape, and light-up lightsaber.",
        specs: ["1/6 Scale (13.5 inches)", "Fabric costume", "Light-up lightsaber", "Helmeted and unmasked heads", "Display base included"],
        badge: "sale",
        inStock: true,
        weight: 1.4
    },
    {
        id: 3,
        name: "Batman (Modern Suit) - Hot Toys",
        category: "dc",
        basePrice: 320.99,
        sku: "HT-DC-BAT-003",
        upc: "630509765432",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3EBatman Figure%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/batman-modern-hot-toys-main.jpg",
        url: "https://actionfigurevault.com/products/batman-modern-suit-hot-toys",
        description: "The Dark Knight in his modern tactical suit with detailed accessories and cape.",
        specs: ["1/6 Scale (12.5 inches)", "Detailed fabric suit", "Multiple head sculpts", "Weapon accessories", "Poseable cape"],
        badge: "",
        inStock: true,
        weight: 1.3
    },
    {
        id: 4,
        name: "Spider-Man (Advanced Suit)",
        category: "marvel",
        basePrice: 185.50,
        sku: "HT-MV-SM-004",
        upc: "630509654321",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%23dc2626'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3ESpider-Man%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/spider-man-advanced-main.jpg",
        url: "https://actionfigurevault.com/products/spider-man-advanced-suit",
        description: "Web-slinger in his advanced suit from the PS4 game with web accessories.",
        specs: ["1/6 Scale (11.5 inches)", "Flexible body", "Web shooting effects", "Multiple hand options", "Display stand"],
        badge: "new",
        inStock: true,
        weight: 1.0
    },
    {
        id: 5,
        name: "Mandalorian & Grogu Set",
        category: "star-wars",
        basePrice: 425.00,
        sku: "HT-SW-MG-005",
        upc: "630509543210",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%236b7280'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3EMandalorian Set%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/mandalorian-grogu-set-main.jpg",
        url: "https://actionfigurevault.com/products/mandalorian-grogu-set",
        description: "Din Djarin in beskar armor with Baby Yoda and extensive accessories.",
        specs: ["1/6 Scale Mandalorian", "Life-size Grogu figure", "Beskar armor details", "Multiple weapons", "Floating pram accessory"],
        badge: "",
        inStock: true,
        weight: 1.8
    },
    {
        id: 6,
        name: "Wonder Woman 1984",
        category: "dc",
        basePrice: 245.75,
        sku: "HT-DC-WW-006",
        upc: "630509432109",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%23dc2626'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3EWonder Woman%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/wonder-woman-1984-main.jpg",
        url: "https://actionfigurevault.com/products/wonder-woman-1984",
        description: "Diana Prince in her golden armor from Wonder Woman 1984 with accessories.",
        specs: ["1/6 Scale (11 inches)", "Golden Eagle Armor", "Lasso of Truth", "Multiple expressions", "Tiara and bracelets"],
        badge: "sale",
        inStock: true,
        weight: 1.1
    },
    {
        id: 7,
        name: "Goku Ultra Instinct - Figuarts",
        category: "anime",
        basePrice: 89.99,
        sku: "BF-AN-GU-007",
        upc: "630509321098",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%23f59e0b'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3EGoku Ultra Instinct%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/goku-ultra-instinct-main.jpg",
        url: "https://actionfigurevault.com/products/goku-ultra-instinct-figuarts",
        description: "Son Goku in Ultra Instinct form with effect parts and multiple expressions.",
        specs: ["6 inches tall", "Ultra Instinct aura effects", "Multiple face plates", "Energy blast accessories", "Stand included"],
        badge: "new",
        inStock: true,
        weight: 0.4
    },
    {
        id: 8,
        name: "Captain America (Endgame)",
        category: "marvel",
        basePrice: 265.00,
        sku: "HT-MV-CA-008",
        upc: "630509210987",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%232563eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3ECaptain America%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/captain-america-endgame-main.jpg",
        url: "https://actionfigurevault.com/products/captain-america-endgame",
        description: "Steve Rogers with Mjolnir and damaged shield from the final battle.",
        specs: ["1/6 Scale (12 inches)", "Mjolnir hammer", "Battle-damaged shield", "Authentic likeness", "Multiple hands"],
        badge: "",
        inStock: true,
        weight: 1.2
    },
    {
        id: 9,
        name: "Boba Fett (Return of Jedi)",
        category: "star-wars",
        basePrice: 310.50,
        sku: "SS-SW-BF-009",
        upc: "630509109876",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%23059669'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3EBoba Fett%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/boba-fett-rotj-main.jpg",
        url: "https://actionfigurevault.com/products/boba-fett-return-jedi",
        description: "Legendary bounty hunter with full Mandalorian armor and jetpack.",
        specs: ["1/6 Scale (12 inches)", "Detailed Mandalorian armor", "Functional jetpack", "Blaster rifle", "Weathered finish"],
        badge: "sale",
        inStock: true,
        weight: 1.5
    },
    {
        id: 10,
        name: "Joker (Killing Joke) - Hot Toys",
        category: "dc",
        basePrice: 285.99,
        sku: "HT-DC-JK-010",
        upc: "630509098765",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%237c3aed'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3EJoker Figure%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/joker-killing-joke-main.jpg",
        url: "https://actionfigurevault.com/products/joker-killing-joke-hot-toys",
        description: "The Clown Prince of Crime from the iconic Killing Joke storyline.",
        specs: ["1/6 Scale (12 inches)", "Purple suit", "Multiple expressions", "Photography props", "Carnival accessories"],
        badge: "new",
        inStock: true,
        weight: 1.1
    },
    {
        id: 11,
        name: "Naruto Uzumaki - Figuarts",
        category: "anime",
        basePrice: 75.00,
        sku: "BF-AN-NU-011",
        upc: "630509087654",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%23f59e0b'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3ENaruto Figure%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/naruto-uzumaki-main.jpg",
        url: "https://actionfigurevault.com/products/naruto-uzumaki-figuarts",
        description: "The ninja from Hidden Leaf Village with kunai and jutsu effects.",
        specs: ["6 inches tall", "Multiple face expressions", "Rasengan effect", "Kunai accessories", "Poseable figure"],
        badge: "",
        inStock: true,
        weight: 0.3
    },
    {
        id: 12,
        name: "Thor (Love & Thunder)",
        category: "marvel",
        basePrice: 295.50,
        sku: "HT-MV-TH-012",
        upc: "630509076543",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%23dc2626'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3EThor Figure%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/thor-love-thunder-main.jpg",
        url: "https://actionfigurevault.com/products/thor-love-thunder",
        description: "God of Thunder with Stormbreaker and lightning effects from the latest movie.",
        specs: ["1/6 Scale (12.5 inches)", "Stormbreaker axe", "Lightning effects", "Detailed armor", "Cape accessory"],
        badge: "new",
        inStock: true,
        weight: 1.3
    },
    {
        id: 13,
        name: "GHOST (DIGITAL GOOD)",
        category: "marvel",
        basePrice: 10.00,
        sku: "HT-MV-TH-013",
        upc: "630509076545",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250' viewBox='0 0 280 250'%3E%3Crect width='280' height='250' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='white'%3EGHOST DIGITAL%3C/text%3E%3C/svg%3E",
        image_url: "https://cdn.actionfigurevault.com/products/ghost.jpg",
        url: "https://actionfigurevault.com/products/ghost",
        description: "A ghost (DIGITAL GOOD)",
        specs: ["1/6 Scale (12.5 inches)"],
        badge: "new",
        inStock: true,
        tangible: "DIGITAL_GOODS",
        weight: 0.1
    }
];

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let paypalButtonsInstance = null;

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCurrency = document.getElementById('cart-currency');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart-btn');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const paypalButtonContainer = document.getElementById('paypal-button-container');
const loadingOverlay = document.getElementById('loading-overlay');
const countryCurrencySelector = document.getElementById('country-currency-selector');

// Modal elements
const productModal = document.getElementById('product-modal');
const checkoutModal = document.getElementById('checkout-modal');
const successModal = document.getElementById('success-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');

// Currency and Price Conversion Functions
function convertPrice(basePrice, targetCurrencyCode) {
    const targetRate = Object.values(CURRENCY_CONFIG).find(c => c.code === targetCurrencyCode)?.rate || 1;
    return basePrice * targetRate;
}

function formatPrice(price, currencyConfig) {
    return `${currencyConfig.symbol}${price.toFixed(2)}`;
}

function getProductPrice(product) {
    const convertedPrice = convertPrice(product.basePrice, currentCurrency.code);
    return convertedPrice;
}

// ENHANCED: Calculate shipping cost based on current country and cart total
function calculateShippingCost() {
    const shippingInfo = currentCurrency.shipping;

    // Hong Kong - Always free shipping
    if (currentCountry === 'HK') {
        return 0;
    }

    // Other countries - Check for free shipping threshold
    const cartTotal = calculateCartItemsTotal();
    const freeShippingThreshold = 300 * currentCurrency.rate; // $300 USD equivalent

    if (cartTotal >= freeShippingThreshold) {
        return 0; // Free shipping for orders over threshold
    }

    // Return standard shipping cost
    return shippingInfo.standard.cost;
}

// ENHANCED: Get selected shipping method (can be extended for user selection)
function getSelectedShippingMethod() {
    const shippingInfo = currentCurrency.shipping;
    const shippingCost = calculateShippingCost();

    if (shippingCost === 0) {
        if (currentCountry === 'HK') {
            return {
                id: 'free-hk',
                name: 'Free Standard Shipping to Hong Kong',
                cost: 0,
                days: shippingInfo.standard.days
            };
        } else {
            return {
                id: 'free-qualified',
                name: 'Free Standard Shipping (Qualified Order)',
                cost: 0,
                days: shippingInfo.standard.days
            };
        }
    } else {
        return {
            id: 'standard-paid',
            name: 'Standard Shipping',
            cost: shippingCost,
            days: shippingInfo.standard.days
        };
    }
}

// Country/Currency Selection Handler
function handleCountryChange(countryCode, currencyCode) {
    currentCountry = countryCode;
    currentCurrency = CURRENCY_CONFIG[countryCode];

    // Update all price displays
    updateProductPrices();
    updateCartUI();
    updateShippingInfo();

    // Update PayPal SDK if needed
    reinitializePayPalSDK();

    // Save to localStorage
    localStorage.setItem('selectedCountry', countryCode);

    showNotification(`Switched to ${currentCurrency.flag} ${currentCurrency.name}`);
}

// Update Product Prices Throughout UI
function updateProductPrices() {
    // Update product grid
    displayProducts(products);

    // Update modal if open
    const modalPrice = document.getElementById('modal-product-price');
    if (modalPrice && modalPrice.dataset.basePrice) {
        const convertedPrice = convertPrice(parseFloat(modalPrice.dataset.basePrice), currentCurrency.code);
        modalPrice.textContent = formatPrice(convertedPrice, currentCurrency);
    }
}

// Update Shipping Information
function updateShippingInfo() {
    const shippingInfo = currentCurrency.shipping;
    const shippingCost = calculateShippingCost();
    const selectedMethod = getSelectedShippingMethod();
    const countryName = Object.keys(CURRENCY_CONFIG).find(key => CURRENCY_CONFIG[key].code === currentCurrency.code);
    const countryDisplayName = {
        'HK': 'Hong Kong',
        'US': 'United States', 
        'GB': 'United Kingdom'
    }[countryName];

    // Update hero section
    const heroShippingText = document.getElementById('hero-shipping-text');
    if (heroShippingText) {
        if (shippingCost === 0) {
            heroShippingText.textContent = `Free shipping to ${countryDisplayName} • Express delivery available`;
        } else {
            heroShippingText.textContent = `Shipping to ${countryDisplayName} from ${currentCurrency.symbol}${shippingCost} • Express available`;
        }
    }

    // Update cart shipping info with current shipping cost
    const cartShippingInfo = document.getElementById('cart-shipping-info');
    if (cartShippingInfo) {
        if (shippingCost === 0) {
            cartShippingInfo.innerHTML = `<span class="shipping-badge">FREE</span> ${selectedMethod.name}`;
        } else {
            cartShippingInfo.textContent = `${selectedMethod.name}: ${formatPrice(shippingCost, currentCurrency)}`;
        }
    }

    // Update shipping preview
    const shippingPreview = document.getElementById('shipping-preview');
    if (shippingPreview) {
        if (shippingCost === 0) {
            shippingPreview.innerHTML = '<small><span class="shipping-badge">FREE</span> Standard shipping included</small>';
        } else {
            shippingPreview.innerHTML = `<small>Standard: ${currentCurrency.symbol}${shippingInfo.standard.cost} • Express: ${currentCurrency.symbol}${shippingInfo.express.cost}</small>`;
        }
    }

    // Update modal shipping info
    const modalShippingText = document.getElementById('modal-shipping-text');
    if (modalShippingText) {
        if (shippingCost === 0) {
            modalShippingText.textContent = `Free shipping to ${countryDisplayName}`;
        } else {
            modalShippingText.textContent = `Shipping to ${countryDisplayName}: ${currentCurrency.symbol}${shippingCost}`;
        }
    }
}

// Reinitialize PayPal SDK with new currency
function reinitializePayPalSDK() {
    // Remove existing PayPal script
    const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
    if (existingScript) {
        existingScript.remove();
    }

    // Add new script with current currency
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.CLIENT_ID}&currency=${currentCurrency.code}&intent=capture&components=buttons,messages&enable-funding=venmo&disable-funding=card`;
    script.onload = () => {
        setTimeout(() => {
            renderPayPalButtons();
        }, 500);
    };
    document.head.appendChild(script);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load saved country preference
    const savedCountry = localStorage.getItem('selectedCountry') || 'HK';
    const savedCurrencyCode = CURRENCY_CONFIG[savedCountry]?.code || 'HKD';

    // Set country selector
    countryCurrencySelector.value = `${savedCountry}|${savedCurrencyCode}`;
    handleCountryChange(savedCountry, savedCurrencyCode);

    displayProducts(products);
    updateCartUI();
    setupEventListeners();
    initializePayPalButtons();
});

// Event Listeners Setup
function setupEventListeners() {
    // Country/Currency selector
    countryCurrencySelector.addEventListener('change', function() {
        const [countryCode, currencyCode] = this.value.split('|');
        handleCountryChange(countryCode, currencyCode);
    });

    // Cart toggle
    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Filters
    categoryFilter.addEventListener('change', filterProducts);
    priceFilter.addEventListener('change', filterProducts);

    // Cart actions
    checkoutBtn.addEventListener('click', openCheckoutModal);
    clearCartBtn.addEventListener('click', clearCart);

    // Modal close
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });

    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            categoryFilter.value = category;
            filterProducts();
            scrollToProducts();
        });
    });

    // Checkout form
    document.getElementById('checkout-form').addEventListener('submit', handleTraditionalCheckout);
}

// PayPal Integration Functions with Shipping Callbacks
function initializePayPalButtons() {
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK not loaded');
        return;
    }

    renderPayPalButtons();
}

function renderPayPalButtons() {
    // Clear existing PayPal buttons
    if (paypalButtonsInstance) {
        paypalButtonsInstance.close();
        paypalButtonsInstance = null;
    }

    if (cart.length === 0) {
        paypalButtonContainer.style.display = 'none';
        const payLaterMessage = document.getElementById('paypal-paylater-message');
        if (payLaterMessage) {
            payLaterMessage.innerHTML = '';
        }
        return;
    }

    paypalButtonContainer.style.display = 'block';
    paypalButtonContainer.innerHTML = '';

    // ENHANCED: Calculate totals including shipping
    const itemsTotal = calculateCartItemsTotal();
    const shippingCost = calculateShippingCost();
    const orderTotal = itemsTotal + shippingCost;

    // Render Pay Later messaging with current currency (total including shipping)
    const payLaterMessage = document.getElementById('paypal-paylater-message');
    if (payLaterMessage && paypal.Messages) {
        paypal.Messages({
            amount: orderTotal.toFixed(2), // Include shipping in Pay Later calculation
            placement: 'cart',
            style: {
                layout: 'text',
                logo: {
                    type: 'inline',
                    position: 'left'
                }
            }
        }).render('#paypal-paylater-message');
    }

    paypalButtonsInstance = paypal.Buttons({
        style: {
            shape: 'rect',
            color: 'gold',
            layout: 'horizontal',
            label: 'paypal',
            tagline: false,
            height: 45
        },

        createOrder: async function(data, actions) {
            try {
                showLoading('Creating PayPal order...');

                // ENHANCED: Calculate totals with shipping breakdown
                const itemsTotal = calculateCartItemsTotal();
                const shippingCost = calculateShippingCost();
                const orderTotal = itemsTotal + shippingCost;

                console.log(`💰 Order totals: Items: ${currentCurrency.symbol}${itemsTotal.toFixed(2)}, Shipping: ${currentCurrency.symbol}${shippingCost.toFixed(2)}, Total: ${currentCurrency.symbol}${orderTotal.toFixed(2)}`);

                // Enhanced order data with proper shipping breakdown
                const orderData = {
                    intent: 'CAPTURE',
                    payment_source: {
                        paypal: {
                            experience_context: {
                                user_action: 'PAY_NOW',
                                shipping_preference: 'GET_FROM_FILE', // Enable server-side shipping callbacks
                                brand_name: 'ActionFigure Vault',
                                return_url: window.location.origin + '/success',
                                cancel_url: window.location.origin + '/cancel',
                                // ENHANCED: Enable both address and shipping option callbacks
                                order_update_callback_config: {
                                    callback_url: `${PAYPAL_CONFIG.SERVER_URL}/api/paypal/shipping-callback`,
                                    callback_events: ['SHIPPING_ADDRESS', 'SHIPPING_OPTIONS'] // Handle both events
                                }
                            }
                        }
                    },
                    purchase_units: [{
                        //reference ID for shipping callback to uniquely identify the transaction
                        reference_id: `RFID${Math.random().toString().substring(2,12)}`,
                        amount: {
                            currency_code: currentCurrency.code,
                            value: orderTotal.toFixed(2), // Total including shipping
                            breakdown: {
                                item_total: {
                                    currency_code: currentCurrency.code,
                                    value: itemsTotal.toFixed(2) // Items only
                                },
                                shipping: {
                                    currency_code: currentCurrency.code,
                                    value: shippingCost.toFixed(2) // Shipping cost
                                }
                            }
                        },
                        // Fixed items array - removing unsupported PayPal fields
                        items: cart.map(cartItem => {
                            const product = products.find(p => p.id === cartItem.id);
                            const convertedPrice = getProductPrice(product);
                            return {
                                name: cartItem.name,
                                unit_amount: {
                                    currency_code: currentCurrency.code,
                                    value: convertedPrice.toFixed(2)
                                },
                                quantity: cartItem.quantity.toString(),
                                category: 'PHYSICAL_GOODS',
                                sku: product ? product.sku : `SKU-${cartItem.id}`
                            };
                        }),
                        shipping: {
                            address: getDefaultShippingAddress()
                        }
                    }]
                };

                // Call server to create PayPal order with shipping callbacks
                const response = await fetch(`${PAYPAL_CONFIG.SERVER_URL}/api/paypal/create-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });

                if (!response.ok) {
                    throw new Error('Failed to create PayPal order');
                }

                const orderResult = await response.json();
                hideLoading();

                return orderResult.id;

            } catch (error) {
                console.error('Error creating PayPal order:', error);
                hideLoading();
                showNotification('Failed to create PayPal order. Please try again.');
                throw error;
            }
        },

        onApprove: async function(data, actions) {
            try {
                showLoading('Processing payment...');
                console.log('[PayPal] onApprove called with:', data);
                // Call server to capture payment
                console.log('Attempting to Capture Payment');
                const response = await fetch(`${PAYPAL_CONFIG.SERVER_URL}/api/paypal/capture-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderID: data.orderID,
                        cartItems: cart
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to capture PayPal payment');
                }

                const captureResult = await response.json();
                hideLoading();

                // Show success modal with enhanced order details
                showOrderSuccess(captureResult);

                // Clear cart after successful payment
                cart = [];
                saveCart();
                updateCartUI();
                toggleCart();

            } catch (error) {
                console.error('Error capturing PayPal payment:', error);
                hideLoading();
                showNotification('Payment failed. Please try again.');
            }
        },

        onError: function(err) {
            console.error('PayPal Buttons Error:', err);
            hideLoading();
            showNotification('PayPal error occurred. Please try again.');
        },

        onCancel: function(data) {
            console.log('PayPal payment cancelled:', data);
            hideLoading();
            showNotification('Payment cancelled.');
        }
    });

    paypalButtonsInstance.render('#paypal-button-container');
}

// Get default shipping address based on current country
function getDefaultShippingAddress() {
    const addresses = {
        'HK': {
            address_line_1: 'Central District',
            admin_area_2: 'Hong Kong',
            admin_area_1: 'HK',
            postal_code: '00000',
            country_code: 'HK'
        },
        'US': {
            address_line_1: '123 Main St',
            admin_area_2: 'New York',
            admin_area_1: 'NY',
            postal_code: '10001',
            country_code: 'US'
        },
        'GB': {
            address_line_1: '123 High Street',
            admin_area_2: 'London',
            admin_area_1: 'England',
            postal_code: 'SW1A 1AA',
            country_code: 'GB'
        }
    };

    return addresses[currentCountry] || addresses['HK'];
}

// **FIXED**: Enhanced Order Success Function to use actual PayPal data
function showOrderSuccess(orderData) {
    const modal = document.getElementById('success-modal');
    const orderId = document.getElementById('order-id');
    const transactionId = document.getElementById('transaction-id');
    const amountPaid = document.getElementById('amount-paid');
    const amountPaidCurrency = document.getElementById('amount-paid-currency');
    const paymentStatus = document.getElementById('payment-status');
    const shippingAddress = document.getElementById('shipping-address');
    const successOrderItems = document.getElementById('success-order-items');
    const successShippingMethod = document.getElementById('success-shipping-method');
    const successDeliveryEstimate = document.getElementById('success-delivery-estimate');

    // Calculate totals for display
    const itemsTotal = calculateCartItemsTotal();
    
    // **FIXED**: Use actual shipping data from PayPal response instead of client calculation
    let actualShippingCost = 0;
    let actualShippingMethod = 'Standard Shipping';
    let estimatedDays = '5-7 business days';

    if (orderData.actualShippingDetails) {
        actualShippingCost = orderData.actualShippingDetails.cost;
        actualShippingMethod = orderData.actualShippingDetails.label;
        
        // Extract delivery estimate from shipping method label
        const daysMatch = actualShippingMethod.match(/\(([^)]+)\)/);
        if (daysMatch) {
            estimatedDays = `${daysMatch[1]} business days`;
        }
    } else if (orderData.shippingMethod && orderData.shippingCost) {
        actualShippingCost = parseFloat(orderData.shippingCost);
        actualShippingMethod = orderData.shippingMethod;
        
        // Extract delivery estimate from shipping method
        const daysMatch = actualShippingMethod.match(/\(([^)]+)\)/);
        if (daysMatch) {
            estimatedDays = `${daysMatch[1]} business days`;
        }
    }

    // Populate order details
    orderId.textContent = orderData.orderID || 'N/A';
    transactionId.textContent = orderData.transactionID || 'N/A';
    amountPaid.textContent = orderData.amount || (itemsTotal + actualShippingCost).toFixed(2);
    amountPaidCurrency.textContent = currentCurrency.symbol;
    paymentStatus.textContent = orderData.status || 'COMPLETED';
    shippingAddress.textContent = orderData.shippingAddress || 'N/A';

    // Populate order items with pricing in current currency
    successOrderItems.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        const convertedPrice = product ? getProductPrice(product) : item.price;
        return `
            <div class="success-item">
                <span>${item.name} (${item.sku}) x ${item.quantity}</span>
                <span>${formatPrice(convertedPrice * item.quantity, currentCurrency)}</span>
            </div>
        `;
    }).join('');

    // **FIXED**: Add shipping cost breakdown using actual PayPal data
    if (actualShippingCost > 0) {
        successOrderItems.innerHTML += `
            <div class="success-item">
                <span>Shipping (${actualShippingMethod})</span>
                <span>${formatPrice(actualShippingCost, currentCurrency)}</span>
            </div>
            <div class="success-item total">
                <span><strong>Total Amount</strong></span>
                <span><strong>${formatPrice(itemsTotal + actualShippingCost, currentCurrency)}</strong></span>
            </div>
        `;
    } else {
        successOrderItems.innerHTML += `
            <div class="success-item">
                <span>Shipping (${actualShippingMethod})</span>
                <span>FREE</span>
            </div>
        `;
    }

    // **FIXED**: Update shipping method and delivery estimate with actual data
    successShippingMethod.textContent = actualShippingMethod;
    successDeliveryEstimate.textContent = estimatedDays;

    console.log(`✅ Success modal updated with actual shipping: ${actualShippingMethod} - ${actualShippingCost}`);
    modal.style.display = 'block';
}


function continueShopping() {
    closeModals();
    scrollToProducts();
}

// Loading Functions with Custom Messages
function showLoading(message = 'Processing...') {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = message;
    }
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Display Products with Current Currency
function displayProducts(productsToShow) {
    if (!productGrid) return;

    productGrid.innerHTML = '';

    if (productsToShow.length === 0) {
        productGrid.innerHTML = '<div class="empty-state"><p>No products found matching your criteria.</p></div>';
        return;
    }

    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

// Create Product Card with Current Currency
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const convertedPrice = getProductPrice(product);
    const priceDisplay = formatPrice(convertedPrice, currentCurrency);

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge}</span>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-category">${capitalizeFirst(product.category)}</p>
            <p class="product-sku">SKU: ${product.sku}</p>
            <div class="product-price">${priceDisplay}</div>
            <div class="product-actions">
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
                <button class="view-product-btn" onclick="viewProduct(${product.id})">
                    View Details
                </button>
            </div>
        </div>
    `;
    return card;
}

// Filter Products (Updated for Currency)
function filterProducts() {
    const categoryValue = categoryFilter.value;
    const priceValue = priceFilter.value;

    let filteredProducts = products;

    // Filter by category
    if (categoryValue !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === categoryValue);
    }

    // Filter by price (convert to current currency)
    if (priceValue !== 'all') {
        switch (priceValue) {
            case 'under-100':
                filteredProducts = filteredProducts.filter(product => {
                    const convertedPrice = getProductPrice(product);
                    return convertedPrice < (100 * currentCurrency.rate);
                });
                break;
            case '100-300':
                filteredProducts = filteredProducts.filter(product => {
                    const convertedPrice = getProductPrice(product);
                    return convertedPrice >= (100 * currentCurrency.rate) && convertedPrice <= (300 * currentCurrency.rate);
                });
                break;
            case 'over-300':
                filteredProducts = filteredProducts.filter(product => {
                    const convertedPrice = getProductPrice(product);
                    return convertedPrice > (300 * currentCurrency.rate);
                });
                break;
        }
    }

    displayProducts(filteredProducts);
}

// Add to Cart with Currency Support
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const convertedPrice = getProductPrice(product);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
        // Update price to current currency
        existingItem.price = convertedPrice;
        existingItem.currency = currentCurrency.code;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: convertedPrice,
            currency: currentCurrency.code,
            image: product.image,
            sku: product.sku,
            upc: product.upc,
            image_url: product.image_url,
            url: product.url,
            quantity: quantity,
            weight: product.weight
        });
    }

    saveCart();
    updateCartUI();
    showNotification(`${product.name} added to cart!`);
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Update Cart Item Quantity
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            // Update price to current currency
            const product = products.find(p => p.id === productId);
            if (product) {
                item.price = getProductPrice(product);
                item.currency = currentCurrency.code;
            }
            saveCart();
            updateCartUI();
        }
    }
}

// Clear Cart
function clearCart() {
    if (cart.length === 0) return;

    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        updateCartUI();
        showNotification('Cart cleared!');
    }
}

// ENHANCED: Calculate cart items total (without shipping)
function calculateCartItemsTotal() {
    return cart.reduce((sum, item) => {
        // Ensure price is in current currency
        const product = products.find(p => p.id === item.id);
        if (product) {
            const currentPrice = getProductPrice(product);
            return sum + (currentPrice * item.quantity);
        }
        return sum + (item.price * item.quantity);
    }, 0);
}

// ENHANCED: Calculate cart total including shipping
function calculateCartTotal() {
    const itemsTotal = calculateCartItemsTotal();
    const shippingCost = calculateShippingCost();
    return itemsTotal + shippingCost;
}

// Update Cart UI with Currency Support
function updateCartUI() {
    updateCartCount();
    updateCartItems();
    updateCartTotal();
    updateShippingInfo(); // Update shipping info when cart changes
    renderPayPalButtons();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function updateCartItems() {
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map(item => {
        // Ensure pricing is in current currency
        const product = products.find(p => p.id === item.id);
        const currentPrice = product ? getProductPrice(product) : item.price;

        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-sku">SKU: ${item.sku}</div>
                    <div class="cart-item-price">${formatPrice(currentPrice, currentCurrency)}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="remove-item-btn" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ENHANCED: Update cart total with shipping breakdown
function updateCartTotal() {
    const itemsTotal = calculateCartItemsTotal();
    const shippingCost = calculateShippingCost();
    const total = itemsTotal + shippingCost;

    if (cartTotal) cartTotal.textContent = total.toFixed(2);
    if (cartCurrency) cartCurrency.textContent = currentCurrency.symbol;

    // ENHANCED: Update cart summary with shipping breakdown
    const cartSummary = document.querySelector('.cart-summary');
    if (cartSummary && cart.length > 0) {
        // Find existing breakdown or create it
        let breakdown = cartSummary.querySelector('.cart-breakdown');
        if (!breakdown) {
            breakdown = document.createElement('div');
            breakdown.className = 'cart-breakdown';
            breakdown.style.cssText = 'margin-bottom: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; font-size: 0.9rem;';
            cartSummary.insertBefore(breakdown, cartSummary.querySelector('.cart-total'));
        }

        const selectedMethod = getSelectedShippingMethod();
        breakdown.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Items:</span>
                <span>${currentCurrency.symbol}${itemsTotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Shipping:</span>
                <span style="color: ${shippingCost === 0 ? '#2ed573' : 'inherit'}; font-weight: ${shippingCost === 0 ? 'bold' : 'normal'};">
                    ${shippingCost === 0 ? 'FREE' : currentCurrency.symbol + shippingCost.toFixed(2)}
                </span>
            </div>
            <div style="border-top: 1px solid #ddd; padding-top: 0.5rem; font-size: 0.8rem; color: #666;">
                ${selectedMethod.name} (${selectedMethod.days})
            </div>
        `;
    }

    // Update checkout total if modal is open
    const checkoutTotal = document.getElementById('checkout-total');
    const checkoutCurrency = document.getElementById('checkout-currency');
    if (checkoutTotal) checkoutTotal.textContent = total.toFixed(2);
    if (checkoutCurrency) checkoutCurrency.textContent = currentCurrency.symbol;
}

// Cart Toggle
function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
}

// View Product Details with Enhanced Information
function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const convertedPrice = getProductPrice(product);
    const priceDisplay = formatPrice(convertedPrice, currentCurrency);

    // Populate modal with product details
    document.getElementById('modal-product-image').src = product.image;
    document.getElementById('modal-product-name').textContent = product.name;
    const modalPriceEl = document.getElementById('modal-product-price');
    modalPriceEl.textContent = priceDisplay;
    modalPriceEl.dataset.basePrice = product.basePrice; // Store base price for currency switching
    document.getElementById('modal-product-description').textContent = product.description;

    // Add enhanced product info
    const existingProductInfo = document.querySelector('.modal-product-info');
    if (existingProductInfo) {
        existingProductInfo.remove();
    }

    const productInfo = document.createElement('div');
    productInfo.className = 'modal-product-info';
    productInfo.innerHTML = `
        <div class="product-info-item"><strong>SKU:</strong> ${product.sku}</div>
        <div class="product-info-item"><strong>UPC:</strong> ${product.upc}</div>
        <div class="product-info-item"><strong>Weight:</strong> ${product.weight}kg</div>
        <div class="product-info-item"><strong>Product URL:</strong> <a href="${product.url}" target="_blank">${product.url}</a></div>
        <div class="product-info-item"><strong>High-Res Image:</strong> <a href="${product.image_url}" target="_blank">View Full Size</a></div>
    `;

    // Insert after description
    const descriptionElement = document.getElementById('modal-product-description');
    descriptionElement.parentNode.insertBefore(productInfo, descriptionElement.nextSibling);

    // Update shipping info based on current country
    updateShippingInfo();

    // Populate specifications
    const specsList = document.getElementById('modal-product-specs');
    specsList.innerHTML = product.specs.map(spec => `<li>${spec}</li>`).join('');

    // Reset quantity
    document.getElementById('modal-quantity').value = 1;

    // Set up add to cart button
    const modalAddBtn = document.getElementById('modal-add-to-cart');
    modalAddBtn.onclick = () => {
        const quantity = parseInt(document.getElementById('modal-quantity').value);
        addToCart(productId, quantity);
        closeModals();
    };

    productModal.style.display = 'block';
}

// Quantity Controls in Modal
function increaseQuantity() {
    const quantityInput = document.getElementById('modal-quantity');
    const currentValue = parseInt(quantityInput.value);
    if (currentValue < 10) {
        quantityInput.value = currentValue + 1;
    }
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('modal-quantity');
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
    }
}

// Open Traditional Checkout Modal with Shipping Options
function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }

    // ENHANCED: Populate checkout items with shipping breakdown
    const itemsTotal = calculateCartItemsTotal();
    const shippingCost = calculateShippingCost();
    const selectedMethod = getSelectedShippingMethod();

    const checkoutItemsDiv = document.getElementById('checkout-items');
    checkoutItemsDiv.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        const currentPrice = product ? getProductPrice(product) : item.price;
        return `
            <div class="checkout-item">
                <span>${item.name} (${item.sku}) x ${item.quantity}</span>
                <span>${formatPrice(currentPrice * item.quantity, currentCurrency)}</span>
            </div>
        `;
    }).join('');

    // Add shipping breakdown
    if (shippingCost > 0) {
        checkoutItemsDiv.innerHTML += `
            <div class="checkout-item" style="border-top: 1px solid #eee; padding-top: 0.5rem; margin-top: 0.5rem;">
                <span>Shipping (${selectedMethod.name})</span>
                <span>${formatPrice(shippingCost, currentCurrency)}</span>
            </div>
        `;
    } else {
        checkoutItemsDiv.innerHTML += `
            <div class="checkout-item" style="border-top: 1px solid #eee; padding-top: 0.5rem; margin-top: 0.5rem;">
                <span>Shipping (${selectedMethod.name})</span>
                <span style="color: #2ed573; font-weight: bold;">FREE</span>
            </div>
        `;
    }

    // Update shipping options based on current country
    updateCheckoutShippingOptions();

    updateCartTotal();
    checkoutModal.style.display = 'block';
    toggleCart();
}

// Update Checkout Shipping Options
function updateCheckoutShippingOptions() {
    const shippingOptionsDiv = document.getElementById('checkout-shipping-options');
    const shippingInfo = currentCurrency.shipping;
    const shippingCost = calculateShippingCost();

    let optionsHTML = '';

    if (shippingCost === 0) {
        optionsHTML = `
            <div class="shipping-option">
                <input type="radio" id="free-shipping" name="shipping" value="free" checked>
                <label for="free-shipping">
                    <span class="shipping-name">Free Standard Shipping (${shippingInfo.standard.days})</span>
                    <span class="shipping-cost">FREE</span>
                </label>
            </div>
        `;
    } else {
        optionsHTML = `
            <div class="shipping-option">
                <input type="radio" id="standard-shipping" name="shipping" value="standard" checked>
                <label for="standard-shipping">
                    <span class="shipping-name">Standard Shipping (${shippingInfo.standard.days})</span>
                    <span class="shipping-cost">${formatPrice(shippingInfo.standard.cost, currentCurrency)}</span>
                </label>
            </div>
            <div class="shipping-option">
                <input type="radio" id="express-shipping" name="shipping" value="express">
                <label for="express-shipping">
                    <span class="shipping-name">Express Shipping (${shippingInfo.express.days})</span>
                    <span class="shipping-cost">${formatPrice(shippingInfo.express.cost, currentCurrency)}</span>
                </label>
            </div>
        `;
    }

    if (shippingOptionsDiv) {
        shippingOptionsDiv.innerHTML = optionsHTML;
    }
}

// Handle Traditional Checkout
function handleTraditionalCheckout(e) {
    e.preventDefault();

    showLoading('Processing your order...');

    setTimeout(() => {
        const orderData = {
            orderID: 'ORD' + Date.now(),
            transactionID: 'TXN' + Date.now(),
            amount: calculateCartTotal().toFixed(2),
            status: 'COMPLETED',
            currency: currentCurrency.code,
            shippingAddress: 'Traditional checkout address'
        };

        showOrderSuccess(orderData);

        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        closeModals();
        hideLoading();
    }, 2000);
}

// Close Modals
function closeModals() {
    productModal.style.display = 'none';
    checkoutModal.style.display = 'none';
    successModal.style.display = 'none';
}

// Save Cart to Local Storage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Utility Functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({
        behavior: 'smooth'
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Enhanced search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = prompt('Search for products (by name, category, or SKU):');
            if (searchTerm) {
                const searchResults = products.filter(product => 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (searchResults.length > 0) {
                    displayProducts(searchResults);
                    const searchInfo = document.createElement('div');
                    searchInfo.className = 'search-results-info';
                    searchInfo.textContent = `Found ${searchResults.length} result(s) for "${searchTerm}" in ${currentCurrency.name}`;
                    productGrid.parentNode.insertBefore(searchInfo, productGrid);

                    setTimeout(() => {
                        if (searchInfo.parentNode) {
                            searchInfo.parentNode.removeChild(searchInfo);
                        }
                    }, 5000);
                } else {
                    alert(`No products found matching "${searchTerm}"`);
                }

                scrollToProducts();
            }
        });
    }
});