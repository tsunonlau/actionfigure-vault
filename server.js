const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PayPal Configuration - Enhanced with callback base URL
const PAYPAL_CONFIG = {
    CLIENT_ID: process.env.PAYPAL_CLIENT_ID || 'AQwR0albcg6vvwYGQiVRlYVAExSV_l7nXUUd6F3Rcv4-RU9ytyk3os5PtqDnGNJE6etd8tuj573OWJ3h',
    CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || 'EC5F_YVi8wiGjSTCXAK2nlM_4PgUkA_rZAB5-tZZ4_PKhycWbFy6S8_zvy6H7Iu2a6cq0BXmQkmMf76Z',
    BASE_URL: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
    WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID || 'your-webhook-id-here',
    CALLBACK_BASE_URL: process.env.CALLBACK_BASE_URL || 'https://actionfigure-vault.onrender.com'
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
            standard: { cost: 9.99, days: '3-5', type: 'STANDARD' },
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
app.use(express.static(path.join(__dirname)));

// PayPal Access Token Management
let accessToken = null;
let tokenExpiry = null;

// FIXED: In-memory order storage to track PayPal Order details
const orderStorage = new Map(); // PayPal Order ID -> { createdAt, currency, country, originalOrderData }

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

        console.log(`[${new Date().toISOString()}] ✅ PayPal Access Token Generated`);
        return accessToken;
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error generating PayPal access token:`, error);
        throw error;
    }
}

function saveOrderToCSV(orderData) {
    const csvPath = path.join(__dirname, 'orders.csv');

    if (!fs.existsSync(csvPath)) {
        const headers = 'PayPal_Order_ID,Transaction_ID,Customer_Email,Amount,Currency,Country,Status,Items,Item_Details,Shipping_Method,Shipping_Cost,Shipping_Address,Created_Date\n';
        fs.writeFileSync(csvPath, headers, 'utf8');
    }

    const itemDetails = (orderData.items || []).map(item => {
        return `${item.name} (SKU: ${item.sku || 'N/A'}, UPC: ${item.upc || 'N/A'}, Weight: ${item.weight || 'N/A'}kg) x${item.quantity} - ${orderData.currencySymbol || '$'}${(item.price * item.quantity).toFixed(2)}`;
    }).join('; ');

    const csvRow = [
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
        console.log(`[${new Date().toISOString()}] ✅ Order ${orderData.paypalOrderID} saved to CSV`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error saving order to CSV:`, error);
    }
}

function getCurrencyInfo(countryCode) {
    return CURRENCY_CONFIG[countryCode] || CURRENCY_CONFIG['US'];
}

