import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UserProfile.css"; // Import CSS for styling
import profileImage from "../images/pookie.jpeg";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const [passwordError, setPasswordError] = useState("");

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/superadmin/me/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Replace with actual token retrieval logic
            },
          }
        );

        setProfile(response.data);
        setFormData({
          ...formData,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
        });
      } catch (err) {
        setError(err.response?.data?.error || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate password fields
  const validatePasswords = () => {
    const { old_password, new_password, confirm_new_password } = formData;

    if (!old_password) {
      return "Old password is required.";
    }

    if (!new_password) {
      return "New password is required.";
    }

    if (new_password !== confirm_new_password) {
      return "New password and confirm password do not match.";
    }

    if (new_password.length < 8) {
      return "New password must be at least 8 characters long.";
    }

    if (!/[A-Z]/.test(new_password)) {
      return "New password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(new_password)) {
      return "New password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(new_password)) {
      return "New password must contain at least one number.";
    }

    return "";
  };

  // Update profile function
  const updateProfile = async () => {
    // Check if password fields are included in the form data
  const { old_password, new_password, confirm_new_password } = formData;
  if (old_password || new_password || confirm_new_password) {
    // Validate password fields
    const passwordValidationError = validatePasswords();
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
  }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/superadmin/updateProfile/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Profile updated successfully!");
      setProfile(response.data); // Update the state with the updated profile
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to update profile";
      alert(errorMessage);
      if (errorMessage === "Invalid password") {
        setPasswordError("Old password is incorrect.");
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-profile">
      <h1 className="user-profile-header">User Profile</h1>
      <div className="profile-container">
        <div className="profile-picture-section">
          <img
            src={profileImage} // Replace with actual profile picture URL if available
            alt="Profile"
            className="profile-picture"
          />
          <div className="profile-btn">
            <button className="btn change-picture-btn">Change Picture</button>
            <button className="btn delete-picture-btn">Delete Picture</button>
          </div>
        </div>
        <form
          className="profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            updateProfile();
          }}
        >
          <label>
            First Name
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Last Name
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Old Password
            <input
              type="password"
              name="old_password"
              value={formData.old_password}
              placeholder="Enter old password"
              onChange={handleInputChange}
            />
          </label>
          <label>
            New Password
            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              placeholder="Enter new password"
              onChange={handleInputChange}
            />
          </label>
          <label>
            Confirm New Password
            <input
              type="password"
              name="confirm_new_password"
              value={formData.confirm_new_password}
              placeholder="Confirm new password"
              onChange={handleInputChange}
            />
          </label>
          {passwordError && <div className="error">{passwordError}</div>}
          <button type="submit" className="btn update-btn">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
