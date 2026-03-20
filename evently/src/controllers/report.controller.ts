/**
 * @file report.controller.ts
 * @description Specialized controller for Business Intelligence (BI) reports and data insights.
 * * CONTEXT:
 * - Uses TypeORM QueryBuilder for complex aggregations and joins.
 * - Targeted Database: SQLite (uses strftime for date manipulations).
 * * KEY REPORTS:
 * - Revenue Tracking (Q1, Q4, Q8, Q9, Q11)
 * - Geographic Insights (Q2, Q6)
 * - Inventory & Capacity (Q5, Q10, Q13)
 * - User Behavior (Q7, Q12)
 * - Performance Trends (Q3, Q11)
 */

import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";

// Q1 — Total revenue in January 2025
export const q1TotalRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AppDataSource.createQueryBuilder()
      .select("SUM(t.price * b.quantity)", "totalRevenue")
      .addSelect("SUM(b.quantity)", "totalTicketsSold")
      .from("booking", "b")
      .innerJoin("tier", "t", "t.id = b.tierId")
      .innerJoin("event", "e", "e.id = t.eventId")
      .where("b.status = 'active'")
      .andWhere("e.startDate >= '2025-01-01'")
      .andWhere("e.startDate < '2025-02-01'")
      .getRawOne();

    /**
     * -- SQL version:
      SELECT 
        SUM(t.price * b.quantity) AS totalRevenue,
        SUM(b.quantity)           AS totalTicketsSold
      FROM booking b
      INNER JOIN tier t  ON t.id = b.tierId
      INNER JOIN event e ON e.id = t.eventId
      WHERE b.status = 'active'
        AND e.startDate >= '2025-01-01'
        AND e.startDate < '2025-02-01' 
      */

    res.json({
      question: "Total revenue from events held in January 2025",
      totalRevenue: result.totalRevenue || 0,
      totalTicketsSold: result.totalTicketsSold || 0,
    });
  } catch (err) {
    next(err);
  }
};

// Q2 — City with highest tickets sold in Q1 2025
export const q2TopCity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AppDataSource.createQueryBuilder()
      .select("e.city", "city")
      .addSelect("SUM(b.quantity)", "totalTicketsSold")
      .from("booking", "b")
      .innerJoin("tier", "t", "t.id = b.tierId")
      .innerJoin("event", "e", "e.id = t.eventId")
      .where("b.status = :status", { status: "active" })
      .andWhere("e.startDate >= :start", { start: "2025-01-01" })
      .andWhere("e.startDate < :end", { end: "2025-04-01" })
      .groupBy("e.city")
      .orderBy("totalTicketsSold", "DESC")
      .limit(1)
      .getRawOne();

    /**
    * -- SQL version:
      SELECT e.city, SUM(b.quantity) as totalTicketsSold
      FROM booking b
      INNER JOIN tier t ON t.id = b.tierId
      INNER JOIN event e ON e.id = t.eventId
      WHERE b.status = 'active'
      GROUP BY e.city
      ORDER BY totalTicketsSold DESC
      LIMIT 1
   */

    res.json({
      question: "City with highest tickets sold in Q1 2025",
      City: result.city || 0,
      totalTicketsSold: result.totalTicketsSold || 0,
    });
  } catch (err) {
    next(err);
  }
};

// Q3 — Top 3 best selling events of all time
export const q3TopEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 3;

    const result = await AppDataSource.createQueryBuilder()
      .select("e.id", "eventId")
      .addSelect("e.title", "title")
      .addSelect("SUM(b.quantity)", "totalTicketsSold")
      .from("booking", "b")
      .innerJoin("tier", "t", "t.id = b.tierId")
      .innerJoin("event", "e", "e.id = t.eventId")
      .where("b.status = :status", { status: "active" })
      .groupBy("e.id")
      .orderBy("totalTicketsSold", "DESC")
      .limit(limit)
      .getRawMany();

    /**
     * -- SQL version:
      SELECT 
        e.id          AS eventId,
        e.title       AS title,
        SUM(b.quantity) AS totalTicketsSold
      FROM booking b
      INNER JOIN tier t  ON t.id = b.tierId
      INNER JOIN event e ON e.id = t.eventId
      WHERE b.status = 'active'
      GROUP BY e.id
      ORDER BY totalTicketsSold DESC
      LIMIT 3
     */

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Q4 — Tickets sold per tier and revenue % for a specific event
export const q4TierBreakdown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.query;

    const result = await AppDataSource.createQueryBuilder()
      .select("t.name", "tierName")
      .addSelect("SUM(b.quantity)", "ticketsSold")
      .addSelect("SUM(t.price * b.quantity)", "tierRevenue")
      .from("booking", "b")
      .innerJoin("tier", "t", "t.id = b.tierId")
      .innerJoin("event", "e", "e.id = t.eventId")
      .where("b.status = :status", { status: "active" })
      .andWhere("e.title = :title", { title: title || "Tech Summit 2025" })
      .groupBy("t.id")
      .getRawMany();
    
    /**
     *  SELECT 
          t.name            AS tierName,
          SUM(b.quantity)   AS ticketsSold,
          SUM(t.price * b.quantity) AS tierRevenue
        FROM booking b
        INNER JOIN tier t  ON t.id = b.tierId
        INNER JOIN event e ON e.id = t.eventId
        WHERE b.status = 'active'
          AND e.title = 'Tech Summit 2025'
        GROUP BY t.id
     */

    // Calculate revenue percentage
    const totalRevenue = result.reduce((sum: number, row: any) => sum + Number(row.tierRevenue), 0);
    const final = result.map((row: any) => ({
      ...row,
      revenuePercent: totalRevenue > 0
        ? ((Number(row.tierRevenue) / totalRevenue) * 100).toFixed(2) + "%"
        : "0%",
    }));

    res.json(final);
  } catch (err) {
    next(err);
  }
};

