import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { createGrievance, analyzeGrievance } from '../api/grievance.api';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaRobot, FaMapMarkerAlt } from 'react-icons/fa';
import LocationMap from '../components/common/LocationMap';
import '../styles/SnapCategorize.css';

const SnapCategorize = () => {
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [location, setLocation] = useState({ lat: '', lng: '', address: '' });

    const [incidentTime, setIncidentTime] = useState('');
    const [reporterName, setReporterName] = useState('');
    const [reporterContact, setReporterContact] = useState('');
    const [gettingLocation, setGettingLocation] = useState(false);
    const [locationMode, setLocationMode] = useState('auto'); // 'auto' or 'map'
    const navigate = useNavigate();

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
                });
                setGettingLocation(false);
            },
            () => {
                setError('Unable to retrieve your location');
                setGettingLocation(false);
            }
        );
    };

    const generateDescription = async (fileToAnalyze) => {
        const file = fileToAnalyze || image;
        if (!file) {
            setError('Please upload an image first');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const data = await analyzeGrievance(formData);

            if (data.success && data.data.description) {
                setDescription(data.data.description);
            }
        } catch (err) {
            console.error("Failed to analyze image", err);
            // DEBUG: Show error to user to help diagnose
            alert(`Analysis Failed: ${err.message}\n${err.response?.data?.message || ''}`);

            if (!fileToAnalyze) {
                setError('Failed to generate description. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));

            // Trigger automatic generation
            generateDescription(file);
        }
    };

    const handleAiGenerate = () => generateDescription();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !image) {
            setError('Please provide both description and image');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('description', description);
        formData.append('title', description.substring(0, 30) + (description.length > 30 ? '...' : '')); // Auto title
        formData.append('image', image);
        formData.append('reporterName', reporterName || 'Anonymous User');
        formData.append('reporterContact', reporterContact || 'Not Provided');

        if (location.lat && location.lng) {
            formData.append('lat', location.lat);
            formData.append('lng', location.lng);
            formData.append('address', location.address);
        }

        if (incidentTime) {
            formData.append('incidentTime', incidentTime);
        }

        try {
            const res = await createGrievance(formData);

            if (res.isDuplicate) {
                alert(`Notice: ${res.message}\n\nYour report has been merged with an existing issue to help prioritize it.`);
            }

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit grievance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="snap-container">
                <h1 className="snap-title">Report an Issue</h1>

                <div className="snap-card">
                    {error && <div className="snap-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="snap-form">
                        <div className="form-group">
                            <label className="form-label">Snap a Photo</label>
                            <div
                                className="upload-zone"
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="upload-preview" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <FaCamera className="upload-icon" />
                                        <p className="upload-text">Tap to report an issue 📸</p>
                                    </div>
                                )}
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="description-header">
                                <label className="form-label">Description</label>
                                <button
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={!image || loading}
                                    className="ai-btn"
                                >
                                    <FaRobot />
                                    {loading ? 'Analyzing...' : 'Regenerate Description'}
                                </button>
                            </div>
                            <textarea
                                rows="4"
                                placeholder="Describe the issue... (e.g., 'Large pothole on Main St')"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form-control"
                                required
                            ></textarea>
                        </div>

                        {/* Location Details */}
                        <div className="form-group">
                            <div className="location-header">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaMapMarkerAlt /> Location
                                </label>
                                <div className="location-toggle">
                                    <button
                                        type="button"
                                        onClick={() => setLocationMode('auto')}
                                        className={`toggle-btn ${locationMode === 'auto' ? 'active' : ''}`}
                                    >
                                        Auto
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLocationMode('map')}
                                        className={`toggle-btn ${locationMode === 'map' ? 'active' : ''}`}
                                    >
                                        Map
                                    </button>
                                </div>
                            </div>

                            {locationMode === 'auto' ? (
                                <div className="location-auto-panel">
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Detected Coordinates</p>
                                        <div className="coords-display">
                                            {location.lat && location.lng
                                                ? `${Number(location.lat).toFixed(6)}, ${Number(location.lng).toFixed(6)}`
                                                : 'No location detected yet'}
                                        </div>
                                    </div>
                                    <Button type="button" onClick={handleGetLocation} variant="secondary" disabled={gettingLocation} style={{ width: '100%' }}>
                                        {gettingLocation ? 'getting location...' : 'Retry GPS'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="location-map-panel">
                                    <LocationMap
                                        lat={location.lat}
                                        lng={location.lng}
                                        onLocationSelect={(lat, lng) => setLocation({ ...location, lat, lng, address: `Map: ${lat.toFixed(4)}, ${lng.toFixed(4)}` })}
                                    />
                                    <div className="map-status">
                                        {location.lat && location.lng
                                            ? `Selected: ${Number(location.lat).toFixed(6)}, ${Number(location.lng).toFixed(6)}`
                                            : 'Click on the map to select location'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reporter Details */}
                        <div className="form-group">
                            <label className="form-label">Your Details (Optional)</label>
                            <div className="form-row">
                                <Input
                                    placeholder="Your Name"
                                    value={reporterName}
                                    onChange={(e) => setReporterName(e.target.value)}
                                />
                                <Input
                                    placeholder="Contact (Email/Phone)"
                                    value={reporterContact}
                                    onChange={(e) => setReporterContact(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Time Details */}
                        <div className="form-group">
                            <label className="form-label">Time of Incident</label>
                            <Input
                                type="datetime-local"
                                value={incidentTime}
                                onChange={(e) => setIncidentTime(e.target.value)}
                            />
                        </div>

                        <div className="ai-info-box">
                            <FaRobot className="ai-info-icon" />
                            <p className="ai-info-text">
                                Our AI will automatically analyze your photo to detect the issue and write a description. You can also click "AI Generate" to retry.
                            </p>
                        </div>

                        <button type="submit" disabled={loading} className="submit-btn" style={{
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}>
                            {loading ? 'Analyzing & Submitting...' : 'Submit Report'}
                        </button>
                    </form>
                </div >
            </div >
        </>
    );
};

export default SnapCategorize;
