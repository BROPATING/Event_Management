SELECT 
  e.id                                                          AS eventId,
  e.title                                                       AS title,
  SUM(t.totalCapacity)                                          AS totalSeats,
  SUM(t.totalCapacity - t.availableSeats)                       AS soldSeats,
  ROUND(
    (SUM(t.totalCapacity - t.availableSeats) * 100.0 
    / SUM(t.totalCapacity)), 
  2)                                                            AS percentSold
FROM event e
INNER JOIN tier t ON t.eventId = e.id
WHERE e.startDate >= date('now')
  AND e.startDate <= date('now', '+30 days')
  AND e.status = 'published'
GROUP BY e.id