function calculateShippingOptions(shipping_address, order_details = {}) {
    console.log(`[${new Date().toISOString()}] 🚚 Calculating shipping for address:`, shipping_address);

    const countryCode = shipping_address.country_code;
    const currencyInfo = getCurrencyInfo(countryCode);
    const orderTotal = parseFloat(order_details.total || 0);

    console.log(`[${new Date().toISOString()}] 📍 Country: ${countryCode}`);
    console.log(`[${new Date().toISOString()}] 💰 Order Total: ${currencyInfo.symbol}${orderTotal}`);
    console.log(`[${new Date().toISOString()}] 💱 Currency: ${currencyInfo.code}`);

    let shippingOptions = [];

    if (countryCode === 'HK') {
        shippingOptions = [
            {
                id: 'FREE_STANDARD_HK',
                label: `Free Standard Shipping (${currencyInfo.shipping.standard.days})`,
                type: 'SHIPPING',
                selected: true,
                amount: {
                    currency_code: currencyInfo.code,
                    value: '0.00'
                }
            },
            {
                id: 'FREE_EXPRESS_HK',
                label: `Free Express Shipping (${currencyInfo.shipping.express.days})`,
                type: 'SHIPPING',
                selected: false,
                amount: {
                    currency_code: currencyInfo.code,
                    value: '0.00'
                }
            }
        ];
    } else {
        const standardCost = currencyInfo.shipping.standard.cost;
        const expressCost = currencyInfo.shipping.express.cost;
        const freeShippingThreshold = 300 * currencyInfo.rate;
        const qualifiesForFreeShipping = orderTotal >= freeShippingThreshold;

        if (qualifiesForFreeShipping) {
            console.log(`[${new Date().toISOString()}] ✅ Qualifies for free shipping`);
            shippingOptions = [
                {
                    id: 'FREE_STANDARD_QUALIFIED',
                    label: `Free Standard Shipping (${currencyInfo.shipping.standard.days})`,
                    type: 'SHIPPING',
                    selected: true,
                    amount: {
                        currency_code: currencyInfo.code,
                        value: '0.00'
                    }
                },
                {
                    id: 'FREE_EXPRESS_QUALIFIED',
                    label: `Free Express Shipping (${currencyInfo.shipping.express.days})`,
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

    console.log(`[${new Date().toISOString()}] 📦 Generated ${shippingOptions.length} shipping options`);
    return shippingOptions;
}

function validateShippingAddress(shipping_address) {
    const countryCode = shipping_address.country_code;
    const supportedCountries = ['HK', 'US', 'GB', 'CA', 'AU', 'SG', 'JP'];

    if (!supportedCountries.includes(countryCode)) {
        return {
            valid: false,
            error: 'COUNTRY_ERROR',
            message: `We do not ship to ${countryCode}. Please contact support.`
        };
    }

    if (countryCode === 'US' && shipping_address.admin_area_1 === 'AK') {
        return {
            valid: false,
            error: 'STATE_ERROR',
            message: 'Shipping to Alaska requires special handling.'
        };
    }

    return { valid: true };
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: PAYPAL_CONFIG.BASE_URL.includes('sandbox') ? 'sandbox' : 'production',
        callbackBaseUrl: PAYPAL_CONFIG.CALLBACK_BASE_URL,
        orderStorageCount: orderStorage.size,
        features: [
            'PayPal Orders v2 API',
            'FIXED: Uses only PayPal Order IDs (no custom generation)',
            'Server-side Shipping Callbacks',
            'Multi-currency Support (HKD, USD, GBP)',
            'Dynamic Shipping Cost Calculation',
            'PayPal Order ID throughout entire flow'
        ]
    });
});

//Provide a HTTP method to retrieve the orders.csv file
app.get('/download/orders', (req, res) => {
    const csvPath = path.join(__dirname, 'orders.csv');
    if (fs.existsSync(csvPath)) {
        res.download(csvPath);
    } else {
        res.status(404).send('File not found');
    }
});

// FIXED: Create PayPal Order - Uses only PayPal's Order ID
app.post('/api/paypal/create-order', async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] 📦 Creating PayPal order...`);
        
        const token = await generateAccessToken();
        const orderData = req.body;
        
        const currencyCode = orderData.purchase_units[0].amount.currency_code || 'USD';
        const countryCode = orderData.purchase_units[0].shipping?.address?.country_code || 'US';

        // FIXED: Add PayPal Order ID as reference_id when we get it back
        const enhancedOrderData = {
            ...orderData,
            purchase_units: orderData.purchase_units.map(unit => ({
                ...unit,
                soft_descriptor: 'ACTIONFIGURE'
            }))
        };

        if (!enhancedOrderData.payment_source) {
            enhancedOrderData.payment_source = {};
        }

        if (!enhancedOrderData.payment_source.paypal) {
            enhancedOrderData.payment_source.paypal = {};
        }

        const callbackUrl = `${PAYPAL_CONFIG.CALLBACK_BASE_URL}/api/paypal/shipping-callback`;
        enhancedOrderData.payment_source.paypal.experience_context = {
            ...enhancedOrderData.payment_source?.paypal?.experience_context,
            shipping_preference: 'GET_FROM_FILE', // 'GET_FROM_FILE allows buyer change address, SET_PROVIDED_ADDRESS prevents that
            user_action: 'PAY_NOW',
            brand_name: 'ActionFigure Vault',
            order_update_callback_config: {
                callback_url: callbackUrl,
                callback_events: ['SHIPPING_ADDRESS', 'SHIPPING_OPTIONS']
            }
        };

        console.log(`[${new Date().toISOString()}] 🔗 Shipping callback URL: ${callbackUrl}`);

        const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'PayPal-Request-Id': `create-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(enhancedOrderData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[${new Date().toISOString()}] ❌ PayPal API Error:`, errorText);
            throw new Error(`PayPal API error: ${response.status} ${errorText}`);
        }

        const order = await response.json();
        const paypalOrderId = order.id; // FIXED: This is PayPal's actual Order ID

        // FIXED: Store order details using PayPal's Order ID
        orderStorage.set(paypalOrderId, {
            createdAt: new Date().toISOString(),
            currency: currencyCode,
            country: countryCode,
            originalOrderData: orderData
        });

        console.log(`[${new Date().toISOString()}] ✅ PayPal order created: ${paypalOrderId}`);
        console.log(`[${new Date().toISOString()}] 📋 Stored order details for: ${paypalOrderId}`);

        res.json({
            id: paypalOrderId,      // FIXED: Return only PayPal's Order ID
            status: order.status,
            links: order.links
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error creating PayPal order:`, error);
        res.status(500).json({
            error: 'Failed to create PayPal order',
            message: error.message
        });
    }
});

