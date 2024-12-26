import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Person, EventNote, Logout, Menu, Notifications, AccountCircle, Feedback } from "@mui/icons-material";
import FeedbackModal from "../components/Feedback";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/SidebarPatient.css"; // Assuming you have a custom CSS file

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576); // Track screen size
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [user, setUser] = useState(null);



  // Update `isMobile` on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 576);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patient/me/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          profile_picture: response.data.profile_picture, // Add profile picture
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      }
    };
  
    fetchPatientDetails();
  }, [navigate]);
  
  const toggleMenu = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev); // Toggle menu on mobile
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsOpen(true); // Open menu on hover for larger screens
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsOpen(false); // Close menu on hover out for larger screens
    }
  };

  return (
    <div className="sidebar">
      <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow">
        <div className="container-fluid">
          <div
            className="menu-container"
            onMouseEnter={handleMouseEnter} // Hover to open (large screens)
            onMouseLeave={handleMouseLeave} // Hover out to close (large screens)
          >
            <button className="menu-btn bg-light" onClick={toggleMenu}>
              <Menu style={{ fontSize: "30px" }} />
            </button>

           {/* Dropdown Menu */}
           {isOpen && ( // Menu visibility controlled by `isOpen
            <div className="dropdown-menu-custom">
              <NavLink
                to="/patient/home"
                className={({ isActive }) =>
                  `dropdown-item-custom menuItem ${isActive ? "active" : ""}`
                }
              >
                <Home /> <span>Home</span>
              </NavLink>
              <NavLink
                to="/patient/appointment"
                className={({ isActive }) =>
                  `dropdown-item-custom menuItem ${isActive ? "active" : ""}`
                }
              >
                <EventNote /> <span>Appointments</span>
              </NavLink>
              <button
                className="dropdown-item-custom text-danger"
                onClick={() => navigate("/")}
              >
                <Logout /> <span>Log Out</span>
              </button>
            </div>
          )}
          </div>


          <div className="text d-flex-column align-items-center me-auto">
            <h5 className="ms-3 mb-0">Good Day {user?.FIRST_NAME}!</h5>
            <p className="text-muted ms-3 mb-0 d-none d-md-block">How are you feeling today?</p>
          </div>

          <div className="d-flex align-items-center">
            <button className="icon-button me-2" onClick={() => setOpenFeedbackModal(true)}>
              <Feedback />
            </button>
            <FeedbackModal open={openFeedbackModal} handleClose={() => setOpenFeedbackModal(false)} />

            <NavLink to="/patient/profile" className="user-info ms-3 d-flex align-items-center">
              <AccountCircle className="me-2" /> <span className="name">{user?.first_name} {user?.last_name}</span>
            </NavLink>
          </div>

        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
