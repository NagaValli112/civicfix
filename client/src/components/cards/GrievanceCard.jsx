import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';

const GrievanceCard = ({ grievance }) => {
    const { title, description, category, severity, status, imageUrl, location, createdAt } = grievance;

    const statusColor = {
        'Open': '#3b82f6',
        'In Progress': '#f59e0b',
        'Resolved': '#22c55e',
        'Rejected': '#ef4444'
    }[status] || '#64748b';

    const severityColor = {
        'Low': '#22c55e',
        'Medium': '#3b82f6',
        'High': '#f59e0b',
        'Critical': '#ef4444'
    }[severity] || '#64748b';

    const navigate = useNavigate();

    return (
        <div
            className="card"
            onClick={() => navigate(`/issue/${grievance._id}`)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ position: 'relative', height: '200px', margin: '-1.5rem -1.5rem 0 -1.5rem', backgroundColor: '#e2e8f0' }}>
                {imageUrl && imageUrl !== 'no-photo.jpg' ? (
                    <img
                        src={imageUrl.startsWith('data:') || imageUrl.startsWith('http') ? imageUrl : `/${imageUrl}`}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image' }}
                    />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                        No Image
                    </div>
                )}
                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: statusColor, color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
                    {status}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h3>
                <span style={{ fontSize: '0.75rem', color: severityColor, border: `1px solid ${severityColor}`, padding: '0.1rem 0.5rem', borderRadius: '0.25rem' }}>
                    {severity}
                </span>
            </div>

            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-light)' }}>
                <span style={{ fontWeight: '500', color: 'var(--primary-color)' }}>
                    {category?.name || 'Uncategorized'}
                </span>
                <span>•</span>
                <span>{new Date(createdAt).toLocaleDateString()}</span>
            </div>

            {location && location.formattedAddress && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b', marginTop: 'auto' }}>
                    <FaMapMarkerAlt />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{location.formattedAddress}</span>
                </div>
            )}
        </div>
    );
};

export default GrievanceCard;
