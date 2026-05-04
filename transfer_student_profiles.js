const mongoose = require('mongoose');
const Student = require('./src/models/Student');
const StudentProfile = require('./src/models/StudentProfile');

async function transferStudentProfiles() {
  try {
    await mongoose.connect('mongodb+srv://techhimtech_db_user:7kWRGlcUpVDFE6uE@cluster0.9uenbsu.mongodb.net/?appName=Cluster0&tls=true');
    
    console.log('=== Transferring StudentProfiles to Student Model ===');
    
    const schoolId = '69b3dcd73ef8d082bd894d8e'; // admin11@abc.com ka school
    
    // Get all student profiles for this school
    const studentProfiles = await StudentProfile.find({ 
      schoolId: schoolId, 
      isActive: true 
    });
    
    console.log(`Found ${studentProfiles.length} student profiles to transfer`);
    
    let transferred = 0;
    let skipped = 0;
    
    for (const profile of studentProfiles) {
      try {
        // Check if already exists in Student model
        const existingStudent = await Student.findOne({ 
          admissionNumber: profile.admissionNumber,
          schoolId: schoolId 
        });
        
        if (existingStudent) {
          console.log(`⚠️  Skipping ${profile.admissionNumber} - already exists`);
          skipped++;
          continue;
        }
        
        // Create Student record from StudentProfile
        const studentData = {
          admissionNumber: profile.admissionNumber || `ADM-${Date.now()}`,
          firstName: profile.firstName,
          lastName: profile.lastName || '',
          gender: profile.gender,
          dateOfBirth: profile.dateOfBirth,
          classId: profile.currentEnrollment?.classId,
          sectionId: profile.currentEnrollment?.sectionId,
          parentName: profile.parentUserId?.name || 'Parent',
          parentPhone: profile.phone || '0000000000',
          parentEmail: profile.email,
          address: profile.address,
          schoolId: schoolId,
          isActive: true,
          createdBy: profile._id // Using profile ID as creator
        };
        
        const student = await Student.create(studentData);
        console.log(`✅ Transferred: ${profile.admissionNumber} -> ${student._id}`);
        transferred++;
        
      } catch (error) {
        console.log(`❌ Error transferring ${profile.admissionNumber}: ${error.message}`);
      }
    }
    
    console.log('\n=== Transfer Summary ===');
    console.log(`Total profiles: ${studentProfiles.length}`);
    console.log(`Transferred: ${transferred}`);
    console.log(`Skipped: ${skipped}`);
    
    // Verify the transfer
    const studentCount = await Student.countDocuments({ 
      schoolId: schoolId, 
      isActive: true 
    });
    console.log(`\n✅ Students now in Student model: ${studentCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

transferStudentProfiles();
