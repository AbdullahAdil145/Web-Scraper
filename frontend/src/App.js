import { useEffect, useState, useRef, useCallback } from "react";
import {
  Container, Grid, Card, CardContent, Typography, CircularProgress,
  CardActionArea, FormControl, InputLabel, Select, MenuItem, Box
} from "@mui/material";

const PAGE_SIZE = 9;

function App() {
  const [jobs, setJobs] = useState([]);
  const [visibleJobs, setVisibleJobs] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef(null);

  // 👇 Call only once on mount
  const scrapeAndFetch = async () => {
    try {
      setLoading(true);
      await fetch("/scrape");
      const res = await fetch("/jobs");
      const data = await res.json();
      setJobs(data);
      setVisibleJobs(data.slice(0, PAGE_SIZE));
      setPage(1);
      setLocations(Array.from(new Set(data.map(j => j.location))).sort());
    } catch (e) {
      console.error("Initial scrape/fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  // 👇 Call on location change
  const fetchFilteredJobs = async (location = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/jobs${location ? `?location=${encodeURIComponent(location)}` : ""}`);
      const data = await res.json();
      setJobs(data);
      setVisibleJobs(data.slice(0, PAGE_SIZE));
      setPage(1);
    } catch (e) {
      console.error("Filter fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrapeAndFetch();
  }, []);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setVisibleJobs(jobs.slice(0, nextPage * PAGE_SIZE));
    setPage(nextPage);
  }, [page, jobs]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && visibleJobs.length < jobs.length) {
        loadMore();
      }
    }, { threshold: 1.0 });

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadMore, visibleJobs, jobs]);

  const handleLocationChange = (e) => {
    const selected = e.target.value;
    setLocationFilter(selected);
    fetchFilteredJobs(selected);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Rippling Engineering Jobs</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Total Jobs: {jobs.length}
      </Typography>

      <Box sx={{ maxWidth: 300, mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Filter by location</InputLabel>
          <Select
            value={locationFilter}
            label="Filter by location"
            onChange={handleLocationChange}
          >
            <MenuItem value="">All Locations</MenuItem>
            {locations.map((loc, idx) => (
              <MenuItem key={idx} value={loc}>{loc}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {visibleJobs.length === 0 ? (
            <Typography>No jobs found.</Typography>
          ) : (
            visibleJobs.map((job, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ height: '100%' }}>
                  <CardActionArea
                    component="a"
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CardContent>
                      <Typography variant="h6">{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.location}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          )}
          <div ref={observerRef} style={{ height: 1 }} />
        </Grid>
      )}
    </Container>
  );
}

export default App;