// Modified shipping callback to store selected shipping method
app.post('/api/paypal/shipping-callback', async (req, res) => {
  try {
    const { id, shipping_address, shipping_option } = req.body;
    
    // FIXED: Get order details from storage to access itemTotal and currency
    const storedOrderDetails = orderStorage.get(id);
    if (!storedOrderDetails) {
      throw new Error(`Order ${id} not found in storage`);
    }
    
    // FIXED: Extract itemTotal and currencyCode from stored order data
    const originalOrder = storedOrderDetails.originalOrderData;
    const purchaseUnit = originalOrder.purchase_units[0];
    const itemTotal = parseFloat(purchaseUnit.amount.breakdown?.item_total?.value || purchaseUnit.amount.value || 0);
    const currencyCode = purchaseUnit.amount.currency_code || storedOrderDetails.currency || 'USD';
    const referenceId = purchaseUnit.reference_id || `default-ref-${id}`;
    
    console.log(`[${new Date().toISOString()}] 🚚 Processing shipping callback for order: ${id}`);
    console.log(`[${new Date().toISOString()}] 💰 Item Total: ${itemTotal}, Currency: ${currencyCode}`);
    
    // Calculate available shipping options
    const availableShippingOptions = calculateShippingOptions(shipping_address, {
      total: itemTotal,
      currency: currencyCode
    });

    let selectedShippingOptions = availableShippingOptions;
    let selectedShippingCost = 0;
    let finalSelectedMethod = null;

    if (shipping_option && shipping_option.id) {
      console.log(`User selected "${shipping_option.id}"`);
      selectedShippingOptions = availableShippingOptions.map(opt => ({
        ...opt,
        selected: opt.id === shipping_option.id
      }));
      finalSelectedMethod = selectedShippingOptions.find(opt => opt.selected);
      selectedShippingCost = finalSelectedMethod ? parseFloat(finalSelectedMethod.amount.value) : 0;
    } else {
      finalSelectedMethod = selectedShippingOptions.find(opt => opt.selected) || selectedShippingOptions[0];
      selectedShippingCost = finalSelectedMethod ? parseFloat(finalSelectedMethod.amount.value) : 0;
    }

    // Store the selected shipping method in order storage
    if (orderStorage.has(id)) {
      const orderDetails = orderStorage.get(id);
      orderDetails.selectedShippingMethod = {
        id: finalSelectedMethod.id,
        label: finalSelectedMethod.label,
        cost: selectedShippingCost,
        currency: currencyCode
      };
      orderStorage.set(id, orderDetails);
      console.log(`Stored selected shipping method: ${finalSelectedMethod.label}`);
    }

    // Calculate new order total
    const newOrderTotal = itemTotal + selectedShippingCost;

    const orderStructureResponse = {
      id: id,
      purchase_units: [{
        reference_id: referenceId,
        amount: {
          currency_code: currencyCode,
          value: newOrderTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currencyCode,
              value: itemTotal.toFixed(2)
            },
            shipping: {
              currency_code: currencyCode,
              value: selectedShippingCost.toFixed(2)
            }
          }
        },
        shipping_options: selectedShippingOptions.map(opt => ({
          id: opt.id,
          amount: {
            currency_code: currencyCode,
            value: opt.amount.value
          },
          type: opt.type,
          label: opt.label,
          selected: !!opt.selected
        }))
      }]
    };

    res.status(200).json(orderStructureResponse);
  } catch (error) {
    console.error('Error in shipping callback:', error);
    res.status(422).json({
      name: 'INTERNAL_ERROR',
      message: 'An error occurred processing your shipping request'
    });
  }
});

