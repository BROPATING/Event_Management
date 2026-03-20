SELECT COUNT(DISTINCT b.userId) AS uniqueAttendees
FROM booking b
INNER JOIN tier t  ON t.id = b.tierId
INNER JOIN event e ON e.id = t.eventId
WHERE b.status = 'active'
  AND e.organizerId = 14

