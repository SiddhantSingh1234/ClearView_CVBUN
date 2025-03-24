// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword, 
//   signOut, 
//   onAuthStateChanged,
//   User as FirebaseUser,
//   updateProfile
// } from 'firebase/auth';
// import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
// import { auth, db } from '../firebase/config';
// import { User, UserPreferences } from '../types';

// interface AuthContextType {
//   currentUser: FirebaseUser | null;
//   userData: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (email: string, password: string, displayName: string) => Promise<void>;
//   logout: () => Promise<void>;
//   updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
//   const [userData, setUserData] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
      
//       if (user) {
//         const userDocRef = doc(db, 'users', user.uid);
//         const userDoc = await getDoc(userDocRef);
        
//         if (userDoc.exists()) {
//           setUserData(userDoc.data() as User);
//         }
//       } else {
//         setUserData(null);
//       }
      
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const signup = async (email: string, password: string, displayName: string) => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
      
//       // Update profile with display name
//       await updateProfile(user, { displayName });
      
//       // Create user document in Firestore
//       const newUser: User = {
//         id: user.uid,
//         email: user.email || '',
//         displayName: displayName,
//         photoURL: user.photoURL || '',
//         preferences: {
//           categories: [],
//           topics: [],
//           sources: [],
//           favorites: []
//         },
//         createdAt: new Date(),
//         lastLogin: new Date()
//       };
      
//       await setDoc(doc(db, 'users', user.uid), newUser);
//       setUserData(newUser);
//     } catch (error) {
//       console.error('Error signing up:', error);
//       throw error;
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
      
//       // Update last login time
//       if (currentUser) {
//         const userDocRef = doc(db, 'users', currentUser.uid);
//         await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
//       }
//     } catch (error) {
//       console.error('Error logging in:', error);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await signOut(auth);
//     } catch (error) {
//       console.error('Error logging out:', error);
//       throw error;
//     }
//   };

//   const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
//     if (!currentUser) return;
    
//     try {
//       const userDocRef = doc(db, 'users', currentUser.uid);
//       await setDoc(userDocRef, { 
//         preferences: { 
//           ...userData?.preferences, 
//           ...preferences 
//         } 
//       }, { merge: true });
      
//       // Update local state
//       if (userData) {
//         setUserData({
//           ...userData,
//           preferences: {
//             ...userData.preferences,
//             ...preferences
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Error updating preferences:', error);
//       throw error;
//     }
//   };

//   const value = {
//     currentUser,
//     userData,
//     loading,
//     login,
//     signup,
//     logout,
//     updateUserPreferences
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User, UserPreferences } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      const newUser: User = {
        id: user.uid,
        email: user.email || '',
        displayName: displayName,
        photoURL: user.photoURL || '',
        preferences: {
          categories: [],
          topics: [],
          sources: [],
          favorites: []
        },
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), newUser);
      setUserData(newUser);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, { 
        preferences: { 
          ...userData?.preferences, 
          ...preferences 
        } 
      }, { merge: true });
      
      // Update local state
      if (userData) {
        setUserData({
          ...userData,
          preferences: {
            ...userData.preferences,
            ...preferences
          }
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    signup,
    logout,
    updateUserPreferences
  };

  return (
    <AuthContext.Provider value={value}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        {!loading && children}
      </div>
    </AuthContext.Provider>
  );
};