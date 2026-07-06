require("dotenv").config();
const mongoose = require("mongoose");

const Ticket = require("./models/Ticket");
const { storeTicket } = require("./services/pineconeService");

async function migrate() {
    try {
        console.log("Connecting to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");

        const tickets = await Ticket.find();

        console.log(`\nFound ${tickets.length} tickets\n`);

        let success = 0;

        for (let i = 0; i < tickets.length; i++) {

            const ticket = tickets[i];

            console.log(
                `Uploading ${i + 1}/${tickets.length} : ${ticket._id}`
            );

            try {

                await storeTicket(ticket);

                console.log("✅ Uploaded\n");

                success++;

            } catch (err) {

                console.log("❌ Failed:", err.message);

            }
        }

        console.log("--------------------------------");
        console.log("Migration Finished");
        console.log(`Uploaded ${success}/${tickets.length} tickets`);
        console.log("--------------------------------");

        process.exit();

    } catch (err) {

        console.error(err);

        process.exit(1);

    }
}

migrate();