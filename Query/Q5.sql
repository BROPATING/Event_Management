SELECT 
  e.organizerId,
  COUNT(DISTINCT b.userId) as uniqueAttendees
FROM booking b
JOIN tier t ON t.id = b.tierId
JOIN event e ON e.id = t.eventId
WHERE b.status = 'active'
GROUP BY e.organizerId;