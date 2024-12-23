import { pool, getLocalData } from './db';

async function testConnection() {
  try {
    // Тест подключения
    const [result] = await pool.query('SELECT 1 + 1 as test');
    console.log('Successfully connected to database!');
    
    // Тест получения данных
    const data = await getLocalData('2024-01-01', '2024-01-31');
    console.log('Headers:', data.content[0]);
    console.log('First row:', data.content[1]);
    console.log('Total rows:', data.content.length - 1); // -1 для заголовков
    
  } catch (error) {
    console.error('Failed to connect to database:', error);
  } finally {
    await pool.end();
  }
}

testConnection(); 