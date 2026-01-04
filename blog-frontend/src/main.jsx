import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from 'react-router-dom'
import { LoginPage, SingUpPage, ProfilePage, WriteBlogPage, BlogReadPage , PageNotFound, BookMarkedBlogs } from "./pages/index.js"
import AuthProvider from './context/auth/AuthProvider.jsx'
import { SidebarProvider } from './context/SidebarContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ProtectedRoutes from './routes/ProtectedRoutes.jsx'
import Layout from './components/Layout'



const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<App/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/register' element={<SingUpPage/>}/>
      <Route path='/blog/:slug' element={<Layout><BlogReadPage/></Layout>}/>
      <Route element={<ProtectedRoutes/>}>
         <Route path='/profile' element={<ProfilePage/>}/>
         <Route path='/write' element={<WriteBlogPage/>}/>
         <Route path='/bookmarks' element={<Layout><BookMarkedBlogs/></Layout>}/>
      </Route>
      <Route path='*' element={<PageNotFound/>} />
    </>
  )
)



createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AuthProvider>
      <SidebarProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </SidebarProvider>
    </AuthProvider>
  </ThemeProvider>,
)
