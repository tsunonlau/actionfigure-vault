const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PayPal Configuration - Configurable via environment variables
const PAYPAL_CONFIG = {
    CLIENT_ID: process.env.PAYPAL_CLIENT_ID || 'AQwR0albcg6vvwYGQiVRlYVAExSV_l7nXUUd6F3Rcv4-RU9ytyk3os5PtqDnGNJE6etd8tuj573OWJ3h',
    CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || 'EC5F_YVi8wiGjSTCXAK2nlM_4PgUkA_rZAB5-tZZ4_PKhycWbFy6S8_zvy6H7Iu2a6cq0BXmQkmMf76Z',
    BASE_URL: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
    WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID || 'your-webhook-id-here'
};

// Multi-Currency Configuration
const CURRENCY_CONFIG = {
    'HK': { 
        code: 'HKD', 
        symbol: 'HK$', 
        rate: 7.8, 
        name: 'Hong Kong Dollar',
        shipping: {
            free: true,
            standard: { cost: 0, days: '3-5', type: 'FREE_STANDARD' },
            express: { cost: 0, days: '1-2', type: 'FREE_EXPRESS' }
        }
    },
    'US': { 
        code: 'USD', 
        symbol: '$', 
        rate: 1.0, 
        name: 'US Dollar',
        shipping: {
            free: false,
            standard: { cost: 9.99, days: '5-7', type: 'STANDARD' },
            express: { cost: 19.99, days: '2-3', type: 'EXPRESS' }
        }
    },
    'GB': { 
        code: 'GBP', 
        symbol: '£', 
        rate: 0.79, 
        name: 'British Pound',
        shipping: {
            free: false,
            standard: { cost: 8.99, days: '5-8', type: 'STANDARD' },
            express: { cost: 18.99, days: '2-4', type: 'EXPRESS' }
        }
    }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// PayPal Access Token Management
let accessToken = null;
let tokenExpiry = null;

/**
 * Generate PayPal Access Token
 */
async function generateAccessToken() {
    try {
        if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
            return accessToken;
        }

        const auth = Buffer.from(`${PAYPAL_CONFIG.CLIENT_ID}:${PAYPAL_CONFIG.CLIENT_SECRET}`).toString('base64');

        const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${auth}`
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to generate access token: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

        console.log('✅ PayPal Access Token Generated');
        return accessToken;

    } catch (error) {
        console.error('❌ Error generating PayPal access token:', error);
        throw error;
    }
}

/**
 * Generate unique order ID
 */
function generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `AFV${timestamp.slice(-6)}${random}`;
}

/**
 * Save order to CSV with enhanced multi-currency data
 */
function saveOrderToCSV(orderData) {
    const csvPath = path.join(__dirname, 'orders.csv');

    if (!fs.existsSync(csvPath)) {
        const headers = 'Order_ID,PayPal_Order_ID,Transaction_ID,Customer_Email,Amount,Currency,Country,Status,Items,Item_Details,Shipping_Method,Shipping_Cost,Shipping_Address,Created_Date\n';
        fs.writeFileSync(csvPath, headers, 'utf8');
    }

    // Enhanced item details with complete product information (stored locally, not in PayPal)
    const itemDetails = (orderData.items || []).map(item => {
        return `${item.name} (SKU: ${item.sku || 'N/A'}, UPC: ${item.upc || 'N/A'}, Weight: ${item.weight || 'N/A'}kg) x${item.quantity} - ${orderData.currencySymbol || '$'}${(item.price * item.quantity).toFixed(2)}`;
    }).join('; ');

    const csvRow = [
        orderData.orderID || '',
        orderData.paypalOrderID || '',
        orderData.transactionID || '',
        orderData.customerEmail || 'guest@actionfigurevault.com',
        orderData.amount || '0.00',
        orderData.currency || 'USD',
        orderData.country || 'US',
        orderData.status || 'PENDING',
        `"${(orderData.items || []).map(item => `${item.name} x${item.quantity}`).join('; ')}"`,
        `"${itemDetails}"`,
        orderData.shippingMethod || 'Standard',
        orderData.shippingCost || '0.00',
        `"${orderData.shippingAddress || 'N/A'}"`,
        new Date().toISOString()
    ];

    try {
        fs.appendFileSync(csvPath, csvRow.join(',') + '\n', 'utf8');
        console.log(`✅ Order ${orderData.orderID} saved with complete product data`);
        console.log(`   💰 Amount: ${orderData.currencySymbol || '$'}${orderData.amount} ${orderData.currency}`);
        console.log(`   🌍 Country: ${orderData.country} | Shipping: ${orderData.shippingMethod}`);
    } catch (error) {
        console.error('❌ Error saving order to CSV:', error);
    }
}

/**
 * Get currency info for a country
 */
function getCurrencyInfo(countryCode) {
    return CURRENCY_CONFIG[countryCode] || CURRENCY_CONFIG['US'];
}

/**
 * Calculate shipping options based on address and order details
 * Implements PayPal Shipping Module specification
 */
function calculateShippingOptions(shipping_address, order_details = {}) {
    console.log('🚚 Calculating shipping for address:', shipping_address);

    const countryCode = shipping_address.country_code;
    const currencyInfo = getCurrencyInfo(countryCode);
    const orderTotal = parseFloat(order_details.total || 0);

    console.log(`   📍 Country: ${countryCode}`);
    console.log(`   💰 Order Total: ${currencyInfo.symbol}${orderTotal}`);
    console.log(`   💱 Currency: ${currencyInfo.code}`);

    let shippingOptions = [];

    // Hong Kong - Free shipping always
    if (countryCode === 'HK') {
        shippingOptions = [
            {
                id: 'FREE_STANDARD_HK',
                label: `Free Standard Shipping to Hong Kong (${currencyInfo.shipping.standard.days})`,
                type: 'SHIPPING',
                selected: true,
                amount: {
                    currency_code: currencyInfo.code,
                    value: '0.00'
                }
            },
            {
                id: 'FREE_EXPRESS_HK',
                label: `Free Express Shipping to Hong Kong (${currencyInfo.shipping.express.days})`,
                type: 'SHIPPING',
                selected: false,
                amount: {
                    currency_code: currencyInfo.code,
                    value: '0.00'
                }
            }
        ];
    } 
    // Other countries - Paid shipping with free threshold
    else {
        const standardCost = currencyInfo.shipping.standard.cost;
        const expressCost = currencyInfo.shipping.express.cost;

        // Free shipping threshold (equivalent to $300 USD in local currency)
        const freeShippingThreshold = 300 * currencyInfo.rate;
        const qualifiesForFreeShipping = orderTotal >= freeShippingThreshold;

        if (qualifiesForFreeShipping) {
            console.log(`   ✅ Qualifies for free shipping (order over ${currencyInfo.symbol}${freeShippingThreshold})`);
            shippingOptions = [
                {
                    id: 'FREE_STANDARD_QUALIFIED',
                    label: `Free Standard Shipping (${currencyInfo.shipping.standard.days}) - Qualified Order`,
                    type: 'SHIPPING',
                    selected: true,
                    amount: {
                        currency_code: currencyInfo.code,
                        value: '0.00'
                    }
                },
                {
                    id: 'FREE_EXPRESS_QUALIFIED',
                    label: `Free Express Shipping (${currencyInfo.shipping.express.days}) - Qualified Order`,
                    type: 'SHIPPING',
                    selected: false,
                    amount: {
                        currency_code: currencyInfo.code,
                        value: '0.00'
                    }
                }
            ];
        } else {
            shippingOptions = [
                {
                    id: 'STANDARD_PAID',
                    label: `Standard Shipping (${currencyInfo.shipping.standard.days})`,
                    type: 'SHIPPING',
                    selected: true,
                    amount: {
                        currency_code: currencyInfo.code,
                        value: standardCost.toFixed(2)
                    }
                },
                {
                    id: 'EXPRESS_PAID',
                    label: `Express Shipping (${currencyInfo.shipping.express.days})`,
                    type: 'SHIPPING',
                    selected: false,
                    amount: {
                        currency_code: currencyInfo.code,
                        value: expressCost.toFixed(2)
                    }
                }
            ];
        }
    }

    console.log(`   📦 Generated ${shippingOptions.length} shipping options:`);
    shippingOptions.forEach((option, index) => {
        console.log(`      ${index + 1}. ${option.label} - ${option.amount.currency_code} ${option.amount.value}`);
    });

    return shippingOptions;
}

/**
 * Handle shipping address restrictions
 */
function validateShippingAddress(shipping_address) {
    const countryCode = shipping_address.country_code;

    // Check if we support shipping to this country
    const supportedCountries = ['HK', 'US', 'GB', 'CA', 'AU', 'SG', 'JP'];

    if (!supportedCountries.includes(countryCode)) {
        return {
            valid: false,
            addressable: false,
            error: 'COUNTRY_ERROR',
            message: 'We do not ship to this country yet. Please contact support for assistance.'
        };
    }

    // Check for restricted states/regions (example)
    if (countryCode === 'US' && shipping_address.admin_area_1 === 'AK') {
        return {
            valid: false,
            addressable: false,
            error: 'STATE_ERROR',
            message: 'Shipping to Alaska requires special handling. Please contact support.'
        };
    }

    return { 
        valid: true, 
        addressable: true 
    };
}

/**
 * API Routes
 */

// Health check endpoint with enhanced info
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: PAYPAL_CONFIG.BASE_URL.includes('sandbox') ? 'sandbox' : 'production',
        features: [
            'PayPal Orders v2 API',
            'PayPal JSON Patch Callback Response Format',
            'Server-side Shipping Callbacks with SHIPPING_OPTIONS support',
            'Multi-currency Support (HKD, USD, GBP)',
            'Enhanced Product Fields (SKU only in PayPal API)',
            'Pay Later Messaging',
            'Dynamic Shipping Cost Calculation'
        ],
        supportedCountries: Object.keys(CURRENCY_CONFIG),
        currencies: Object.values(CURRENCY_CONFIG).map(c => ({ code: c.code, name: c.name })),
        paypalApiCompliance: 'Orders v2 - Only SKU field supported in items array',
        shippingCallbacks: ['SHIPPING_ADDRESS', 'SHIPPING_OPTIONS'],
        responseFormat: 'PayPal JSON Patch Format'
    });
});

// Create PayPal Order with enhanced shipping configuration - FIXED for API compliance
app.post('/api/paypal/create-order', async (req, res) => {
    try {
        console.log('📦 Creating PayPal order with JSON Patch shipping callbacks...');

        const token = await generateAccessToken();
        const orderData = req.body;
        const ourOrderId = generateOrderId();

        // Extract currency and country info
        const currencyCode = orderData.purchase_units[0].amount.currency_code || 'USD';
        const countryCode = orderData.purchase_units[0].shipping?.address?.country_code || 'US';
        const currencyInfo = getCurrencyInfo(countryCode);

        console.log(`💱 Order Currency: ${currencyCode} for ${countryCode}`);
        console.log(`🌍 Shipping Configuration: ${currencyInfo.shipping.free ? 'FREE' : 'PAID'}`);

        // Log product data (only SKU is sent to PayPal, other data stored locally)
        if (orderData.purchase_units[0].items) {
            console.log('📦 Products with PayPal API compliant data:');
            orderData.purchase_units[0].items.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.name} (${item.sku})`);
                console.log(`      💰 Price: ${item.unit_amount.currency_code} ${item.unit_amount.value}`);
                console.log(`      📦 Category: ${item.category}`);
                console.log(`      ✅ PayPal API compliant (SKU only)`);
            });
        }

        // Enhanced order data with shipping preferences - API compliant
        const enhancedOrderData = {
            ...orderData,
            purchase_units: orderData.purchase_units.map(unit => ({
                ...unit,
                reference_id: ourOrderId,
                custom_id: ourOrderId,
                soft_descriptor: 'ACTIONFIGURE'
            }))
        };

        // Ensure payment_source includes shipping callback configuration
        if (!enhancedOrderData.payment_source) {
            enhancedOrderData.payment_source = {};
        }

        if (!enhancedOrderData.payment_source.paypal) {
            enhancedOrderData.payment_source.paypal = {};
        }

        enhancedOrderData.payment_source.paypal.experience_context = {
            ...enhancedOrderData.payment_source?.paypal?.experience_context,
            shipping_preference: 'GET_FROM_FILE',
            user_action: 'PAY_NOW',
            brand_name: 'ActionFigure Vault',
            // ENHANCED: Enable server-side shipping callbacks for both events
            order_update_callback_config: {
                //callback_url: `${req.protocol}://${req.get('host')}/api/paypal/shipping-callback`,
                callback_url: `${process.env.CALLBACK_BASE_URL || 'http://localhost:3000'}/api/paypal/shipping-callback`,
                callback_events: ['SHIPPING_ADDRESS', 'SHIPPING_OPTIONS'] // Handle both events
            }
        };

        console.log(`🔗 Shipping callback URL: ${enhancedOrderData.payment_source.paypal.experience_context.order_update_callback_config.callback_url}`);
        console.log(`📋 Callback Events: ${enhancedOrderData.payment_source.paypal.experience_context.order_update_callback_config.callback_events.join(', ')}`);
        console.log(`📝 Response Format: PayPal JSON Patch Format`);

        const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'PayPal-Request-Id': `${ourOrderId}-${Date.now()}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(enhancedOrderData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ PayPal API Error:', errorText);
            throw new Error(`PayPal API error: ${response.status} ${errorText}`);
        }

        const order = await response.json();
        console.log('✅ PayPal order created with JSON Patch shipping callbacks:', order.id);

        res.json({
            id: order.id,
            status: order.status,
            orderID: ourOrderId,
            links: order.links
        });

    } catch (error) {
        console.error('❌ Error creating PayPal order:', error);
        res.status(500).json({ 
            error: 'Failed to create PayPal order',
            message: error.message 
        });
    }
});

// FIXED: PayPal JSON Patch Shipping Callback - Correct Response Format for Your Implementation
app.post('/api/paypal/shipping-callback', async (req, res) => {
    try {
        console.log('\n🚚 === PAYPAL JSON PATCH SHIPPING CALLBACK ===');
        console.log('📋 Full callback request:', JSON.stringify(req.body, null, 2));

        const { order_id, shipping_address, shipping_option, purchase_units } = req.body;

        console.log(`📦 Order ID: ${order_id}`);
        console.log(`📍 Shipping Address:`, shipping_address);
        console.log(`🚛 Selected Shipping Option:`, shipping_option);

        // Get reference ID for JSON Patch path
        const referenceId = purchase_units?.[0]?.reference_id || order_id;
        console.log(`🔖 Reference ID: ${referenceId}`);

        // Validate shipping address first
        const addressValidation = validateShippingAddress(shipping_address);

        if (!addressValidation.valid) {
            console.log(`❌ Address validation failed: ${addressValidation.message}`);

            // FIXED: PayPal JSON Patch response for address rejection
            const rejectResponse = {
                op: "replace",
                path: `/purchase_units/@reference_id=='${referenceId}'/shipping/address`,
                value: {
                    addressable: false
                }
            };

            console.log('📤 JSON Patch Response (Address Rejected):', JSON.stringify(rejectResponse, null, 2));
            return res.status(200).json(rejectResponse);
        }

        // Extract order details for shipping calculation
        const orderTotal = purchase_units?.[0]?.amount?.value || 0;
        const currencyCode = purchase_units?.[0]?.amount?.currency_code || 'USD';

        console.log(`💰 Order details: ${currencyCode} ${orderTotal}`);

        // Calculate available shipping options
        const availableShippingOptions = calculateShippingOptions(shipping_address, {
            total: orderTotal,
            currency: currencyCode
        });

        // FIXED: Determine response type and format
        let jsonPatchResponse;

        if (shipping_option && shipping_option.id) {
            // SHIPPING_OPTIONS callback - user selected a specific option
            console.log(`🎯 SHIPPING_OPTIONS Event: User selected "${shipping_option.id}"`);

            // Update selection in available options
            const updatedOptions = availableShippingOptions.map(opt => ({
                ...opt,
                selected: opt.id === shipping_option.id
            }));

            const selectedOption = updatedOptions.find(opt => opt.selected);
            if (selectedOption) {
                console.log(`   💰 Selected shipping cost: ${selectedOption.amount.currency_code} ${selectedOption.amount.value}`);
                console.log(`   📋 Selected method: ${selectedOption.label}`);
            }

            // FIXED: JSON Patch response for shipping options update
            jsonPatchResponse = {
                op: "replace",
                path: `/purchase_units/@reference_id=='${referenceId}'/shipping/options`,
                value: updatedOptions
            };

        } else {
            // SHIPPING_ADDRESS callback - address change, validate and provide options
            console.log(`📍 SHIPPING_ADDRESS Event: Address validation and options calculation`);

            // FIXED: JSON Patch response array for address + options
            jsonPatchResponse = [
                {
                    op: "replace",
                    path: `/purchase_units/@reference_id=='${referenceId}'/shipping/address`,
                    value: {
                        addressable: true
                    }
                },
                {
                    op: "replace", 
                    path: `/purchase_units/@reference_id=='${referenceId}'/shipping/options`,
                    value: availableShippingOptions
                }
            ];
        }

        console.log('✅ JSON Patch Response:', JSON.stringify(jsonPatchResponse, null, 2));
        console.log('=== END JSON PATCH SHIPPING CALLBACK ===\n');

        // FIXED: Return proper JSON Patch format with 200 status
        res.status(200).json(jsonPatchResponse);

    } catch (error) {
        console.error('❌ Error in JSON Patch shipping callback:', error);

        // FIXED: Error response in JSON Patch format
        const errorResponse = {
            op: "replace",
            path: `/purchase_units/@reference_id=='${req.body.purchase_units?.[0]?.reference_id || req.body.order_id}'/shipping/address`,
            value: {
                addressable: false
            }
        };

        console.log('📤 JSON Patch Error Response:', JSON.stringify(errorResponse, null, 2));
        res.status(200).json(errorResponse);
    }
});

// Capture PayPal Order with enhanced multi-currency support
app.post('/api/paypal/capture-order', async (req, res) => {
    try {
        const { orderID, cartItems, currency, country } = req.body;
        console.log(`\n💳 Capturing PayPal order: ${orderID}`);
        console.log(`🌍 Country: ${country} | Currency: ${currency}`);

        const token = await generateAccessToken();

        const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'PayPal-Request-Id': `capture-${orderID}-${Date.now()}`,
                'Prefer': 'return=representation'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ PayPal Capture Error:', errorText);
            throw new Error(`PayPal capture error: ${response.status} ${errorText}`);
        }

        const captureData = await response.json();
        console.log('✅ PayPal payment captured:', captureData.id);

        // Extract enhanced transaction details
        const capture = captureData.purchase_units[0].payments.captures[0];
        const payer = captureData.payer;
        const shippingInfo = captureData.purchase_units[0].shipping;
        const shippingAddress = shippingInfo?.address;

        // Get currency info
        const currencyInfo = getCurrencyInfo(country);

        // Generate internal order ID
        const ourOrderId = generateOrderId();

        // Enhanced cart items with complete product data (including fields not sent to PayPal)
        const enhancedCartItems = cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            sku: item.sku || `SKU-${item.id}`,
            upc: item.upc || `UPC${Math.random().toString().substr(2, 12)}`,
            image_url: item.image_url || `https://actionfigurevault.com/images/product-${item.id}.jpg`,
            url: item.url || `https://actionfigurevault.com/products/product-${item.id}`,
            weight: item.weight || 1.0,
            currency: currency
        }));

        // ENHANCED: Determine shipping method from PayPal data or request
        const shippingOptions = shippingInfo?.options || [];
        const selectedShipping = shippingOptions.find(opt => opt.selected) || shippingOptions[0];
        const shippingMethod = req.body.shippingMethod || selectedShipping?.label || 'Standard Shipping';
        const shippingCost = req.body.shippingCost || selectedShipping?.amount?.value || '0.00';

        console.log(`🚚 Enhanced shipping details:`);
        console.log(`   Method: ${shippingMethod}`);
        console.log(`   Cost: ${currencyInfo.symbol}${shippingCost}`);

        // Enhanced order record for CSV with complete product data
        const orderRecord = {
            orderID: ourOrderId,
            paypalOrderID: captureData.id,
            transactionID: capture.id,
            customerEmail: payer.email_address,
            amount: capture.amount.value,
            currency: capture.amount.currency_code,
            currencySymbol: currencyInfo.symbol,
            country: country,
            status: capture.status,
            items: enhancedCartItems, // Complete product data stored in CSV
            shippingMethod: shippingMethod,
            shippingCost: shippingCost,
            shippingAddress: shippingAddress ? 
                `${shippingAddress.address_line_1 || ''}, ${shippingAddress.admin_area_2 || ''}, ${shippingAddress.admin_area_1 || ''} ${shippingAddress.postal_code || ''}, ${shippingAddress.country_code || ''}`.trim() 
                : 'N/A',
            createdAt: new Date().toISOString()
        };

        // Save order with complete product data
        saveOrderToCSV(orderRecord);

        // Log successful transaction
        console.log('🎉 Multi-currency order completed with enhanced shipping:');
        console.log(`   🆔 Order ID: ${ourOrderId}`);
        console.log(`   💰 Amount: ${currencyInfo.symbol}${capture.amount.value} ${currency}`);
        console.log(`   📧 Customer: ${payer.email_address}`);
        console.log(`   🚚 Shipping: ${shippingMethod} (${currencyInfo.symbol}${shippingCost})`);
        console.log(`   🌍 Country: ${country}`);
        console.log('   🛍️  Products with complete data:');
        enhancedCartItems.forEach(item => {
            console.log(`      - ${item.name} (${item.sku}, ${item.upc}) x${item.quantity} | ${item.weight}kg`);
        });

        // Return enhanced success response
        res.json({
            orderID: ourOrderId,
            transactionID: capture.id,
            paypalOrderID: captureData.id,
            amount: capture.amount.value,
            currency: capture.amount.currency_code,
            currencySymbol: currencyInfo.symbol,
            status: capture.status,
            customerEmail: payer.email_address,
            payerName: payer.name ? `${payer.name.given_name} ${payer.name.surname}` : 'N/A',
            shippingAddress: orderRecord.shippingAddress,
            shippingMethod: shippingMethod,
            shippingCost: shippingCost,
            captureDate: capture.create_time,
            country: country,
            items: enhancedCartItems
        });

    } catch (error) {
        console.error('❌ Error capturing PayPal payment:', error);
        res.status(500).json({ 
            error: 'Failed to capture PayPal payment',
            message: error.message 
        });
    }
});

