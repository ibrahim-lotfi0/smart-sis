"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = exports.poolPromise = void 0;
const msnodesqlv8_js_1 = __importDefault(require("mssql/msnodesqlv8.js"));
exports.sql = msnodesqlv8_js_1.default;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Manual env load from possible locations
const rootPath = path_1.default.resolve(process.cwd());
dotenv_1.default.config({ path: path_1.default.join(rootPath, '.env') });
dotenv_1.default.config({ path: path_1.default.join(rootPath, 'backend', '.env') });
const config = {
    driver: 'msnodesqlv8',
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || '(localdb)\\MSSQLLocalDB'};Database=${process.env.DB_NAME || 'SmartUniversity'};Trusted_Connection=yes;`,
};
console.log('Connecting to DB:', process.env.DB_NAME || 'SmartUniversity');
exports.poolPromise = new msnodesqlv8_js_1.default.ConnectionPool(config)
    .connect()
    .then((pool) => {
    console.log('✅ Connected to SQL Server');
    return pool;
})
    .catch((err) => {
    console.error('❌ Database Connection Failed! ', err);
    throw err;
});
