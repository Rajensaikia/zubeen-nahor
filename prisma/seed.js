const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Clearing database...');
  await prisma.timelineMilestone.deleteMany({});
  await prisma.songQuote.deleteMany({});
  await prisma.song.deleteMany({});
  await prisma.adminLog.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.plantationRecord.deleteMany({});
  await prisma.follower.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding users...');
  
  // Passwords will be simple: "password123" hashed
  const commonPasswordHash = hashPassword('password123');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@zubeennahor.org',
      username: 'admin',
      passwordHash: hashPassword('admin123'),
      displayName: 'Zubeen Nahor Admin',
      bio: 'Official admin account for Zubeen Nahor Tree Plantation platform.',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      totalTrees: 150,
      isVerified: true
    }
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'pranab@gmail.com',
      username: 'pranab_deka',
      passwordHash: commonPasswordHash,
      displayName: 'Pranab Deka',
      bio: 'Environmentalist and Zubeen Garg fan from Guwahati. Let\'s make Assam green!',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      totalTrees: 45,
      isVerified: true
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'rashmi@gmail.com',
      username: 'rashmi_borah',
      passwordHash: commonPasswordHash,
      displayName: 'Rashmi Borah',
      bio: 'Teacher and nature enthusiast. Planting trees with my students in Jorhat.',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      totalTrees: 80,
      isVerified: true
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'jitu@gmail.com',
      username: 'jitu_kalita',
      passwordHash: commonPasswordHash,
      displayName: 'Jitu Kalita',
      bio: 'Student at Tezpur University. Member of the Green Campus initiative.',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      totalTrees: 12,
      isVerified: false
    }
  });

  console.log('Seeding groups...');
  await prisma.group.createMany({
    data: [
      {
        name: 'Guwahati Green Warriors',
        description: 'NGO group focused on urban tree plantation drives in Guwahati city.',
        type: 'NGO',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
        membersCount: 124,
        creatorId: user1.id,
        pastWorks: 'Organized over 15 urban plantation drives in 2025, planting 300+ Nahor and Bakul saplings around Dighalipukhuri and railway quarters.',
        memories: 'Our first mega drive on World Environment Day was unforgettable! Over 100 local citizens and Zubeen fans joined hands, and Zubeen Garg himself sent a message of encouragement.',
        nextPlan: 'Next drive is scheduled for next month to plant 200 fruit-bearing trees around local government schools in Guwahati.',
        mediaUrls: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Tezpur University Eco Club',
        description: 'Student-led community promoting tree plantation and clean campus drives at TU.',
        type: 'College',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600',
        membersCount: 86,
        creatorId: user3.id,
        pastWorks: 'Cleaned and planted 150+ tree saplings along the Tezpur University Lake area and hostel premises during our 2025 green week campaign.',
        memories: "The night camp under the newly planted Bakul trees, singing Zubeen Da's classic environmental songs, was a memory of a lifetime.",
        nextPlan: 'Goal to install organic waste composters next to hostels and plant 100 medicinal plants around the science departments.',
        mediaUrls: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Jorhat High School Green Army',
        description: 'School group organizing weekend plantation drives and environmental awareness camps.',
        type: 'School',
        imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600',
        membersCount: 42,
        creatorId: user2.id,
        pastWorks: 'Planted 120+ Nahor trees along the boundary walls and playground of Jorhat High School, maintained diligently by student volunteers.',
        memories: 'Seeing the small Nahor saplings survive their first monsoon and sprout new leaves brought so much joy to the children!',
        nextPlan: 'Establishing a mini botanical garden in the school backyard with 50+ species of Assamese herbs.',
        mediaUrls: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600'
      }
    ]
  });

  console.log('Seeding events...');
  const event1Date = new Date();
  event1Date.setDate(event1Date.getDate() + 5); // 5 days from now
  const event2Date = new Date();
  event2Date.setDate(event2Date.getDate() + 12); // 12 days from now
  const event3Date = new Date();
  event3Date.setDate(event3Date.getDate() - 5); // 5 days ago (completed event)

  await prisma.event.createMany({
    data: [
      {
        title: 'Guwahati Mega Plantation Drive',
        description: 'Join us in dedicating a forest of 500 saplings to the memory of Zubeen Garg on the banks of Brahmaputra.',
        date: event1Date,
        location: 'Uzanbazar River Bank, Guwahati',
        district: 'Kamrup Metropolitan',
        imageUrl: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8c5c8?auto=format&fit=crop&q=80&w=600',
        attendeesCount: 78,
        organiserId: user1.id,
        chiefGuest: 'Zubeen Garg',
        treesPlanted: 500,
        status: 'UPCOMING',
        schedule: '09:00 AM - Assembly & Volunteer Check-in\n10:00 AM - Chief Guest Zubeen Garg Welcome Address\n10:30 AM - Sapling Distribution & Briefing\n11:00 AM - Mega Plantation Drive Commences\n01:30 PM - Community Refreshments & Interaction',
        documents: 'Drive Guide:https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600,Plantation Blueprint:https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600',
      },
      {
        title: 'Jorhat Eco Drive 2026',
        description: 'Planting indigenous trees like Nahor, Bakul, and Krishnachura around school campuses in Jorhat.',
        date: event2Date,
        location: 'Jorhat Town Field Area',
        district: 'Jorhat',
        imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600',
        attendeesCount: 35,
        organiserId: user2.id,
        chiefGuest: 'Rashmi Borah (Eco Club Head)',
        treesPlanted: 150,
        status: 'UPCOMING',
        schedule: '08:30 AM - Assemble at Town Field\n09:00 AM - Distribution of Saplings to Schools\n09:30 AM - Commencing drives at school boundaries\n12:00 PM - Lunch & Reflection Session',
        documents: 'Jorhat Drive Map:https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600',
      },
      {
        title: 'Brahmaputra Forest Dedication Drive',
        description: 'Successfully planted 400 saplings on the river banks to honor Zubeen Garg\'s 2025 environmental calls.',
        date: event3Date,
        location: 'Kachari Ghat, Guwahati',
        district: 'Kamrup Metropolitan',
        imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=600',
        attendeesCount: 112,
        organiserId: user1.id,
        chiefGuest: 'Dr. Hari Prasad (Forest Ranger)',
        treesPlanted: 400,
        status: 'COMPLETED',
        schedule: '08:30 AM - Volunteers Assembly\n09:15 AM - Welcome Speech by Forest Ranger Dr. Hari Prasad\n09:45 AM - Commencing the Plantation\n12:30 PM - Vote of Thanks & Group Photography',
        documents: 'Drive Accomplishment Report:https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600',
        memories: 'It was a rainy morning but the spirit of the volunteers was higher than ever! We successfully planted 400 Nahor trees along the ghats. Everyone sang songs of Zubeen Garg together in the rain.',
        mediaUrls: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=600',
      }
    ]
  });

  console.log('Seeding plantation records...');
  
  // Approved records (they add to user totals and public counter)
  const pr1 = await prisma.plantationRecord.create({
    data: {
      name: 'Pranab Deka',
      mobile: '9876543210',
      district: 'Kamrup Metropolitan',
      village: 'Guwahati',
      location: 'Dighalipukhuri Park',
      treeCount: 25,
      species: 'Nahor, Bakul',
      date: new Date('2026-05-15'),
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600',
      notes: 'Planted 25 Nahor trees in the Dighalipukhuri premises with friends.',
      status: 'APPROVED',
      userId: user1.id,
      verifiedBy: admin.id
    }
  });

  const pr2 = await prisma.plantationRecord.create({
    data: {
      name: 'Pranab Deka',
      mobile: '9876543210',
      district: 'Nagaon',
      village: 'Koliabor',
      location: 'Koliabor College Campus',
      treeCount: 20,
      species: 'Krishnachura',
      date: new Date('2026-05-20'),
      imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=600',
      notes: '20 Krishnachura trees planted along the entry path.',
      status: 'APPROVED',
      userId: user1.id,
      verifiedBy: admin.id
    }
  });

  const pr3 = await prisma.plantationRecord.create({
    data: {
      name: 'Rashmi Borah',
      mobile: '9864012345',
      district: 'Jorhat',
      village: 'Teok',
      location: 'Teok High School Grounds',
      treeCount: 80,
      species: 'Nahor, Nim',
      date: new Date('2026-05-10'),
      imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600',
      notes: 'Massive drive with school kids, planting 80 trees in tribute.',
      status: 'APPROVED',
      userId: user2.id,
      verifiedBy: admin.id
    }
  });

  const pr4 = await prisma.plantationRecord.create({
    data: {
      name: 'Jitu Kalita',
      mobile: '9123456789',
      district: 'Sonitpur',
      village: 'Tezpur',
      location: 'Tezpur University Lake area',
      treeCount: 12,
      species: 'Bakul',
      date: new Date('2026-06-01'),
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600',
      notes: '12 Bakul trees around the university lake.',
      status: 'APPROVED',
      userId: user3.id,
      verifiedBy: admin.id
    }
  });

  // Pending records (for admin verification demo)
  await prisma.plantationRecord.create({
    data: {
      name: 'Jitu Kalita',
      mobile: '9123456789',
      district: 'Sonitpur',
      village: 'Tezpur',
      location: 'University Hostels',
      treeCount: 15,
      species: 'Sishu',
      date: new Date('2026-06-06'),
      imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600',
      notes: 'Planted 15 Sishu trees behind Hostel 3. Please approve!',
      status: 'PENDING',
      userId: user3.id
    }
  });

  await prisma.plantationRecord.create({
    data: {
      name: 'Bhaben Saikia',
      mobile: '9435011223',
      district: 'Sivasagar',
      village: 'Nazira',
      location: 'Nazira Public Park',
      treeCount: 30,
      species: 'Nahor',
      date: new Date('2026-06-05'),
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600',
      notes: 'Planted 30 Nahor trees in Nazira in memory of the legend Zubeen Garg.',
      status: 'PENDING',
      userId: user2.id
    }
  });

  console.log('Seeding posts...');
  
  // Approved posts (appear in public feed)
  const post1 = await prisma.post.create({
    data: {
      caption: 'Proud to dedicate 45 trees to the memory of our beloved Zubeen Garg! Planted at Dighalipukhuri and Koliabor. Let\'s keep Assam green! #ZubeenGarg #ZubeenNahor #GreenAssam #TreePlantation',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600',
      location: 'Guwahati & Koliabor',
      district: 'Kamrup Metropolitan',
      species: 'Nahor, Krishnachura',
      treeCount: 45,
      likesCount: 12,
      commentsCount: 2,
      status: 'APPROVED',
      userId: user1.id,
      createdAt: new Date('2026-05-21')
    }
  });

  const post2 = await prisma.post.create({
    data: {
      caption: 'Our school plantation drive was a huge success. 80 Nahor and Nim saplings successfully planted. The students are so excited to nurture these! "One Tree, One Memory, One Greener Assam" 🌿💚 #SchoolDrive #EnvironmentalConservation #Nahor',
      imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600',
      location: 'Teok High School Grounds',
      district: 'Jorhat',
      species: 'Nahor, Nim',
      treeCount: 80,
      likesCount: 24,
      commentsCount: 3,
      status: 'APPROVED',
      userId: user2.id,
      createdAt: new Date('2026-05-11')
    }
  });

  const post3 = await prisma.post.create({
    data: {
      caption: 'A small step towards a greener future. Planted 12 Bakul trees around the Tezpur University Lake. Zubeen Da\'s songs always inspire us to connect with nature. 🍃🎶 #TezpurUniversity #Bakul #ZubeenNahor #OneGreenerAssam',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600',
      location: 'Tezpur University Lake',
      district: 'Sonitpur',
      species: 'Bakul',
      treeCount: 12,
      likesCount: 8,
      commentsCount: 1,
      status: 'APPROVED',
      userId: user3.id,
      createdAt: new Date('2026-06-02')
    }
  });

  console.log('Seeding comments...');
  await prisma.comment.createMany({
    data: [
      {
        content: 'Incredible work, Pranab Da! This is a beautiful tribute.',
        postId: post1.id,
        userId: user2.id,
        createdAt: new Date('2026-05-21T12:00:00Z')
      },
      {
        content: 'Awesome effort! Keep it up.',
        postId: post1.id,
        userId: user3.id,
        createdAt: new Date('2026-05-21T13:30:00Z')
      },
      {
        content: 'Wow, 80 trees! That is remarkable. Heartiest congratulations to the kids and teacher!',
        postId: post2.id,
        userId: user1.id,
        createdAt: new Date('2026-05-11T16:00:00Z')
      },
      {
        content: 'So inspiring. Need this in every school in Assam.',
        postId: post2.id,
        userId: user3.id,
        createdAt: new Date('2026-05-11T17:15:00Z')
      },
      {
        content: 'Zubeen Da would be proud! 💚',
        postId: post2.id,
        userId: admin.id,
        createdAt: new Date('2026-05-12T09:00:00Z')
      },
      {
        content: 'Lovely campus! Good job Jitu.',
        postId: post3.id,
        userId: user1.id,
        createdAt: new Date('2026-06-02T10:00:00Z')
      }
    ]
  });

  console.log('Seeding likes...');
  await prisma.like.createMany({
    data: [
      { postId: post1.id, userId: user2.id },
      { postId: post1.id, userId: user3.id },
      { postId: post1.id, userId: admin.id },
      { postId: post2.id, userId: user1.id },
      { postId: post2.id, userId: user3.id },
      { postId: post2.id, userId: admin.id },
      { postId: post3.id, userId: user1.id },
      { postId: post3.id, userId: user2.id }
    ]
  });

  console.log('Seeding followers...');
  await prisma.follower.createMany({
    data: [
      { followerId: user1.id, followingId: user2.id },
      { followerId: user2.id, followingId: user1.id },
      { followerId: user3.id, followingId: user1.id },
      { followerId: user3.id, followingId: user2.id },
      { followerId: user1.id, followingId: admin.id }
    ]
  });

  console.log('Seeding badges...');
  await prisma.badge.createMany({
    data: [
      {
        name: 'Green Warrior',
        code: 'WARRIOR',
        description: 'Awarded for planting 10+ trees.',
        userId: user3.id
      },
      {
        name: 'Green Warrior',
        code: 'WARRIOR',
        description: 'Awarded for planting 10+ trees.',
        userId: user1.id
      },
      {
        name: 'Nature Protector',
        code: 'PROTECTOR',
        description: 'Awarded for planting 30+ trees.',
        userId: user1.id
      },
      {
        name: 'Green Warrior',
        code: 'WARRIOR',
        description: 'Awarded for planting 10+ trees.',
        userId: user2.id
      },
      {
        name: 'Nature Protector',
        code: 'PROTECTOR',
        description: 'Awarded for planting 30+ trees.',
        userId: user2.id
      },
      {
        name: 'Zubeen Nahor Champion',
        code: 'CHAMPION',
        description: 'Awarded for planting 50+ trees.',
        userId: user2.id
      }
    ]
  });

  console.log('Seeding notifications...');
  await prisma.notification.createMany({
    data: [
      {
        type: 'LIKE',
        content: 'Rashmi Borah liked your post about 45 trees.',
        userId: user1.id,
        senderId: user2.id,
        isRead: false
      },
      {
        type: 'COMMENT',
        content: 'Rashmi Borah commented on your post: "Incredible work, Pranab Da! This is a beautiful tribute."',
        userId: user1.id,
        senderId: user2.id,
        isRead: false
      },
      {
        type: 'FOLLOW',
        content: 'Jitu Kalita started following you.',
        userId: user1.id,
        senderId: user3.id,
        isRead: true
      },
      {
        type: 'APPROVAL',
        content: 'Your plantation record of 80 trees at Teok High School has been approved! Total Trees counter updated.',
        userId: user2.id,
        isRead: false
      }
    ]
  });

  console.log('Seeding admin logs...');
  await prisma.adminLog.createMany({
    data: [
      {
        action: 'APPROVE_RECORD',
        details: 'Approved plantation record of 25 trees submitted by Pranab Deka.',
        adminId: admin.id
      },
      {
        action: 'APPROVE_RECORD',
        details: 'Approved plantation record of 80 trees submitted by Rashmi Borah.',
        adminId: admin.id
      },
      {
        action: 'CREATE_SYSTEM_ANNOUNCEMENT',
        details: 'Updated live target configuration rules.',
        adminId: admin.id
      }
    ]
  });

  console.log('Seeding songs...');
  await prisma.song.createMany({
    data: [
      {
        title: 'Maya',
        artist: 'Zubeen Garg',
        album: 'Maya',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200',
        duration: 372
      },
      {
        title: 'Ya Ali',
        artist: 'Zubeen Garg',
        album: 'Gangster',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200',
        duration: 298
      },
      {
        title: 'Mon Moina',
        artist: 'Zubeen Garg',
        album: 'Mon Moina',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=200',
        duration: 320
      },
      {
        title: 'Nahor',
        artist: 'Zubeen Garg',
        album: 'Nahor',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=200',
        duration: 280
      }
    ]
  });

  console.log('Seeding timeline milestones...');
  await prisma.timelineMilestone.createMany({
    data: [
      {
        year: '2024',
        title: 'Initiative Launch',
        description: 'Zubeen Garg announces the "One Tree, One Memory" movement at a concert in Guwahati, encouraging fans to plant a sapling on their birthdays.',
      },
      {
        year: '2025',
        title: '500 Saplings in Koliabor',
        description: 'Fans gather in Nagaon district to plant 500 indigenous saplings, designating the area as the first official Zubeen Garg Forest.',
      },
      {
        year: '2025',
        title: 'District Expansion',
        description: 'The movement spreads to Upper Assam. Jorhat, Dibrugarh, and Sivasagar log 1,200+ trees through community schools and local youth groups.',
      },
      {
        year: '2026',
        title: 'Zubeen Nahor Platform Launch',
        description: 'The social media tracking platform is launched to digitize records, verify entries, and visualize tree plantation across Assam.',
      },
    ]
  });

  console.log('Seeding song quotes...');
  await prisma.songQuote.createMany({
    data: [
      {
        title: 'Mayabini',
        lyric: '"মায়াবিনী দুচকুতে কাজল সানি ল’লে... নিয়ৰৰে টোপাল উৰি উৰি গুচি গ’লে..."',
        meaning: 'His songs frequently reference dew, rain, and the wind, evoking the rich sensory experience of Assam\'s landscapes.',
      },
      {
        title: 'Pakhi Pakhi Ei Mon',
        lyric: '"পাখি পাখি এই মন আকাশলে উৰি যায়... নতুন কোনো দেশৰ সেউজীয়া ধৰণী বিচাৰি..."',
        meaning: 'Expressing a desire to fly high looking for new green lands, showcasing the deep-seated green consciousness in his poetry.',
      },
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
