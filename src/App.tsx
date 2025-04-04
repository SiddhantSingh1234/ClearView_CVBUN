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
import VideoList from './components/VideoList';
import ChatbotPage from './pages/Chatbotpage';
import ArticleDetail from './components/ArticleDetail';
import { Toaster } from 'react-hot-toast';
import UserProfilePage from './pages/Profile';

function App() {
  // // Add these functions to handle like and share actions
  // const handleLike = async (id: string) => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/articles/${id}/like`, {
  //       method: "POST",
  //     });
  //     if (!response.ok) throw new Error("Failed to like article");
  //     return await response.json();
  //   } catch (error) {
  //     console.error("Error liking article:", error);
  //   }
  // };

  // const handleShare = (id: string) => {
  //   // You can implement sharing functionality here
  //   // For now, simply copy the URL to clipboard
  //   const articleUrl = `${window.location.origin}/article/${id}`;
  //   navigator.clipboard.writeText(articleUrl);
  //   alert("Article link copied to clipboard!");
  // };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster position="top-right" reverseOrder={false} />
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
                <Route path="/analyse_fake_news" element={<Home />} />
                <Route path="/analyse_sentiment_analysis" element={<Home />} />
                <Route path="/videos" element={<VideoList />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route 
                  path="/article/:id" 
                  element={<ArticleDetail />} 
                />
                <Route path="/profile" element={<UserProfilePage />} />
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