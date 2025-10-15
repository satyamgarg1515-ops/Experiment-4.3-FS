const express = require("express");
const app = express();
app.use(express.json());

const PORT = 3000;

const seats = {};
const TOTAL_SEATS = 10;

for (let i = 1; i <= TOTAL_SEATS; i++) {
  seats[i] = { status: "available", lockedBy: null, lockTimer: null };
}

app.get("/seats", (req, res) => {
  res.json(seats);
});

app.post("/lock", (req, res) => {
  const { seatId, userId } = req.body;
  const seat = seats[seatId];
  if (!seat) return res.status(404).json({ message: "Seat does not exist." });
  if (seat.status === "booked") return res.status(400).json({ message: "Seat already booked." });
  if (seat.status === "locked") return res.status(400).json({ message: "Seat is locked by another user." });
  seat.status = "locked";
  seat.lockedBy = userId;
  seat.lockTimer = setTimeout(() => {
    seat.status = "available";
    seat.lockedBy = null;
    seat.lockTimer = null;
  }, 60000);
  res.json({ message: `Seat ${seatId} locked for user ${userId}. You have 1 minute to confirm.` });
});

app.post("/confirm", (req, res) => {
  const { seatId, userId } = req.body;
  const seat = seats[seatId];
  if (!seat) return res.status(404).json({ message: "Seat does not exist." });
  if (seat.status !== "locked") return res.status(400).json({ message: "Seat is not locked." });
  if (seat.lockedBy !== userId) return res.status(403).json({ message: "You do not hold the lock on this seat." });
  seat.status = "booked";
  seat.lockedBy = null;
  clearTimeout(seat.lockTimer);
  seat.lockTimer = null;
  res.json({ message: `Seat ${seatId} successfully booked by user ${userId}.` });
});

app.post("/release", (req, res) => {
  const { seatId, userId } = req.body;
  const seat = seats[seatId];
  if (!seat) return res.status(404).json({ message: "Seat does not exist." });
  if (seat.status !== "locked") return res.status(400).json({ message: "Seat is not locked." });
  if (seat.lockedBy !== userId) return res.status(403).json({ message: "You do not hold the lock on this seat." });
  seat.status = "available";
  seat.lockedBy = null;
  clearTimeout(seat.lockTimer);
  seat.lockTimer = null;
  res.json({ message: `Seat ${seatId} lock released by user ${userId}.` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));