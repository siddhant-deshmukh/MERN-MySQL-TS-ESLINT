import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import { get } from './lib/api'
import type { IUser } from './types'
import type { RootState } from './redux/store';
import AuthSection from '@/features/Auth';
import { clearAuthUser, setAuthUser } from './redux/slices/userSlice'
import MainAppSection from './features/OrdersProducts';


function App() {
  const authUser = useSelector((state: RootState) => state.user.authUser); // Updated slice name
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Attempt to re-authenticate user from stored token on app load
    const verifyAuth = async () => {
      try {
        const response = await get('/u/') as { user: IUser };
        dispatch(setAuthUser(response.user));
        console.log('User verified:', response.user);
      } catch (error) {
        console.error('User verification failed:', error);
        localStorage.removeItem('authToken'); // Clear invalid token
        dispatch(clearAuthUser());
      }
    };
    verifyAuth();
  }, [dispatch]);

  if(!authUser) {
    return (<AuthSection />)
  } return (
    < MainAppSection />
  )
}

export default App