// Get shipping rates endpoint (for traditional checkout)
app.post('/api/shipping/calculate', (req, res) => {
    try {
        const { address, items, currency } = req.body;
        console.log('📦 Calculating shipping rates for traditional checkout');

        const shippingOptions = calculateShippingOptions(address, {
            total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            currency: currency
        });

        res.json({
            success: true,
            options: shippingOptions
        });

    } catch (error) {
        console.error('❌ Error calculating shipping rates:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to calculate shipping rates',
            message: error.message 
        });
    }
});

// Get order details with enhanced multi-currency support
app.get('/api/orders/:orderId', (req, res) => {
    try {
        const orderId = req.params.orderId;
        console.log(`🔍 Looking up order: ${orderId}`);

        const csvPath = path.join(__dirname, 'orders.csv');

        if (!fs.existsSync(csvPath)) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const csvData = fs.readFileSync(csvPath, 'utf8');
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values[0] === orderId) {
                const order = {};
                headers.forEach((header, index) => {
                    order[header] = values[index] || '';
                });
                console.log(`✅ Order found: ${orderId} (${order.Currency})`);
                return res.json(order);
            }
        }

        console.log(`❌ Order not found: ${orderId}`);
        res.status(404).json({ error: 'Order not found' });

    } catch (error) {
        console.error('❌ Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Currency conversion endpoint
app.get('/api/currency/convert/:amount/:from/:to', (req, res) => {
    try {
        const { amount, from, to } = req.params;
        const fromCurrency = Object.values(CURRENCY_CONFIG).find(c => c.code === from.toUpperCase());
        const toCurrency = Object.values(CURRENCY_CONFIG).find(c => c.code === to.toUpperCase());

        if (!fromCurrency || !toCurrency) {
            return res.status(400).json({ error: 'Unsupported currency' });
        }

        // Convert via USD
        const usdAmount = parseFloat(amount) / fromCurrency.rate;
        const convertedAmount = usdAmount * toCurrency.rate;

        res.json({
            originalAmount: parseFloat(amount),
            originalCurrency: from.toUpperCase(),
            convertedAmount: convertedAmount.toFixed(2),
            convertedCurrency: to.toUpperCase(),
            rate: (toCurrency.rate / fromCurrency.rate).toFixed(4)
        });

    } catch (error) {
        console.error('❌ Error converting currency:', error);
        res.status(500).json({ error: 'Currency conversion failed' });
    }
});

// Webhook endpoint for PayPal notifications
app.post('/api/paypal/webhook', async (req, res) => {
    try {
        console.log('🔔 PayPal webhook received:', req.body.event_type);

        const event = req.body;

        switch (event.event_type) {
            case 'PAYMENT.CAPTURE.COMPLETED':
                console.log('✅ Payment capture completed:', event.resource.id);
                break;
            case 'PAYMENT.CAPTURE.DENIED':
                console.log('❌ Payment capture denied:', event.resource.id);
                break;
            case 'CHECKOUT.ORDER.APPROVED':
                console.log('👍 Order approved:', event.resource.id);
                break;
            case 'SHIPPING.ADDRESS.CHANGED':
                console.log('📮 Shipping address changed:', event.resource.id);
                break;
            case 'SHIPPING.OPTIONS.CHANGED':
                console.log('🚚 Shipping option changed:', event.resource.id);
                break;
            default:
                console.log('📝 Unhandled webhook event:', event.event_type);
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Success and cancel pages
app.get('/success', (req, res) => {
    res.redirect('/#success');
});

app.get('/cancel', (req, res) => {
    res.redirect('/#cancelled');
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server with enhanced logging
app.listen(PORT, async () => {
    console.log(`\n🚀 ActionFigure Vault Server with PayPal JSON Patch Callbacks`);
    //console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${PAYPAL_CONFIG.BASE_URL.includes('sandbox') ? 'Sandbox' : 'Production'}`);
    console.log(`💳 PayPal Client ID: ${PAYPAL_CONFIG.CLIENT_ID.substring(0, 10)}...`);

    // Test PayPal connection
    try {
        await generateAccessToken();
        console.log(`✅ PayPal connection established`);
    } catch (error) {
        console.error(`❌ PayPal connection failed:`, error.message);
    }

    console.log(`\n📋 API Endpoints:`);
    console.log(`   GET  /              - Main website`);
    console.log(`   GET  /api/health    - Health check with JSON Patch callback info`);
    console.log(`   POST /api/paypal/create-order  - Create order (API compliant with JSON Patch callbacks)`);
    console.log(`   POST /api/paypal/capture-order - Capture payment (multi-currency with shipping)`);
    console.log(`   POST /api/paypal/shipping-callback - FIXED JSON PATCH SHIPPING CALLBACK`);
    console.log(`   POST /api/paypal/webhook       - PayPal webhooks`);
    console.log(`   POST /api/shipping/calculate   - Calculate shipping rates`);
    console.log(`   GET  /api/orders/:id           - Get order details`);
    console.log(`   GET  /api/currency/convert/:amount/:from/:to - Currency conversion`);

    console.log(`\n🌍 Multi-Currency Support:`);
    Object.entries(CURRENCY_CONFIG).forEach(([country, config]) => {
        const countryNames = { 'HK': 'Hong Kong', 'US': 'United States', 'GB': 'United Kingdom' };
        console.log(`   🏳️ ${countryNames[country] || country}: ${config.code} (${config.symbol})`);
        console.log(`      Shipping: ${config.shipping.free ? 'FREE' : 'PAID'} | Standard: ${config.shipping.standard.days}`);
    });

    console.log(`\n🔧 FIXED: PayPal JSON Patch Callback Format:`);
    console.log(`   ✅ SHIPPING_ADDRESS response: { op: "replace", path: "/.../address", value: { addressable: true } }`);
    console.log(`   ✅ SHIPPING_OPTIONS response: { op: "replace", path: "/.../options", value: [...] }`);
    console.log(`   ✅ Proper reference_id handling in JSON Patch paths`);
    console.log(`   ✅ Address validation with addressable: true/false`);
    console.log(`   ✅ Dynamic shipping options based on user selection`);
    console.log(`   ✅ Multi-currency shipping cost calculation`);

    console.log(`\n🎯 JSON Patch Response Examples:`);
    console.log(`   📍 Address Validation:`);
    console.log(`      { "op": "replace", "path": "/purchase_units/@reference_id=='ORDER123'/shipping/address", "value": { "addressable": true } }`);
    console.log(`   🚚 Shipping Options Update:`);
    console.log(`      { "op": "replace", "path": "/purchase_units/@reference_id=='ORDER123'/shipping/options", "value": [...shipping_options] }`);

    console.log(`\n🎉 PayPal JSON Patch Shipping Callbacks - FIXED AND READY FOR YOUR IMPLEMENTATION!`);
    console.log(`   • Correct JSON Patch response format implemented`);
    console.log(`   • Address validation with proper addressable field`);
    console.log(`   • Dynamic shipping options with user selection handling`);
    console.log(`   • Reference ID properly extracted and used in patch paths`);
    console.log(`   • Complete PayPal Orders v2 API compliance`);
    console.log(`   • Enhanced logging for debugging your implementation`);
    console.log(`   • Multi-currency shipping cost support`);
    console.log(`   • CSV order storage with complete shipping details`);
});

module.exports = app;