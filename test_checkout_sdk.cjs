const DodoPayments = require('dodopayments');

async function test() {
    const client = new DodoPayments.DodoPayments({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY || 'test',
        environment: 'test_mode'
    });

    try {
        const payment = await client.payments.create({
            product_cart: [{ product_id: 'pdt_0NYskaXuWvqB7pOJJAWHR', quantity: 1 }],
            customer: {
                email: '',
                name: '',
            },
            metadata: {
                user_id: 'abc',
            },
            payment_link: true,
            return_url: 'http://localhost/test',
        });
        console.log('Payment created:', payment);
    } catch (e) {
        console.error('Payment Error:', e);
    }

    try {
        const subscription = await client.subscriptions.create({
            product_id: 'pdt_0NYsnZquqsrqDi9SW9pHT',
            customer: {
                email: '',
                name: '',
            },
            metadata: {
                user_id: 'abc',
            },
            return_url: 'http://localhost/test',
            quantity: 1,
        });
        console.log('Subscription created:', subscription);
    } catch (e) {
        console.error('Subscription Error:', e);
    }
}

test();
