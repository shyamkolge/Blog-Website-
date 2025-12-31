import React from "react";
import useAuth from "../hooks/useAuth";

const ProfilePage = () => {
  const { user } = useAuth();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4  text-center">Profile Page</h1>
      {user ? (
        <div className="space-y-4 max-w-md mx-auto flex flex-col items-center">
          <div className="p-4 border rounded-lg shadow-md ">
            <h2 className="text-2xl font-semibold">User Details</h2>
            <img
              className="w-32 h-32 rounded-full"
              src={`${user.profilePhoto}`}
              alt="profile photo"
            />
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>First Name:</strong> {user.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {user.lastName}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Age:</strong> {user.age}
            </p>
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default ProfilePage;
