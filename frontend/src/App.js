import { useEffect, useState } from "react";
import { Container, Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndScrape = async () => {
      try {
        await fetch("/scrape"); // Triggers backend scraper
        const res = await fetch("/jobs"); // Fetch from DB
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndScrape();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Netflix Careers</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {jobs.length === 0 ? (
            <Typography>No jobs found.</Typography>
          ) : (
            jobs.map((job, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6">{job.title}</Typography>
                    <Typography color="text.secondary">{job.location}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
}

export default App;
