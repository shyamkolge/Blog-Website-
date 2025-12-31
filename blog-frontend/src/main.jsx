import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from 'react-router-dom'
import { LoginPage, SingUpPage, ProfilePage } from "./pages/index.js"
import AuthProvider from './context/auth/AuthProvider.jsx'
import ProtectedRoutes from './routes/ProtectedRoutes.jsx'


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<App/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/register' element={<SingUpPage/>}/>
      <Route element={<ProtectedRoutes/>}>
         <Route path='/profile' element={<ProfilePage/>}/>
      </Route>
      <Route path='*' element={<h1 className='text-3xl font-bold'>404 - Page Not Found</h1>}/>
    </>
  )
)



createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>,
)
