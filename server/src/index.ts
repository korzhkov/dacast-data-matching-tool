import express from 'express';
import cors from 'cors';
import { config } from './config';
import { getLocalData } from './db';
import { pool } from './db';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/local-data', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = 'SELECT * FROM transaction_lines WHERE created_at >= ? AND created_at <= ?';
    const params = [startDate, endDate];
    
    // Форматируем запрос с реальными параметрами перед выполнением
    const actualQuery = pool.format(query, params);
    
    const data = await getLocalData(startDate as string, endDate as string);
    res.json({
      ...data,
      actualQuery // добавляем в ответ
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 