import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { FaCity, FaCamera, FaUser, FaSearch } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            backgroundColor: 'white',
            padding: '0.75rem 2rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '1px solid #f1f5f9'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px' }}>
                {/* Logo Area - Keeping it simple or matching style */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', textDecoration: 'none' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
                    <span>CivicFix</span>
                </Link>

                {/* Central Navigation */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <NavItem to="/" icon={<FaSearch style={{ fontSize: '0.9rem' }} />} label="Home" />
                    <NavItem to="/report" icon={<FaCamera style={{ fontSize: '0.9rem' }} />} label="Report Issue" />
                    <NavItem to="/admin" icon={<FaCity style={{ fontSize: '0.9rem' }} />} label="Dashboard" active={location.pathname === '/admin'} />
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                                <FaUser />
                                <span>{user.name}</span>
                            </div>
                            <Button onClick={handleLogout} variant="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', border: '1px solid #e2e8f0' }}>Sign Out</Button>
                        </>
                    ) : (
                        <>

                            <Link to="/report" className="btn btn-primary" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1.25rem',
                                backgroundColor: '#1e3a8a', // Darker blue as per image
                                borderRadius: '8px',
                                fontSize: '0.9rem'
                            }}>
                                Report Issue
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const NavItem = ({ to, icon, label, active }) => (
    <Link to={to} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        color: active ? '#0f172a' : '#64748b',
        fontWeight: '600',
        fontSize: '0.9rem',
        padding: '0.5rem 0',
        borderBottom: active ? '2px solid #10b981' : '2px solid transparent', // Green underline for active
        transition: 'all 0.2s'
    }}>
        <span style={{ color: active ? '#10b981' : 'inherit' }}>{icon}</span>
        <span>{label}</span>
    </Link>
);

export default Navbar;
