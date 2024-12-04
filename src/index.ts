import app from "./app";
import 'dotenv/config'

app.listen(process.env.PORT, (err?: string) => {
    if (err) {
        console.error('Failed to start server:', err);
    } else {
        console.log(`Server is running at http://localhost:${process.env.PORT}`);
    }
});