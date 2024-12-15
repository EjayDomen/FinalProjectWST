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
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsPerPage = 5;
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [currentNotificationPage, setCurrentNotificationPage] = useState(0);
  const notificationRef = useRef(null);

  // Notification styles based on type
  const getNotificationStyle = (type) => {
    switch (type) {
      case "SUCCESS":
        return { backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" };
      case "INFO":
        return { backgroundColor: "#d1ecf1", color: "#0c5460", border: "1px solid #bee5eb" };
      case "WARNING":
        return { backgroundColor: "#fff3cd", color: "#856404", border: "1px solid #ffeeba" };
      case "CRITICAL":
        return { backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" };
      default:
        return { backgroundColor: "#f8f9fa", color: "#6c757d", border: "1px solid #d6d8db" };
    }
  };

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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/signup/patient/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        navigate("/");
      }
    };

    fetchPatientDetails();
    fetchNotifications();
  }, [navigate]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/patient/notification/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const sortedNotifications = response.data.sort((a, b) => (a.STATUS === "unread" ? -1 : 1));
      setNotifications(sortedNotifications);

      const unreadCount = sortedNotifications.filter((notification) => notification.STATUS === "unread").length;
      setUnreadNotificationCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const getDisplayedNotifications = () => {
    const startIndex = currentNotificationPage * notificationsPerPage;
    return notifications.slice(startIndex, startIndex + notificationsPerPage);
  };

  const handleNextPage = () => {
    if ((currentNotificationPage + 1) * notificationsPerPage < notifications.length) {
      setCurrentNotificationPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentNotificationPage > 0) {
      setCurrentNotificationPage((prevPage) => prevPage - 1);
    }
  };

  const toggleMenu = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev); // Toggle menu on mobile
    }
  };
  const toggleNotifications = () => setShowNotifications((prev) => !prev);

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
                to="/patient/doctors"
                className={({ isActive }) =>
                  `dropdown-item-custom menuItem ${isActive ? "active" : ""}`
                }
              >
                <Person /> <span>Doctors</span>
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

            <div className="position-relative">
              <button className="icon-button" onClick={toggleNotifications}>
                <Notifications />
                {unreadNotificationCount > 0 && (
                  <span className="badge bg-danger position-absolute top-5 start-100 translate-middle">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="dropdown-menu-custom notification-dropdown" ref={notificationRef}>
                  {getDisplayedNotifications().map((notification, index) => (
                    <div
                      key={index}
                      className="p-3 mb-2 rounded"
                      style={getNotificationStyle(notification.TYPE)}
                    >
                      <p className="mb-0">{notification.MESSAGE}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/patient/profile" className="user-info ms-3 d-flex align-items-center">
              <AccountCircle className="me-2" /> <span className="name">{user?.FIRST_NAME} {user?.LAST_NAME}</span>
            </NavLink>
          </div>

        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
