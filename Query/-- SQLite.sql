-- SQLite
SELECT 
  u.id,
  u.name,
  u.email,
  SUM(t.price * b.quantity) as totalSpent
FROM booking b
JOIN user u ON u.id = b.userId
JOIN tier t ON t.id = b.tierId
WHERE b.status = 'active'
GROUP BY u.id
ORDER BY totalSpent DESC;
