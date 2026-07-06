import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import GrievanceCard from '../components/cards/GrievanceCard';
import Input from '../components/common/Input';
import { getGrievances } from '../api/grievance.api';
import { FaSearch } from 'react-icons/fa';

const Home = () => {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const fetchGrievances = async () => {
        setLoading(true);
        try {
            // In real app, pass search/filter to API
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

    const filteredGrievances = grievances.filter(g => {
        const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) ||
            g.description.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || g.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '2rem 1rem' }}>
                <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                        Make Your City Better
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-light)', marginBottom: '2rem' }}>
                        Report issues, track status, and improve your neighborhood.
                    </p>

                    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Input
                                placeholder="Search for issues..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FaSearch style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ padding: '0 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        >
                            <option value="All">All Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {filteredGrievances.length > 0 ? (
                            filteredGrievances.map(g => (
                                <GrievanceCard key={g._id} grievance={g} />
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b' }}>
                                No grievances found. Be the first to report one!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;
