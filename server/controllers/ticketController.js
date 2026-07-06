const Ticket = require('../models/Ticket');
const { analyzeIssue } = require('../services/geminiService');
const {
    storeTicket,
    deleteTicket: deleteVector,
    findPotentialDuplicates
} = require('../services/pineconeService');
// @desc    Report a new issue
// @route   POST /api/tickets/report
// @access  Public
const reportIssue = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const { userDescription, lat, lng, address, reporterName, reporterContact } = req.body;

        if (!reporterName || !reporterContact) {
            return res.status(400).json({ message: 'Reporter name and contact are required.' });
        }

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // 1. AI Analysis (MOVED UP: We need this to check for 'Semantic' Duplicates)
        const analysis = await analyzeIssue(imageBuffer, mimeType, userDescription || '');
        // Create a temporary ticket object for Pinecone search
const tempTicket = {
    aiAnalysis: analysis,
    location: {
        address: address || "",
        lat: lat ? parseFloat(lat) : 0,
        lng: lng ? parseFloat(lng) : 0
    }
};

// Search Pinecone
const pineconeMatches = await findPotentialDuplicates(tempTicket);

console.log("Pinecone Matches Found:", pineconeMatches.length);

        // 2. DUPLICATE CHECK
        // Check for existing open tickets within 100m AND Same Category
        const existingTickets = await Ticket.find({
            status: { $in: ['Open', 'In Progress'] },
            'location.lat': { $exists: true },
            'location.lng': { $exists: true }
        });

        let duplicateTicket = null;
        for (const t of existingTickets) {
            const dist = getDistanceFromLatLonInKm(lat, lng, t.location.lat, t.location.lng);

            // Logic: Must be within 50m (tighter radius) AND share likely the same issue type
            // e.g. Don't merge a 'Streetlight' report with a 'Pothole' report even if they are close.
           if (dist <= 50) {

    const pineconeFound = pineconeMatches.find(
        p => p.id === t._id.toString()
    );

    if (pineconeFound) {

        console.log(
            "Duplicate confirmed by Pinecone:",
            pineconeFound.score
        );

        duplicateTicket = t;

        break;

    }

}
        }

        if (duplicateTicket) {
            // Merge logic: Increment vote count
            duplicateTicket.voteCount += 1;

            // Check for Severity Upgrade
            const severityRank = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
            const oldSeverity = duplicateTicket.aiAnalysis?.severity || 'Low';
            const newSeverity = analysis.severity || 'Low';
            let upgradeMessage = '';

            if (severityRank[newSeverity] > severityRank[oldSeverity]) {
                duplicateTicket.aiAnalysis.severity = newSeverity;
                // Also update SLA based on new severity
                duplicateTicket.sla = calculateSLA(newSeverity);
                upgradeMessage = ` and severity UPGRADED to ${newSeverity}`;
            }

            // Record this update in history
            if (!duplicateTicket.updates) {
                duplicateTicket.updates = [];
            }
            duplicateTicket.updates.push({
                reporter: {
                    name: reporterName,
                    contact: reporterContact
                },
                userDescription: userDescription || '',
                imageUrl: "data:image/jpeg;base64," + imageBuffer.toString('base64'),
                severity: analysis.severity,
                timestamp: new Date()
            });

            await duplicateTicket.save();

            return res.status(200).json({
                success: true,
                data: duplicateTicket,
                message: `Report merged with existing ${analysis.issueType} report nearby${upgradeMessage}.`,
                isDuplicate: true,
                severityUpgraded: !!upgradeMessage
            });
        }

        // 3. Create Ticket
        const sla = calculateSLA(analysis.severity);
        const ticket = new Ticket({
            imageUrl: "data:image/jpeg;base64," + imageBuffer.toString('base64'),
            userDescription,
            reporter: {
                name: reporterName,
                contact: reporterContact
            },
            aiAnalysis: analysis,
            location: {
                lat: lat ? parseFloat(lat) : 0,
                lng: lng ? parseFloat(lng) : 0,
                address: address || 'No address provided'
            },
            status: 'Open',
            sla: sla
        });
await ticket.save();

console.log("Ticket saved in MongoDB:", ticket._id);

console.log("Calling storeTicket...");
await storeTicket(ticket);