// Q5 — Events with fewer than 10 seats remaining
export const q5LowSeats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AppDataSource.createQueryBuilder()
      .select("e.id", "eventId")
      .addSelect("e.title", "title")
      .addSelect("SUM(t.availableSeats)", "totalSeatsRemaining")
      .from("event", "e")
      .innerJoin("tier", "t", "t.eventId = e.id")
      .groupBy("e.id")
      .having("SUM(t.availableSeats) < :seats", { seats: 10 })
      .getRawMany();
    /**
     *SELECT 
        e.id                    AS eventId,
        e.title                 AS title,
        SUM(t.availableSeats)   AS totalSeatsRemaining
      FROM event e
      INNER JOIN tier t ON t.eventId = e.id
      GROUP BY e.id
      HAVING SUM(t.availableSeats) < 10
     */
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Q6 — Average ticket price per city for published events
export const q6AvgPriceByCity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AppDataSource.createQueryBuilder()
      .select("e.city", "city")
      .addSelect("AVG(t.price)", "avgTicketPrice")
      .from("tier", "t")
      .innerJoin("event", "e", "e.id = t.eventId")
      .where("e.status = :status", { status: "published" })
      .groupBy("e.city")
      .getRawMany();
    
    /**
     *SELECT 
        e.city          AS city,
        AVG(t.price)    AS avgTicketPrice
      FROM tier t
      INNER JOIN event e ON e.id = t.eventId
      WHERE e.status = 'published'
      GROUP BY e.city
     */

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Q7 — Unique attendees for a specific organizer
export const q7UniqueAttendees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizerId } = req.query;

    const result = await AppDataSource.createQueryBuilder()
      .select("COUNT(DISTINCT b.userId)", "uniqueAttendees")
      .from("booking", "b")
      .innerJoin("tier", "t", "t.id = b.tierId")
      .innerJoin("event", "e", "e.id = t.eventId")
      .where("b.status = :status", { status: "active" })
      .andWhere("e.organizerId = :organizerId", { organizerId })
      .getRawOne();
    
    /**
     * SELECT COUNT(DISTINCT b.userId) AS uniqueAttendees
      FROM booking b
      INNER JOIN tier t  ON t.id = b.tierId
      INNER JOIN event e ON e.id = t.eventId
      WHERE b.status = 'active'
        AND e.organizerId = 14
     */
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Q8 — Cancelled bookings and lost revenue per event
export const q8CancelledBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AppDataSource.createQueryBuilder()
      .select("e.id", "eventId")
      .addSelect("e.title", "title")
      .addSelect("COUNT(b.id)", "cancelledBookings")
      .addSelect("SUM(t.price * b.quantity)", "lostRevenue")
      .from("booking", "b")
      .innerJoin("tier", "t", "t.id = b.tierId")
      .innerJoin("event", "e", "e.id = t.eventId")
      .where("b.status = :status", { status: "cancelled" })
      .groupBy("e.id")
      .getRawMany();
    
    /**
     *SELECT 
        e.id                        AS eventId,
        e.title                     AS title,
        COUNT(b.id)                 AS cancelledBookings,
        SUM(t.price * b.quantity)   AS lostRevenue
      FROM booking b
      INNER JOIN tier t  ON t.id = b.tierId
      INNER JOIN event e ON e.id = t.eventId
      WHERE b.status = 'cancelled'
      GROUP BY e.id
     */

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Q9 — Tier type generating most revenue across all events
export const q9TopTierType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AppDataSource.createQueryBuilder()
      .select("t.name", "tierName")
      .addSelect("SUM(t.price * b.quantity)", "totalRevenue")
      .from("booking", "b")
      .innerJoin("tier", "t", "t.id = b.tierId")
      .where("b.status = :status", { status: "active" })
      .groupBy("t.name")
      .orderBy("totalRevenue", "DESC")
      .getRawMany();

    /**
     *SELECT 
        t.name                      AS tierName,
        SUM(t.price * b.quantity)   AS totalRevenue
      FROM booking b
      INNER JOIN tier t ON t.id = b.tierId
      WHERE b.status = 'active'
      GROUP BY t.name
      ORDER BY totalRevenue DESC
     */
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Q10 — Published events with zero bookings
export const q10NoBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AppDataSource.createQueryBuilder()
      .select("e.id", "eventId")
      .addSelect("e.title", "title")
      .addSelect("e.startDate", "startDate")
      .from("event", "e")
      .leftJoin("tier", "t", "t.eventId = e.id")
      .leftJoin("booking", "b", "b.tierId = t.id AND b.status = 'active'")
      .where("e.status = :status", { status: "published" })
      .groupBy("e.id")
      .having("COUNT(b.id) = 0")
      .orderBy("e.startDate", "ASC")
      .getRawMany();

    /**
     *SELECT 
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
     */
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Q11 — Month over month revenue trend for 2025
export const q11MonthlyRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AppDataSource.createQueryBuilder()
      .select("strftime('%m', e.startDate)", "month")
      .addSelect("SUM(t.price * b.quantity)", "totalRevenue")
      .from("booking", "b")
      .innerJoin("tier", "t", "t.id = b.tierId")
      .innerJoin("event", "e", "e.id = t.eventId")
      .where("b.status = :status", { status: "active" })
      .andWhere("strftime('%Y', e.startDate) = :year", { year: "2025" })
      .groupBy("month")
      .orderBy("month", "ASC")
      .getRawMany();

    /**
     *SELECT 
        strftime('%m', e.startDate)       AS month,
        SUM(t.price * b.quantity)         AS totalRevenue
      FROM booking b
      INNER JOIN tier t  ON t.id = b.tierId
      INNER JOIN event e ON e.id = t.eventId
      WHERE b.status = 'active'
        AND strftime('%Y', e.startDate) = '2025'
      GROUP BY month
      ORDER BY month ASC
     */

    /**
     * strftime('%m')Extract month from date in SQLitestrftime('%Y')
     * Extract year from date in SQLite
     */
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Q12 — User who spent the most money
export const q12TopSpender = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AppDataSource.createQueryBuilder()
      .select("u.id", "userId")
      .addSelect("u.name", "name")
      .addSelect("u.email", "email")
      .addSelect("SUM(t.price * b.quantity)", "totalSpent")
      .from("booking", "b")
      .innerJoin("tier", "t", "t.id = b.tierId")
      .innerJoin("user", "u", "u.id = b.userId")
      .where("b.status = :status", { status: "active" })
      .groupBy("u.id")
      .orderBy("totalSpent", "DESC")
      .limit(1)
      .getRawOne();

    /**
     *SELECT 
        u.id                        AS userId,
        u.name                      AS name,
        u.email                     AS email,
        SUM(t.price * b.quantity)   AS totalSpent
      FROM booking b
      INNER JOIN tier t  ON t.id = b.tierId
      INNER JOIN user u  ON u.id = b.userId
      WHERE b.status = 'active'
      GROUP BY u.id
      ORDER BY totalSpent DESC
      LIMIT 1
     */
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Q13 — Percentage of seats sold for events in next 30 days
export const q13SeatsSoldPercent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AppDataSource.createQueryBuilder()
      .select("e.id", "eventId")
      .addSelect("e.title", "title")
      .addSelect("SUM(t.totalCapacity)", "totalSeats")
      .addSelect("SUM(t.totalCapacity - t.availableSeats)", "soldSeats")
      .addSelect(
        "ROUND((SUM(t.totalCapacity - t.availableSeats) * 100.0 / SUM(t.totalCapacity)), 2)",
        "percentSold"
      )
      .from("event", "e")
      .innerJoin("tier", "t", "t.eventId = e.id")
      .where("e.startDate >= date('now')")
      .andWhere("e.startDate <= date('now', '+30 days')")
      .andWhere("e.status = :status", { status: "published" })
      .groupBy("e.id")
      .getRawMany();

    /**
     *SELECT 
        e.id  AS eventId,
        e.title AS title,
        SUM(t.totalCapacity) AS totalSeats,
        SUM(t.totalCapacity - t.availableSeats)AS soldSeats,
        ROUND(
          (SUM(t.totalCapacity - t.availableSeats) * 100.0 
          / SUM(t.totalCapacity)), 
        2)  AS percentSold
      FROM event e
      INNER JOIN tier t ON t.eventId = e.id
      WHERE e.startDate >= date('now')
        AND e.startDate <= date('now', '+30 days')
        AND e.status = 'published'
      GROUP BY e.id
     */
    res.json(result);
  } catch (err) {
    next(err);
  }
};