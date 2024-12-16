import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export const stripeService = {

  async initializePayment(clientSecret) {
    const stripe = await getStripe();
    const elements = stripe.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#722F37',
        },
      },
    });

    const paymentElement = elements.create('payment');
    return { stripe, elements, paymentElement };
  },

  
  async confirmPayment(stripe, elements, returnUrl) {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  },

 
  async checkPaymentStatus(clientSecret) {
    const stripe = await getStripe();
    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
    return paymentIntent.status;
  }
}; 