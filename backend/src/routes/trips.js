const express = require("express");
const router = express.Router();

const tripController = require("../controllers/tripController");

router.post("/", tripController.createTrip);
router.get("/", tripController.getTrips);
router.patch("/:id", tripController.updateTripStatus);
router.delete("/:id", tripController.deleteTrip);

module.exports = router;
