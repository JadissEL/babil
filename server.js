const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Countries API ---

app.get('/api/countries', async (req, res) => {
  try {
    const countries = await prisma.country.findMany();
    // Parse the full_data JSON string back into an object
    const formattedCountries = countries.map(c => ({
      ...c,
      full_data: JSON.parse(c.full_data || '{}')
    }));
    res.json(formattedCountries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/countries/:id', async (req, res) => {
  try {
    const country = await prisma.country.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { comments: { where: { status: 'APPROVED' } } }
    });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    
    res.json({
      ...country,
      full_data: JSON.parse(country.full_data || '{}')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Comments API ---

app.post('/api/comments', async (req, res) => {
  const { userId, countryId, content } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: parseInt(userId),
        countryId: parseInt(countryId),
        status: 'PENDING'
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/comments/:countryId', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { 
        countryId: parseInt(req.params.countryId),
        status: 'APPROVED'
      },
      include: { user: { select: { name: true } } }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Recommendation Engine (Simulated) ---

app.post('/api/recommendation', async (req, res) => {
  const { profile } = req.body;
  try {
    const countries = await prisma.country.findMany();
    // Simple logic for recommendation
    const recommended = countries.map(c => {
      const full = JSON.parse(c.full_data || '{}');
      let score = c.tourist_visa_score || 0;
      
      // Adjust based on profile (Simplified logic from app.js)
      if (profile.savings > 50000) score += 1;
      if (profile.CNSS_status) score += 1;
      
      return {
        id: c.id,
        name: c.name,
        match_score: score,
        reason: score > 8 ? 'Excellent match for your profile' : 'Good potential'
      };
    }).sort((a, b) => b.match_score - a.match_score);

    res.json(recommended.slice(0, 5));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Admin: Moderation ---

app.get('/api/admin/comments/pending', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { status: 'PENDING' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/comments/:id/approve', async (req, res) => {
  try {
    const comment = await prisma.comment.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'APPROVED' }
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/comments/:id', async (req, res) => {
  try {
    await prisma.comment.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a default user if none exists
async function setupDefaultUser() {
  const user = await prisma.user.upsert({
    where: { email: 'admin@visaflow.ma' },
    update: {},
    create: {
      email: 'admin@visaflow.ma',
      name: 'Admin VisaFlow',
      role: 'ADMIN'
    }
  });
  console.log('Default user ready:', user.email);
}

app.listen(PORT, async () => {
  await setupDefaultUser();
  console.log(`Server running on http://localhost:${PORT}`);
});
