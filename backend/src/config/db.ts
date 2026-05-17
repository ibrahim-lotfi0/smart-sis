import sql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';
import path from 'path';

// Manual env load from possible locations
const rootPath = path.resolve(process.cwd());
dotenv.config({ path: path.join(rootPath, '.env') });
dotenv.config({ path: path.join(rootPath, 'backend', '.env') });

const config: any = {
  driver: 'msnodesqlv8',
  connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || '(localdb)\\MSSQLLocalDB'};Database=${process.env.DB_NAME || 'SmartUniversity'};Trusted_Connection=yes;`,
};

console.log('Connecting to DB:', process.env.DB_NAME || 'SmartUniversity');

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool: any) => {
    console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch((err: any) => {
    console.error('❌ Database Connection Failed! ', err);
    throw err;
  });

export { sql };
