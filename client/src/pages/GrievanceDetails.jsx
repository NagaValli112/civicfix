import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGrievance, deleteGrievance } from '../api/grievance.api';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import LocationMap from '../components/common/LocationMap';
import { FaMapMarkerAlt, FaCalendar, FaUser, FaArrowLeft, FaTrash, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import '../styles/GrievanceDetails.css'; // New CSS file

const GrievanceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [grievance, setGrievance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            try {
                await deleteGrievance(id);
                navigate('/');
            } catch (err) {
                alert('Failed to delete report');
                console.error(err);
            }
        }
    };

    useEffect(() => {
        const fetchGrievance = async () => {
            try {
                const data = await getGrievance(id);
                setGrievance(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load issue details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchGrievance();
        }
    }, [id]);

    if (loading) return <div className="loading-state">Loading details...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!grievance) return <div className="error-state">Issue not found</div>;

    const { title, description, category, severity, status, imageUrl, location, createdAt, user, reporter } = grievance;

    return (
        <>
            <Navbar />
            <div className="details-page-wrapper">
                <div className="details-container">

                    {/* Header Actions */}
                    <div className="details-header">
                        <Button
                            variant="secondary"
                            onClick={() => navigate(-1)}
                            className="back-button"
                        >
                            <FaArrowLeft /> Back
                        </Button>

                        <button onClick={handleDelete} className="delete-button">
                            <FaTrash /> Delete Report
                        </button>
                    </div>

                    <div className="glass-card details-card">

                        {/* Hero Image Section */}
                        <div className="hero-image-container">
                            {imageUrl && imageUrl !== 'no-photo.jpg' ? (
                                <img
                                    src={imageUrl.startsWith('data:') || imageUrl.startsWith('http') ? imageUrl : `/${imageUrl}`}
                                    alt={title}
                                    className="hero-image"
                                />
                            ) : (
                                <div className="no-image-placeholder">
                                    No Image Available
                                </div>
                            )}
                            <div className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
                                {status}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="details-content">
                            <div className="title-row">
                                <h1>{title || 'Report'}</h1>
                                <span className={`severity-badge severity-${severity.toLowerCase()}`}>
                                    {severity} Severity
                                </span>
                            </div>

                            <div className="meta-info">
                                <div className="meta-item">
                                    <FaCalendar />
                                    <span>{new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                </div>
                                <div className="meta-item">
                                    <FaUser />
                                    <span>{user?.name || reporter?.name || 'Anonymous'}</span>
                                </div>
                                <div className="meta-item">
                                    <FaInfoCircle />
                                    <span className="category-tag">{category?.name || 'General'}</span>
                                </div>
                            </div>

                            <div className="description-section">
                                <h3>Description</h3>
                                <p>{description}</p>
                            </div>

                            {/* Map Section */}
                            {location && (location.lat || location.coordinates) && (
                                <div className="location-section">
                                    <h3><FaMapMarkerAlt /> Location</h3>
                                    <p className="address-text">{location.formattedAddress || location.address}</p>
                                    <div className="map-wrapper">
                                        <LocationMap
                                            lat={location.lat || (location.coordinates ? location.coordinates[1] : null)}
                                            lng={location.lng || (location.coordinates ? location.coordinates[0] : null)}
                                            onLocationSelect={() => { }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GrievanceDetails;
