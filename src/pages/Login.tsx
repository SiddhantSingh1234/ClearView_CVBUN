// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import './Login.css';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       setError('Please fill in all fields');
//       return;
//     }
    
//     try {
//       setError('');
//       setLoading(true);
//       await login(email, password);
//       navigate('/');
//     } catch (err) {
//       setError('Failed to sign in. Please check your credentials.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
//             Sign in to your account
//           </h2>
//           <p className="mt-2 text-center text-sm text-secondary-600">
//             Or{' '}
//             <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
//               create a new account
//             </Link>
//           </p>
//         </div>
        
//         {error && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4">
//             <div className="flex">
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}
        
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label htmlFor="email-address" className="sr-only">
//                 Email address
//               </label>
//               <input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
//                 placeholder="Email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
//               />
//               <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-900">
//                 Remember me
//               </label>
//             </div>

//             <div className="text-sm">
//               <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
//                 Forgot your password?
//               </a>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
//             >
//               {loading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/90">
              create a new account
            </Link>
          </p>
        </div>
        {error && (
          <div className="bg-destructive/10 border-l-4 border-destructive p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-muted-foreground">
              <input type="checkbox" className="mr-2 rounded border-border bg-background text-primary focus:ring-primary" />
              Remember me
            </label>
            <a href="#" className="text-sm text-primary hover:text-primary/90">Forgot password?</a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;