// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import Navbar from './components/Navbar';
// import Home from './pages/Home';
// import ForYou from './pages/ForYou';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import Preferences from './pages/Preferences';
// import Subscription from './pages/Subscription';
// import Usage from './pages/Usage';
// import NewsList from "./components/NewsList";  // ✅ Import NewsList

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <div className="min-h-screen bg-secondary-50">
//           <Navbar />
//           <main>
//             <Routes>
//               <Route path="/" element={<Home />} />
//               <Route path="/for-you" element={<ForYou />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/signup" element={<Signup />} />
//               <Route path="/preferences" element={<Preferences />} />
//               <Route path="/subscription" element={<Subscription />} />
//               <Route path="/usage" element={<Usage />} />
//               <Route path="/news" element={<NewsList />} />  {/* ✅ Add NewsList Route */}
//             </Routes>
//           </main>
//           <footer className="bg-white border-t border-secondary-200 py-8">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               <div className="md:flex md:items-center md:justify-between">
//                 <div className="flex justify-center md:justify-start">
//                   <h2 className="text-2xl font-bold text-primary-600">ClearView</h2>
//                 </div>
//                 <div className="mt-8 md:mt-0">
//                   <p className="text-center md:text-right text-sm text-secondary-500">
//                     &copy; {new Date().getFullYear()} ClearView. All rights reserved.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </footer>
//         </div>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import Navbar from './components/Navbar';
// import Home from './pages/Home';
// import ForYou from './pages/ForYou';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import Preferences from './pages/Preferences';
// import Subscription from './pages/Subscription';
// import Usage from './pages/Usage';
// import NewsList from "./components/NewsList";
// import { ThemeProvider } from "@/components/theme-provider"

// function App() {
//   return (
//     <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
//       <Router>
//         <AuthProvider>
//           <div className="min-h-screen bg-secondary-50">
//             <Navbar />
//             <main>
//               <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/for-you" element={<ForYou />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/signup" element={<Signup />} />
//                 <Route path="/preferences" element={<Preferences />} />
//                 <Route path="/subscription" element={<Subscription />} />
//                 <Route path="/usage" element={<Usage />} />
//                 <Route path="/news" element={<NewsList />} />  {/* Add NewsList Route */}
//                 <Route path="/analyse" element={<Home />} />  {/* Add Bias Route */}
//               </Routes>
//             </main>
//             <footer className="bg-white border-t border-secondary-200 py-8">
//               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <div className="md:flex md:items-center md:justify-between">
//                   <div className="flex justify-center md:justify-start">
//                     <h2 className="text-2xl font-bold text-primary-600">ClearView</h2>
//                   </div>
//                   <div className="mt-8 md:mt-0">
//                     <p className="text-center md:text-right text-sm text-secondary-500">
//                       &copy; {new Date().getFullYear()} ClearView. All rights reserved.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </footer>
//           </div>
//         </AuthProvider>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ForYou from './pages/ForYou';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Preferences from './pages/Preferences';
import Subscription from './pages/Subscription';
import Usage from './pages/Usage';
import NewsList from "./components/NewsList";
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="max-w-7xl mx-auto p-8 text-center">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/for-you" element={<ForYou />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/preferences" element={<Preferences />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/usage" element={<Usage />} />
                <Route path="/news" element={<NewsList />} />
                <Route path="/analyse" element={<Home />} />
              </Routes>
            </main>
            <footer className="bg-card border-t border-border py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between">
                  <div className="flex justify-center md:justify-start">
                    <h2 className="text-2xl font-bold text-primary">ClearView</h2>
                  </div>
                  <div className="mt-8 md:mt-0">
                    <p className="text-center md:text-right text-sm text-muted-foreground">
                      &copy; {new Date().getFullYear()} ClearView. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;