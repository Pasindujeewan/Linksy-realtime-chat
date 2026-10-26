import app from "./app.js";
import connectDB from "./config/db.js";
import { checkS3Connection } from "./config/s3.js";

await checkS3Connection();
await connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
