const axios = require("axios");

// Simple test script to verify batch endpoints are working
const BASE_URL = "http://localhost:5000/api";

async function testBatchEndpoints() {
  try {
    console.log("Testing batch endpoints...");

    // Test batch-add books endpoint
    const booksResponse = await axios.post(
      `${BASE_URL}/books/batch-add`,
      {
        books: [
          {
            title: "Test Book 1",
            author: "Test Author 1",
            genres: ["Fiction"],
            status: "will read",
          },
        ],
      },
      {
        headers: {
          Authorization: "Bearer test-token", // This will fail auth, but we can see if endpoint exists
        },
      }
    );

    console.log("Books batch endpoint exists");
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("✓ Books batch endpoint exists (authentication required)");
    } else if (error.response && error.response.status === 404) {
      console.log("✗ Books batch endpoint not found");
    } else {
      console.log("Books batch endpoint error:", error.message);
    }
  }

  try {
    // Test batch-add movies endpoint
    const moviesResponse = await axios.post(
      `${BASE_URL}/movies/batch-add`,
      {
        movies: [
          {
            title: "Test Movie 1",
            director: "Test Director 1",
            industry: "Hollywood",
            genres: ["Drama"],
            status: "to watch",
          },
        ],
      },
      {
        headers: {
          Authorization: "Bearer test-token",
        },
      }
    );

    console.log("Movies batch endpoint exists");
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("✓ Movies batch endpoint exists (authentication required)");
    } else if (error.response && error.response.status === 404) {
      console.log("✗ Movies batch endpoint not found");
    } else {
      console.log("Movies batch endpoint error:", error.message);
    }
  }

  try {
    // Test check-duplicates books endpoint
    await axios.post(
      `${BASE_URL}/books/check-duplicates`,
      {
        books: [
          {
            title: "Test Book 1",
            author: "Test Author 1",
            genres: ["Fiction"],
            status: "will read",
          },
        ],
      },
      {
        headers: {
          Authorization: "Bearer test-token",
        },
      }
    );
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log(
        "✓ Books duplicate check endpoint exists (authentication required)"
      );
    } else if (error.response && error.response.status === 404) {
      console.log("✗ Books duplicate check endpoint not found");
    } else {
      console.log("Books duplicate check endpoint error:", error.message);
    }
  }

  try {
    // Test check-duplicates movies endpoint
    await axios.post(
      `${BASE_URL}/movies/check-duplicates`,
      {
        movies: [
          {
            title: "Test Movie 1",
            director: "Test Director 1",
            industry: "Hollywood",
            genres: ["Drama"],
            status: "to watch",
          },
        ],
      },
      {
        headers: {
          Authorization: "Bearer test-token",
        },
      }
    );
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log(
        "✓ Movies duplicate check endpoint exists (authentication required)"
      );
    } else if (error.response && error.response.status === 404) {
      console.log("✗ Movies duplicate check endpoint not found");
    } else {
      console.log("Movies duplicate check endpoint error:", error.message);
    }
  }
}

testBatchEndpoints().catch(console.error);
