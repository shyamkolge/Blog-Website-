import React from 'react'
import useAuth from '../hooks/useAuth'

const ProfilePage = () => {
  const { user } = useAuth();
  return (
    <div>
        <h1 className="text-3xl font-bold mb-4">Profile Page</h1>
        { user ? (
          <div className="space-y-2">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>First Name:</strong> {user.firstName}</p>
            <p><strong>Last Name:</strong> {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Age:</strong> {user.age}</p>
            </div>
        ) : (
          <p>No user data available.</p>
        ) }
    </div>
  )
}

export default ProfilePage