SELECT 
  e.id                    AS eventId,
  e.title                 AS title,
  SUM(t.availableSeats)   AS totalSeatsRemaining
FROM event e
INNER JOIN tier t ON t.eventId = e.id
GROUP BY e.id
HAVING SUM(t.availableSeats) < 10