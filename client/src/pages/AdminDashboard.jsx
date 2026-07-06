import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGrievances, updateGrievanceStatus, deleteGrievance } from '../api/grievance.api';
import Navbar from '../components/layout/Navbar';
import { FaSearch, FaEllipsisV, FaFilter } from 'react-icons/fa';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);

    const fetchGrievances = async () => {
        try {
            const res = await getGrievances();
            setGrievances(res || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrievances();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateGrievanceStatus(id, { status: newStatus });
            fetchGrievances();
        } catch (err) {
            alert('Failed to update status');
        }
    };
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this grievance?");

        if (!confirmDelete) return;

        try {
            await deleteGrievance(id);
            alert("Grievance deleted successfully.");
            fetchGrievances();
            setActiveMenu(null);
        } catch (err) {
            console.error(err);
            alert("Failed to delete grievance.");
        }
    };

    const filteredGrievances = grievances.filter(g => {
        const matchSearch = (g.title || '').toLowerCase().includes(search.toLowerCase()) ||
            (g.category?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || g.status === filter;
        return matchSearch && matchFilter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open': return { bg: '#e0f2fe', color: '#0284c7' }; // Light Blue
            case 'In Progress': return { bg: '#ffedd5', color: '#c2410c' }; // Orange
            case 'Resolved': return { bg: '#dcfce7', color: '#15803d' }; // Green
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'Low': return { bg: '#f3f4f6', color: '#6b7280' };
            case 'Medium': return { bg: '#fef3c7', color: '#d97706' };
            case 'High': return { bg: '#fee2e2', color: '#dc2626' };
            case 'Critical': return { bg: '#ef4444', color: '#ffffff' };
            default: return { bg: '#f3f4f6', color: '#6b7280' };
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <>
            <Navbar />
            <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 64px)', padding: '2rem' }}>
                <div className="container" style={{ maxWidth: '1400px' }}>

                    {/* Dashboard Card */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0'
                    }}>

                        {/* Header Section */}
                        <div style={{
                            padding: '1.5rem 2rem',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>Recent Grievances</h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Latest reported civic issues</p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{
                                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            backgroundColor: '#f8fafc',
                                            fontSize: '0.9rem',
                                            width: '250px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        style={{
                                            padding: '0.6rem 2rem 0.6rem 1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            backgroundColor: '#f8fafc',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            appearance: 'none',
                                            minWidth: '120px'
                                        }}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                    <FaFilter style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', fontSize: '0.8rem' }} />
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', backgroundColor: 'white' }}>
                                        {['ID', 'Issue', 'Category', 'Status', 'Severity', 'Reporter', 'Date', ''].map((head, i) => (
                                            <th key={i} style={{
                                                padding: '1rem 1.5rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#64748b',
                                            }}>
                                                {head}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGrievances.map((g, index) => {
                                        const statusStyle = getStatusStyle(g.status);
                                        const severityStyle = getSeverityStyle(g.severity);
                                        // Format ID like GRV-\n2847 or just GRV-2847. Image shows stacked? No, single line. 
                                        // Image shows: GRV - 2847 with space? No, GRV-\n2847 possibly if column narrow.
                                        // Let's stick to standard GRV-xxxx
                                        const shortId = `GRV-${g._id.slice(-4).toUpperCase()}`;

                                        return (
                                            <tr
                                                key={g._id}
                                                style={{
                                                    borderBottom: '1px solid #e2e8f0',
                                                    transition: 'background-color 0.2s',
                                                    backgroundColor: 'white' // Image has white background for rows
                                                }}
                                                className="table-row-hover"
                                            >
                                                <td style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#64748b', verticalAlign: 'middle' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span>GRV-</span>
                                                        <span>{g._id.slice(-4).toUpperCase()}</span>
                                                    </div>
                                                </td>

                                                <td style={{ padding: '1.5rem', fontSize: '0.95rem', fontWeight: '600', color: '#1e293b', verticalAlign: 'middle' }}>
                                                    {g.title}
                                                </td>

                                                <td style={{ padding: '1.5rem', fontSize: '0.9rem', color: '#64748b', verticalAlign: 'middle' }}>
                                                    <div style={{ maxWidth: '150px', lineHeight: '1.4' }}>
                                                        {g.category?.name || 'Uncategorized'}
                                                    </div>
                                                </td>

                                                <td style={{ padding: '1.5rem', verticalAlign: 'middle' }}>
                                                    <span style={{
                                                        padding: '0.4rem 1rem',
                                                        borderRadius: '2rem',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        backgroundColor: statusStyle.bg,
                                                        color: statusStyle.color,
                                                        display: 'inline-block',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {g.status}
                                                    </span>
                                                </td>

                                                <td style={{ padding: '1.5rem', verticalAlign: 'middle' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        backgroundColor: severityStyle.bg,
                                                        color: severityStyle.color,
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {g.severity}
                                                    </span>
                                                </td>

                                                <td style={{ padding: '1.5rem', fontSize: '0.9rem', color: '#64748b', verticalAlign: 'middle' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ color: '#475569' }}>{g.user?.name || 'Anonymous'}</span>
                                                    </div>
                                                </td>

                                                <td style={{ padding: '1.5rem', fontSize: '0.9rem', color: '#64748b', verticalAlign: 'middle' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span>{new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        <span style={{ fontSize: '0.8rem' }}>{new Date(g.createdAt).getFullYear()}</span>
                                                    </div>
                                                </td>

                                                <td style={{ padding: '1.5rem', position: 'relative', verticalAlign: 'middle' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenu(activeMenu === g._id ? null : g._id);
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#94a3b8',
                                                            padding: '0.5rem',
                                                            borderRadius: '50%'
                                                        }}
                                                    >
                                                        <FaEllipsisV />
                                                    </button>

                                                    {activeMenu === g._id && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            right: '1.5rem',
                                                            top: '3rem',
                                                            backgroundColor: 'white',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                                            border: '1px solid #e2e8f0',
                                                            zIndex: 10,
                                                            minWidth: '150px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{ padding: '0.5rem 0' }}>
                                                                <button style={menuItemStyle} onClick={() => navigate(`/issue/${g._id}`)}>View Details</button>
                                                                <button style={menuItemStyle} onClick={() => handleStatusUpdate(g._id, 'In Progress')}>Mark In Progress</button>
                                                                <button style={menuItemStyle} onClick={() => handleStatusUpdate(g._id, 'Resolved')}>Mark Resolved</button>
                                                                <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }}></div>
                                                                <button style={menuItemStyle} onClick={() => handleDelete(g._id)}>Delete</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredGrievances.length === 0 && !loading && (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                                    <p>No grievances found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .table-row-hover:hover {
          background-color: #f8fafc !important;
        }
      `}</style>
        </>
    );
};

const menuItemStyle = {
    display: 'block',
    width: '100%',
    padding: '0.5rem 1rem',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    fontSize: '0.875rem',
    color: '#334155',
    cursor: 'pointer',
    transition: 'background-color 0.1s'
};

export default AdminDashboard;
