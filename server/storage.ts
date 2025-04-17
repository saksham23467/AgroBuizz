import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import * as schema from "../shared/schema.js"

dotenv.config();

import {
  users,
  admins,
  crops,
  customers,
  farmers,
  userRoleEnum,
  userTypeEnum,
  orderStatusEnum,
  orderTypeEnum,
  disputeStatusEnum,
  disputeTypeEnum,
} from "../shared/schema.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool,{schema});

export {
  users,
  admins,
  crops,
  customers,
  farmers,
  userRoleEnum,
  userTypeEnum,
  orderStatusEnum,
  orderTypeEnum,
  disputeStatusEnum,
  disputeTypeEnum,
};