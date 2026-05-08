import { config } from 'dotenv'
config({ path: '.env' })

import { db } from '../src/lib/db'
import { users, ubids, sourceRecords } from '../src/lib/db/schema'
import { hashSync } from 'bcrypt-ts'

async function seed() {
  console.log('Seeding...')

  // Users (3 hardcoded demo accounts)
  await db.insert(users).values([
    { email: 'anirudh@ubid.gov',  name: 'Anirudh',  passwordHash: hashSync('demo1234', 10), role: 'Admin' },
    { email: 'reviewer@ubid.gov', name: 'Reviewer', passwordHash: hashSync('demo1234', 10), role: 'Reviewer' },
    { email: 'auditor@ubid.gov',  name: 'Auditor',  passwordHash: hashSync('demo1234', 10), role: 'Auditor' },
  ]).onConflictDoNothing()

  // 10 UBIDs
  const ubidRows = [
    { ubidCode: 'UBID-00231', canonicalName: 'XKBZQN CMJWDACX IQDENCM ADHDCMK', pincode: '560001', activityStatus: 'Active'   as const, mergeConfidence: '0.970', sourceCount: 3 },
    { ubidCode: 'UBID-00104', canonicalName: 'HBCKN XMBBQ TQZOX',               pincode: '560001', activityStatus: 'Active'   as const, mergeConfidence: '0.950', sourceCount: 2 },
    { ubidCode: 'UBID-00192', canonicalName: 'IZNNDXK INCJM TQZOX',             pincode: '560002', activityStatus: 'Active'   as const, mergeConfidence: '0.880', sourceCount: 2 },
    { ubidCode: 'UBID-00071', canonicalName: 'XBQZQXB YYBX & NKBHDNNCX',       pincode: '560001', activityStatus: 'Dormant'  as const, mergeConfidence: '0.910', sourceCount: 3 },
    { ubidCode: 'UBID-00305', canonicalName: 'ZNCJAQT BQBNMZQINCQJY',           pincode: '560001', activityStatus: 'Active'   as const, mergeConfidence: '0.990', sourceCount: 1 },
    { ubidCode: 'UBID-00388', canonicalName: 'XZD YCQBXK FQBJYZV',             pincode: '560002', activityStatus: 'Active'   as const, mergeConfidence: '0.960', sourceCount: 2 },
    { ubidCode: 'UBID-00441', canonicalName: 'JNZQNCMJN FQZYCB QMY',           pincode: '560002', activityStatus: 'Dormant'  as const, mergeConfidence: '0.930', sourceCount: 2 },
    { ubidCode: 'UBID-00512', canonicalName: 'QNJKXHD MBXMDQBX',               pincode: '560003', activityStatus: 'Active'   as const, mergeConfidence: '0.870', sourceCount: 2 },
    { ubidCode: 'UBID-00428', canonicalName: 'HBMZQ MNJYBZV',                  pincode: '560003', activityStatus: 'Closed'   as const, mergeConfidence: '0.940', sourceCount: 2 },
    { ubidCode: 'UBID-00619', canonicalName: 'WDQNVN XIDQQBZX',                pincode: '560001', activityStatus: 'Active'   as const, mergeConfidence: '0.980', sourceCount: 3 },
  ]

  await db.insert(ubids).values(ubidRows).onConflictDoNothing()
  console.log(`Inserted ${ubidRows.length} UBIDs`)

  // Source records will be seeded by Pavan after adapter fixtures are ready
  console.log('Done. Run npx drizzle-kit push first if tables do not exist.')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
