import express from 'express';
import cors from 'cors';
import { config } from './config';
import { getLocalData } from './db';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/local-data', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    console.log('Received request:', { startDate, endDate });

    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      return res.status(400).json({ error: 'Invalid date parameters' });
    }

    const data = await getLocalData(startDate, endDate);
    console.log('Sending response:', {
      rowCount: data.content.length - 1,
      hasHeaders: !!data.content[0],
      firstDataRow: data.content[1]
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 