const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventify';

async function updateUsers() {
  try {
    console.log(' Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(' Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Count users to update
    const usersCount = await usersCollection.countDocuments();
    console.log(` Found ${usersCount} users to check`);

    // Update all users - add address fields if they don't exist
    const result = await usersCollection.updateMany(
      {},
      {
        $set: {
          'address.addressLine1': { $ifNull: ['$address.addressLine1', ''] },
          'address.addressLine2': { $ifNull: ['$address.addressLine2', ''] },
          'address.landmark': { $ifNull: ['$address.landmark', ''] },
          'address.city': { $ifNull: ['$address.city', ''] },
          'address.state': { $ifNull: ['$address.state', ''] },
          'address.pincode': { $ifNull: ['$address.pincode', ''] },
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with address fields`);

    // Check for users without firstName/lastName (old schema)
    const oldUsers = await usersCollection.find({ 
      firstName: { $exists: false } 
    }).toArray();

    if (oldUsers.length > 0) {
      console.log(`\n  Found ${oldUsers.length} users with old schema (name field)`);
      
      for (const user of oldUsers) {
        let firstName = 'User';
        let lastName = '';

        if (user.name) {
          const nameParts = user.name.trim().split(' ');
          firstName = nameParts[0] || 'User';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              firstName, 
              lastName,
            },
            $unset: { name: '' }
          }
        );
        console.log(`  Migrated user: ${user.email}`);
      }
    }

    console.log('\n Database migration completed successfully!');
    console.log('\n Summary:');
    console.log(`   • Total users: ${usersCount}`);
    console.log(`   • Users updated: ${result.modifiedCount}`);
    console.log(`   • Old schema users migrated: ${oldUsers.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
updateUsers();