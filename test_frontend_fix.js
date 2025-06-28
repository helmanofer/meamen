// Test script to verify the frontend fix
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000';
const CORRECT_TRAINER_ID = '9d5eb8f5-cdb5-4332-a649-de8fec1c4b83';

async function testTraineesAPI() {
    try {
        console.log('Testing trainees API with correct trainer ID...');
        const response = await axios.get(`${API_BASE_URL}/trainees/`, {
            params: { trainer_id: CORRECT_TRAINER_ID }
        });
        
        console.log(`✓ API returned ${response.data.length} trainees`);
        console.log('First trainee:', response.data[0]?.name || 'None');
        
        if (response.data.length > 0) {
            console.log('✓ Frontend should now display trainees correctly!');
        } else {
            console.log('✗ No trainees returned, check if database is seeded');
        }
    } catch (error) {
        console.error('✗ API test failed:', error.message);
        console.log('Make sure the backend server is running on port 8000');
    }
}

testTraineesAPI();