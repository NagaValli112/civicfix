const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAnalyzeEndpoint() {
    console.log("Testing POST /api/grievances/analyze...");

    // Create a dummy image if not exists
    const imagePath = path.join(__dirname, 'test_image.jpg');
    if (!fs.existsSync(imagePath)) {
        fs.writeFileSync(imagePath, 'dummy image content');
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    try {
        const response = await axios.post('http://localhost:5000/api/grievances/analyze', form, {
            headers: {
                ...form.getHeaders()
            }
        });
        console.log("✅ Success:", response.status, response.data);
    } catch (error) {
        if (error.response) {
            console.log("❌ Server Error:", error.response.status, error.response.data);
        } else {
            console.log("❌ Network Error:", error.message);
        }
    }
}

testAnalyzeEndpoint();
