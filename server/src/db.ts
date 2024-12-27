import mysql from 'mysql2/promise';
import { config } from './config';

export const pool = mysql.createPool({
  ...config.db,
  host: '127.0.0.1',
  port: 3306,
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10
});

export async function getLocalData(startDate: string, endDate: string) {
  console.log('DB Query params:', { startDate, endDate });

  const headers = [
    'payment_history_id',
    'merchant_id',
    'consumer_id',
    'transaction_token',
    'payment_tool_info',
    'payment_tool_token',
    'payment_method_name',
    'gateway_name',
    'action_type',
    'item_access_id',
    'item_id',
    'item_type',
    'item_title',
    'charged_amount',
    'currency_iso',
    'issued_by',
    'created_at',
    'note',
    'consumer_email',
    'timestamp',
    'ip_address',
    'continent',
    'country',
    'country_iso',
    'voucher_code',
    'voucher_discount',
    'expires_at',
    'access_fee_description',
    'exchange_rate',
    'settlement_currency',
    'dacast_conversion_rate_to_account_currency',
    'dacast_fee',
    'dacast_item_title'
  ];

  const [rows] = await pool.query(`
    SELECT 
      ${headers.join(', ')}
    FROM transaction_lines
    WHERE created_at >= ? AND created_at <= ?
    ORDER BY created_at
  `, [startDate, endDate]);
  
  console.log('Raw DB result:', {
    rowCount: (rows as any[]).length,
    firstRow: (rows as any[])[0],
    sql: `SELECT * FROM transaction_lines 
          WHERE created_at >= '${startDate}'
          AND created_at <= '${endDate}'`
  });

  // Преобразуем результат в формат CsvFile
  const result = {
    name: 'database-data',
    content: [
      headers,
      ...((rows as any[]).map(row => headers.map(h => row[h]?.toString() || '')))
    ],
    source: 'local' as const
  };

  console.log('Transformed result:', {
    rowCount: result.content.length - 1,
    hasHeaders: result.content[0] === headers,
    firstDataRow: result.content[1]
  });

  return result;
} 