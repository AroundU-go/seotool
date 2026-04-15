const DodoPayments = require('dodopayments');

try {
    const client = new DodoPayments.DodoPayments({
        bearerToken: 'test_123',
        environment: 'test_mode'
    });
    console.log('Client created successfully');
} catch (err) {
    console.error('Error creating client:', err);
}
