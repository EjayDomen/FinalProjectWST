import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faUsers, faUser, faPeopleRoof, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import logoImage from '../../LoginPage/images/logo.png';
import '../styles/Nav.css';

export const SuperAdminNav = () => {
    return(
        <aside className="superadmin-sidebar">
            <img src={logoImage} alt="logo" className="logo-image" />
            <div className="logo">Queue Care</div>
            <nav>
                <NavLink 
                    to="/superadmin/dashboard" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <FontAwesomeIcon icon={faGauge} className="icon" /> Dashboard
                </NavLink>
                <NavLink 
                    to="/superadmin/queuemanage" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <FontAwesomeIcon icon={faUsers} className="icon" /> Queue Management
                </NavLink>
                <NavLink 
                    to="/superadmin/patientmanage" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <FontAwesomeIcon icon={faUser} className="icon" /> Patient Management
                </NavLink>
                <NavLink 
                    to="/superadmin/staffmanage" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <FontAwesomeIcon icon={faPeopleRoof} className="icon" /> Staff Management
                </NavLink>
                <NavLink 
                    to="/" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="icon" /> Log Out
                </NavLink>
            </nav>
        </aside>
    );
}
