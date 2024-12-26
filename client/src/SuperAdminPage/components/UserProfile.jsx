import React from "react";
import "../styles/UserProfile.css"; // Import CSS for styling
import profileImage from '../images/pookie.jpeg';

const UserProfile = () => {
  return (
    <div className="user-profile">
      <h1 className="user-profile-header">User Profile</h1>
      <div className="profile-container">
        <div className="profile-picture-section">
          <img
            src={profileImage}// Replace with actual profile picture
            alt="Profile"
            className="profile-picture"
          />
          <div className="profile-btn">
            <button className="btn change-picture-btn">Change Picture</button>
            <button className="btn delete-picture-btn">Delete Picture</button>
          </div>
        </div>
        <form className="profile-form">
          <label>
            Username
            <input type="text" value="Nick Gerblack" readOnly />
          </label>
          <label>
            Email
            <input type="email" value="iloven*ggas@gmail.com" readOnly />
          </label>
          <label>
            Old Password
            <input type="password" placeholder="Enter old password" />
          </label>
          <label>
            New Password
            <input type="password" placeholder="Enter new password" />
          </label>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
