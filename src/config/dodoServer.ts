export const getServerProductId = (type: 'one_time' | 'subscription') => {
    const env = process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode';
    if (type === 'one_time') {
        return process.env.DODO_PRODUCT_ONE_TIME || 
               (env === 'test_mode' ? 'pdt_0NYskaXuWvqB7pOJJAWHR' : 'pdt_0NaHBvNNtTNxDUEQ1BblK');
    } else {
        return process.env.DODO_PRODUCT_SUBSCRIPTION || 
               (env === 'test_mode' ? 'pdt_0NYsnZquqsrqDi9SW9pHT' : 'pdt_0NYlhH0CqhFDHJIr5v82N');
    }
};

export const SERVER_PRODUCT_ONE_TIME = getServerProductId('one_time');
export const SERVER_PRODUCT_SUBSCRIPTION = getServerProductId('subscription');
