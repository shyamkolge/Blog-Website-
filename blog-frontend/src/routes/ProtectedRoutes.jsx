import React from 'react'
import { Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const ProtectedRoutes = () => {
  
  const { user } = useAuth();

  return (
    <>
      { user ? <Outlet /> : <div className='text-3xl font-bold'>Access Denied. Please login to continue.</div> }
    </>
  )
}

export default ProtectedRoutes