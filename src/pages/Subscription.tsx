// import { useState } from 'react';
// import { FiCheck } from 'react-icons/fi';
// import { useAuth } from '../context/AuthContext';
// import { Link } from 'react-router-dom';
// import './Subscription.css'

// const Subscription = () => {
//   const { currentUser } = useAuth();
//   const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'premium'>('basic');

//   const plans = [
//     {
//       id: 'free',
//       name: 'Free',
//       price: '$0',
//       period: 'forever',
//       features: [
//         'Limited access to articles',
//         'Basic news recommendations',
//         'Standard news updates',
//         'Web access only'
//       ]
//     },
//     {
//       id: 'basic',
//       name: 'Basic',
//       price: '$4.99',
//       period: 'per month',
//       features: [
//         'Unlimited article access',
//         'Personalized recommendations',
//         'Ad-free experience',
//         'Web and mobile access',
//         'Save articles for later'
//       ]
//     },
//     {
//       id: 'premium',
//       name: 'Premium',
//       price: '$9.99',
//       period: 'per month',
//       features: [
//         'Everything in Basic',
//         'Exclusive content',
//         'Early access to features',
//         'Priority customer support',
//         'Download articles for offline reading',
//         'In-depth analysis and reports'
//       ]
//     }
//   ];

//   const handleSubscribe = () => {
//     // In a real app, this would redirect to a payment processor
//     console.log(`Subscribing to ${selectedPlan} plan`);
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="text-center mb-12">
//         <h1 className="text-4xl font-bold text-secondary-900 mb-4">Choose Your Subscription Plan</h1>
//         <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
//           Get unlimited access to all articles, personalized recommendations, and more with our subscription plans.
//         </p>
//       </div>

//       <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
//         {plans.map((plan) => (
//           <div 
//             key={plan.id}
//             className={`rounded-lg overflow-hidden shadow-lg transition-all ${
//               selectedPlan === plan.id 
//                 ? 'ring-2 ring-primary-500 transform scale-105' 
//                 : 'hover:shadow-xl'
//             }`}
//           >
//             <div className="bg-white p-6">
//               <h3 className="text-2xl font-bold text-secondary-900 mb-2">{plan.name}</h3>
//               <div className="flex items-baseline mb-4">
//                 <span className="text-4xl font-extrabold text-secondary-900">{plan.price}</span>
//                 <span className="ml-2 text-secondary-500">{plan.period}</span>
//               </div>
//               <button
//                 onClick={() => setSelectedPlan(plan.id as 'free' | 'basic' | 'premium')}
//                 className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
//                   selectedPlan === plan.id
//                     ? 'bg-primary-600 text-white hover:bg-primary-700'
//                     : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
//                 }`}
//               >
//                 {selectedPlan === plan.id ? 'Selected' : 'Select'}
//               </button>
//             </div>
//             <div className="bg-secondary-50 p-6">
//               <ul className="space-y-3">
//                 {plan.features.map((feature, index) => (
//                   <li key={index} className="flex items-start">
//                     <FiCheck className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
//                     <span className="text-secondary-700">{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="mt-12 text-center">
//         {currentUser ? (
//           <button
//             onClick={handleSubscribe}
//             className="btn btn-primary px-8 py-3 text-lg"
//           >
//             Subscribe Now
//           </button>
//         ) : (
//           <div className="space-y-4">
//             <p className="text-secondary-600">You need to be logged in to subscribe</p>
//             <div className="flex justify-center space-x-4">
//               <Link to="/login" className="btn btn-primary">
//                 Sign In
//               </Link>
//               <Link to="/signup" className="btn btn-outline">
//                 Create Account
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="mt-16 max-w-3xl mx-auto">
//         <h2 className="text-2xl font-bold text-secondary-900 mb-6">Frequently Asked Questions</h2>
//         <div className="space-y-6">
//           <div>
//             <h3 className="text-lg font-medium text-secondary-900 mb-2">Can I cancel my subscription anytime?</h3>
//             <p className="text-secondary-600">
//               Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
//             </p>
//           </div>
//           <div>
//             <h3 className="text-lg font-medium text-secondary-900 mb-2">What payment methods do you accept?</h3>
//             <p className="text-secondary-600">
//               We accept all major credit cards, PayPal, and Apple Pay.
//             </p>
//           </div>
//           <div>
//             <h3 className="text-lg font-medium text-secondary-900 mb-2">Is there a free trial?</h3>
//             <p className="text-secondary-600">
//               Yes, new subscribers get a 7-day free trial of our Premium plan.
//             </p>
//           </div>
//           <div>
//             <h3 className="text-lg font-medium text-secondary-900 mb-2">How do I access my subscription on multiple devices?</h3>
//             <p className="text-secondary-600">
//               Simply sign in with your account on any device to access your subscription.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Subscription;

import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Subscription = () => {
  const { currentUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'premium'>('basic');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Limited access to articles',
        'Basic news recommendations',
        'Standard news updates',
        'Web access only'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$4.99',
      period: 'per month',
      features: [
        'Unlimited article access',
        'Personalized recommendations',
        'Ad-free experience',
        'Web and mobile access',
        'Save articles for later'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      features: [
        'Everything in Basic',
        'Exclusive content',
        'Early access to features',
        'Priority customer support',
        'Download articles for offline reading',
        'In-depth analysis and reports'
      ]
    }
  ];

  const handleSubscribe = () => {
    console.log(`Subscribing to ${selectedPlan} plan`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Subscription Plan</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Get unlimited access to all articles, personalized recommendations, and more with our subscription plans.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`rounded-lg overflow-hidden shadow-lg transition-all ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-primary transform scale-105' 
                : 'hover:shadow-xl'
            }`}
          >
            <div className="bg-card p-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                <span className="ml-2 text-muted-foreground">{plan.period}</span>
              </div>
              <button
                onClick={() => setSelectedPlan(plan.id as 'free' | 'basic' | 'premium')}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  selectedPlan === plan.id
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground hover:bg-muted/90'
                }`}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select'}
              </button>
            </div>
            <div className="bg-muted p-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        {currentUser ? (
          <button
            onClick={handleSubscribe}
            className="px-8 py-3 text-lg bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90"
          >
            Subscribe Now
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">You need to be logged in to subscribe</p>
            <div className="flex justify-center space-x-4">
              <Link to="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90">
                Sign In
              </Link>
              <Link to="/signup" className="px-4 py-2 border border-primary text-primary rounded-md font-medium hover:bg-primary/10">
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;