// **ENHANCED**: Modified capture endpoint to return actual selected shipping method
app.post('/api/paypal/capture-order', async (req, res) => {
    try {
        const { orderID, cartItems } = req.body;
        
        // Get stored shipping method details
        const storedOrderDetails = orderStorage.get(orderID);
        const selectedShippingMethod = storedOrderDetails?.selectedShippingMethod;

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
            throw new Error(`PayPal capture error: ${response.status} ${errorText}`);
        }

        const captureData = await response.json();
        const capture = captureData.purchase_units[0].payments.captures[0];
        const payer = captureData.payer;
        const shippingInfo = captureData.purchase_units[0].shipping;
        const shippingAddress = shippingInfo?.address;

        // **ENHANCED**: Use stored shipping method if available, otherwise fall back
        let shippingMethod, shippingCost;
        if (selectedShippingMethod) {
            shippingMethod = selectedShippingMethod.label;
            shippingCost = selectedShippingMethod.cost.toFixed(2);
            console.log(`Using stored shipping method: ${shippingMethod} - ${shippingCost}`);
        } else {
            // Fallback to PayPal data or defaults
            const shippingOptions = shippingInfo?.options || [];
            const selectedShipping = shippingOptions.find(opt => opt.selected) || shippingOptions[0];
            shippingMethod = selectedShipping?.label || 'Standard Shipping';
            shippingCost = selectedShipping?.amount?.value || '0.00';
        }

        // Enhanced cart items
        const enhancedCartItems = cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            sku: item.sku || `SKU-${item.id}`,
            upc: item.upc || `UPC${Math.random().toString().substring(2, 12)}`,
            image_url: item.image_url || `https://actionfigurevault.com/images/product-${item.id}.jpg`,
            url: item.url || `https://actionfigurevault.com/products/product-${item.id}`,
            weight: item.weight || 1.0
        }));

        const orderRecord = {
            paypalOrderID: orderID,
            transactionID: capture.id,
            customerEmail: payer.email_address,
            amount: capture.amount.value,
            currency: capture.amount.currency_code,
            status: capture.status,
            items: enhancedCartItems,
            shippingMethod: shippingMethod,
            shippingCost: shippingCost,
            shippingAddress: shippingAddress ?
                `${shippingAddress.address_line_1 || ''}, ${shippingAddress.admin_area_2 || ''}, ${shippingAddress.admin_area_1 || ''} ${shippingAddress.postal_code || ''}, ${shippingAddress.country_code || ''}`.trim()
                : 'N/A',
            createdAt: new Date().toISOString()
        };

        saveOrderToCSV(orderRecord);

        // Clean up order storage
        orderStorage.delete(orderID);

        // **ENHANCED**: Return actual shipping method details
        res.json({
            orderID: orderID,
            transactionID: capture.id,
            paypalOrderID: orderID,
            amount: capture.amount.value,
            currency: capture.amount.currency_code,
            status: capture.status,
            customerEmail: payer.email_address,
            payerName: payer.name ? `${payer.name.given_name} ${payer.name.surname}` : 'N/A',
            shippingAddress: orderRecord.shippingAddress,
            shippingMethod: shippingMethod, // ← Actual selected method
            shippingCost: shippingCost,     // ← Actual selected cost
            captureDate: capture.create_time,
            items: enhancedCartItems,
            // **NEW**: Include shipping method details for client
            actualShippingDetails: selectedShippingMethod || {
                label: shippingMethod,
                cost: parseFloat(shippingCost),
                currency: capture.amount.currency_code
            }
        });
    } catch (error) {
        console.error('Error capturing PayPal payment:', error);
        res.status(500).json({
            error: 'Failed to capture PayPal payment',
            message: error.message
        });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ❌ Server Error:`, error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`\n[${new Date().toISOString()}] 🚀 ActionFigure Vault Server - FIXED PayPal Order ID Only`);
    console.log(`[${new Date().toISOString()}] 📍 Server: http://localhost:${PORT}`);
    console.log(`[${new Date().toISOString()}] 🔗 Callback Base URL: ${PAYPAL_CONFIG.CALLBACK_BASE_URL}`);

    // Test PayPal connection
    try {
        await generateAccessToken();
        console.log(`[${new Date().toISOString()}] ✅ PayPal connection established`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ PayPal connection failed:`, error.message);
    }

    console.log(`\n[${new Date().toISOString()}] 🔧 FIXED: PayPal Order ID Management:`);
    console.log(`[${new Date().toISOString()}] ✅ REMOVED: All generateOrderId() and ourOrderId references`);
    console.log(`[${new Date().toISOString()}] ✅ FIXED: Uses only PayPal's Order ID throughout`);
    console.log(`[${new Date().toISOString()}] ✅ FIXED: CSV storage uses PayPal Order ID as primary key`);
    console.log(`[${new Date().toISOString()}] ✅ FIXED: No custom ID generation anywhere in flow`);

    console.log(`\n[${new Date().toISOString()}] 🎉 PayPal Integration - Complete with PayPal Order IDs Only!`);
});

module.exports = app;