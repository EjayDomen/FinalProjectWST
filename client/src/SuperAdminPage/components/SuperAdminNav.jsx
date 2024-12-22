import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faUsers, faUser, faPeopleRoof } from '@fortawesome/free-solid-svg-icons';
import logoImage from '../../LoginPage/images/logo.png';
import '../css/Nav.css';

export const SuperAdminNav = () => {
    return(
        <aside className="sidebar">
            <img src={logoImage} alt="logo" className="logo-image" />
            <div className="logo">Queue Care</div>
            <nav>
                <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <FontAwesomeIcon icon={faGauge} className="icon" /> Dashboard
                </NavLink>
                <NavLink 
                    to="/dashboard/queuemanage" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <FontAwesomeIcon icon={faUsers} className="icon" /> Queue Management
                </NavLink>
                <NavLink 
                    to="/dashboard/patientmanage" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <FontAwesomeIcon icon={faUser} className="icon" /> Patient Management
                </NavLink>
                <NavLink 
                    to="/dashboard/staffmanage" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <FontAwesomeIcon icon={faPeopleRoof} className="icon" /> Staff Management
                </NavLink>
            </nav>
        </aside>
    );
}
