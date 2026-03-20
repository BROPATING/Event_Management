SELECT 
  e.id        AS eventId,
  e.title     AS title,
  e.startDate AS startDate
FROM event e
LEFT JOIN tier t    ON t.eventId = e.id
LEFT JOIN booking b ON b.tierId = t.id AND b.status = 'active'
WHERE e.status = 'published'
GROUP BY e.id
HAVING COUNT(b.id) = 0
ORDER BY e.startDate ASC