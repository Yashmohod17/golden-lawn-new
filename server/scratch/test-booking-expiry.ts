import { bookingRepository } from '../src/repositories/booking.repository';
import { bookingService } from '../src/services/booking.service';
import prisma from '../src/config/database';

async function runTest() {
  console.log('--- STARTING BOOKING SLOT & AUTO-EXPIRATION FLOW TEST ---');
  
  const testDate = '2029-06-25';
  
  // 1. Cleanup existing records for our test date to start fresh
  console.log(`Cleaning up existing records for test date: ${testDate}...`);
  await prisma.availabilityDate.deleteMany({ where: { date: testDate } });
  await prisma.booking.deleteMany({ where: { date: testDate } });

  // 2. Create a temporary booking slot
  console.log('Creating a new temporary reservation...');
  const newBookingInput = {
    name: 'Auto Expire Test User',
    email: 'expiretest@example.com',
    phone: '+91 99999 88888',
    eventType: 'Birthday Party',
    date: testDate,
    guests: 200,
    package: 'Silver Package',
    cost: 120000,
    notes: 'Testing slot block and 15-minute checkout hold logic.'
  };

  const booking = await bookingRepository.create(newBookingInput);
  console.log(`Booking successfully created! ID: ${booking.id}, Status: ${booking.status}`);
  
  // Verify expiresAt is set to ~15 minutes in the future
  const timeDiffMins = (booking.expiresAt!.getTime() - booking.reservedAt!.getTime()) / (1000 * 60);
  console.log(`Reservation expiresAt diff minutes: ${timeDiffMins.toFixed(2)} mins (expected: ~15.00)`);
  
  if (booking.status !== 'TEMP_RESERVED') {
    throw new Error(`Expected status to be TEMP_RESERVED, but got: ${booking.status}`);
  }
  
  if (Math.abs(timeDiffMins - 15) > 1) {
    throw new Error(`Expected initial expiration to be ~15 mins, got: ${timeDiffMins.toFixed(2)}`);
  }

  // 3. Simulate payment to verify extension to 48 hours
  console.log('Simulating payment of ₹500 fee...');
  const paidBooking = await bookingService.payReservation(booking.id, 500);
  const paidDiffHours = (paidBooking.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60);
  console.log(`Extended expiresAt diff hours: ${paidDiffHours.toFixed(2)} hours (expected: ~48.00)`);

  if (Math.abs(paidDiffHours - 48) > 1) {
    throw new Error(`Expected extended expiration to be ~48 hours, got: ${paidDiffHours.toFixed(2)} hours`);
  }

  // The availability block is already created/upserted by the payReservation call above.

  // Verify calendar block exists
  const blockBefore = await prisma.availabilityDate.findUnique({ where: { date: testDate } });
  console.log(`Calendar block before expiry check: ${blockBefore ? 'BLOCKED (' + blockBefore.status + ')' : 'NOT FOUND'}`);
  if (!blockBefore) {
    throw new Error('Expected calendar block to be present.');
  }

  // 4. Artificially backdate the expiresAt to 1 hour in the past to simulate a timeout
  console.log('Backdating expiresAt to simulate 48-hour timeout...');
  const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
  await prisma.booking.update({
    where: { id: booking.id },
    data: { expiresAt: pastDate }
  });

  // 5. Run the auto-expiration processing service
  console.log('Running processExpiredReservations background worker...');
  await bookingService.processExpiredReservations();

  // 6. Verify the updates occurred correctly
  const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
  console.log(`Booking status after expiration check: ${updatedBooking?.status} (expected: EXPIRED)`);
  if (updatedBooking?.status !== 'EXPIRED') {
    throw new Error(`Expected booking status to change to EXPIRED, got: ${updatedBooking?.status}`);
  }

  // Verify calendar block was removed
  const blockAfter = await prisma.availabilityDate.findUnique({ where: { date: testDate } });
  console.log(`Calendar block after expiration check: ${blockAfter ? 'STILL BLOCKED (' + blockAfter.status + ')' : 'RELEASED (SUCCESS)'}`);
  if (blockAfter) {
    throw new Error('Expected calendar block to be released/deleted.');
  }

  console.log('--- TEST PASSED SUCCESSFULLY! BOTH RESERVING AND RELEASE WORKFLOWS ARE PERFECTLY CORRECT ---');
}

runTest()
  .catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