console.log("storeTicket finished");
res.status(201).json({
    success: true,
    data: ticket,
    message: 'Ticket created successfully via AI analysis.'
});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all tickets with filters
// @route   GET /api/tickets
// @access  Public (or Admin)
const getTickets = async (req, res) => {
    try {
        const { status, limit } = req.query;
        let query = {};
        if (status) query.status = status;

        const tickets = await Ticket.find(query).sort({ createdAt: -1 }).limit(Number(limit) || 50);

        // Map to format expected by Client (Backwards Compatibility)
        const mappedTickets = tickets.map(t => ({
            _id: t._id,
            title: t.aiAnalysis?.issueType || t.userDescription?.substring(0, 30) || 'Report',
            description: t.aiAnalysis?.description || t.userDescription,
            category: { name: t.aiAnalysis?.category || 'General' },
            severity: t.aiAnalysis?.severity || 'Medium',
            status: t.status,
            imageUrl: t.imageUrl,
            location: t.location,
            createdAt: t.createdAt,
            user: { name: t.reporter?.name || 'Anonymous' }
        }));

        res.json(mappedTickets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Analyze image without creating ticket
// @route   POST /api/tickets/analyze
// @access  Public
const analyzeImage = async (req, res) => {
    try {
        console.log("Analyzing image request received...");
        if (!req.file) {
            console.log("No file uploaded in request.");
            return res.status(400).json({ message: 'Image is required' });
        }

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        const analysis = await analyzeIssue(imageBuffer, mimeType, '');

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Public
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Map to Grievance format
        const mappedTicket = {
            _id: ticket._id,
            title: ticket.aiAnalysis?.issueType || ticket.userDescription?.substring(0, 30) || 'Report',
            description: ticket.aiAnalysis?.description || ticket.userDescription,
            category: { name: ticket.aiAnalysis?.category || 'General' },
            severity: ticket.aiAnalysis?.severity || 'Medium',
            status: ticket.status,
            imageUrl: ticket.imageUrl,
            location: ticket.location,
            createdAt: ticket.createdAt,
            user: { name: ticket.reporter?.name || 'Anonymous' },
            reporter: ticket.reporter, // Include full reporter details
            aiAnalysis: ticket.aiAnalysis // Include full analysis
        };

        res.json(mappedTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id/status
// @access  Public (or Admin)
const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.status = status;
        await ticket.save();

        res.json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper to calculate SLA based on priority
function calculateSLA(severity) {
    let hours;
    switch (severity) {
        case 'High':
            hours = 24; // 24 hours for high priority
            break;
        case 'Medium':
            hours = 72; // 3 days for medium priority
            break;
        case 'Low':
            hours = 168; // 7 days for low priority
            break;
        default:
            hours = 72; // Default to medium
    }

    return {
        expectedResolutionDate: new Date(Date.now() + hours * 60 * 60 * 1000),
        estimatedHours: hours,
        breachWarning: false
    };
}

// Helper to calculate distance in meters (Haversine formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d * 1000; // Distance in meters
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// @desc    Get High Priority Zones (Clusters of >3 tickets within 100m)
// @route   GET /api/tickets/zones
// @access  Public (or Admin)
const getHighPriorityZones = async (req, res) => {
    try {
        // Fetch all open or in-progress tickets with valid location
        const tickets = await Ticket.find({
            status: { $in: ['Open', 'In Progress'] },
            'location.lat': { $exists: true },
            'location.lng': { $exists: true }
        });

        const clusters = [];
        const visited = new Set();

        // Simple clustering
        for (let i = 0; i < tickets.length; i++) {
            if (visited.has(tickets[i]._id.toString())) continue;

            const currentCluster = [tickets[i]];
            visited.add(tickets[i]._id.toString());

            for (let j = i + 1; j < tickets.length; j++) {
                if (visited.has(tickets[j]._id.toString())) continue;

                const dist = getDistanceFromLatLonInKm(
                    tickets[i].location.lat,
                    tickets[i].location.lng,
                    tickets[j].location.lat,
                    tickets[j].location.lng
                );

                if (dist <= 100) { // 100 meters
                    currentCluster.push(tickets[j]);
                    visited.add(tickets[j]._id.toString());
                }
            }

            // Only consider it a "High Priority Zone" if total weight (votes) > 3
            // Calculate total weight of the cluster
            const clusterWeight = currentCluster.reduce((sum, t) => sum + (t.voteCount || 1), 0);

            if (clusterWeight > 3) {
                clusters.push({
                    zoneId: `zone-${i}`,
                    count: clusterWeight, // Use weight as the count
                    center: tickets[i].location, // Use the seed ticket as approx center
                    tickets: currentCluster
                });
            }
        }

        // Sort by highest count (weight) first
        clusters.sort((a, b) => b.count - a.count);

        res.json({
            success: true,
            count: clusters.length,
            zones: clusters
        });

    } catch (error) {
        console.error("Zone detection error:", error);
        res.status(500).json({ message: 'Server Error analyzing zones' });
    }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Public (or Admin)
const deleteTicket = async (req, res) => {
    try {

        const { id } = req.params;

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        // Delete from MongoDB
        await Ticket.findByIdAndDelete(id);

        // Delete from Pinecone
        await deleteVector(id);

        res.json({
            success: true,
            message: "Ticket deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error",
            error: error.message
        });

    }
};
module.exports = {
    reportIssue,
    getTickets,
    getTicketById,
    analyzeImage,
    updateTicketStatus,
    getHighPriorityZones,
    deleteTicket
};