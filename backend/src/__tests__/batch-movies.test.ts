import request from "supertest";
import express from "express";
import { MovieModel } from "../models/Movie";
import { UserModel } from "../models/User";
import movieRoutes from "../routes/movie.routes";
import { authenticate } from "../middleware/auth.middleware";
import { errorHandler } from "../middleware/error.middleware";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use("/api/movies", movieRoutes);
app.use(errorHandler);

describe("Batch Movies API", () => {
  let userId: string;
  let authToken: string;

  beforeEach(async () => {
    // Create a test user
    const user = new UserModel({
      email: "test@example.com",
      password: "hashedpassword",
      name: "Test User",
    });
    await user.save();
    userId = user._id.toString();

    // Create auth token
    authToken = jwt.sign(
      { userId, email: user.email },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" }
    );
  });

  describe("POST /api/movies/batch-add", () => {
    it("should successfully add multiple movies", async () => {
      const moviesData = [
        {
          title: "The Shawshank Redemption",
          director: "Frank Darabont",
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
        {
          title: "The Godfather",
          director: "Francis Ford Coppola",
          industry: "Hollywood",
          genres: ["Crime", "Drama"],
          status: "to watch",
        },
      ];

      const response = await request(app)
        .post("/api/movies/batch-add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ movies: moviesData })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.added).toBe(2);
      expect(response.body.data.failed).toBe(0);
      expect(response.body.data.duplicates).toBe(0);
      expect(response.body.data.movies).toHaveLength(2);

      // Verify movies were actually created in database
      const moviesInDb = await MovieModel.find({ userId });
      expect(moviesInDb).toHaveLength(2);
    });

    it("should detect and skip duplicate movies", async () => {
      // First, create a movie
      await new MovieModel({
        userId,
        title: "The Shawshank Redemption",
        director: "Frank Darabont",
        industry: "Hollywood",
        genres: ["Drama"],
        status: "to watch",
      }).save();

      const moviesData = [
        {
          title: "The Shawshank Redemption", // Duplicate
          director: "Frank Darabont",
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
        {
          title: "The Godfather",
          director: "Francis Ford Coppola",
          industry: "Hollywood",
          genres: ["Crime", "Drama"],
          status: "to watch",
        },
      ];

      const response = await request(app)
        .post("/api/movies/batch-add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ movies: moviesData })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.added).toBe(1);
      expect(response.body.data.failed).toBe(0);
      expect(response.body.data.duplicates).toBe(1);
      expect(response.body.data.errors).toContain(
        'Duplicate movie: "The Shawshank Redemption" by Frank Darabont'
      );

      // Verify only one new movie was added
      const moviesInDb = await MovieModel.find({ userId });
      expect(moviesInDb).toHaveLength(2); // 1 existing + 1 new
    });

    it("should handle validation errors gracefully", async () => {
      const moviesData = [
        {
          title: "", // Invalid: empty title
          director: "Frank Darabont",
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
        {
          title: "The Godfather",
          director: "Francis Ford Coppola",
          industry: "InvalidIndustry", // Invalid industry
          genres: ["Crime"],
          status: "to watch",
        },
      ];

      const response = await request(app)
        .post("/api/movies/batch-add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ movies: moviesData })
        .expect(400); // Should fail validation

      expect(response.body.success).toBe(false);
    });

    it("should require authentication", async () => {
      const moviesData = [
        {
          title: "Test Movie",
          director: "Test Director",
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
      ];

      await request(app)
        .post("/api/movies/batch-add")
        .send({ movies: moviesData })
        .expect(401);
    });

    it("should enforce batch size limits", async () => {
      // Create more than 50 movies (the limit)
      const moviesData = Array.from({ length: 51 }, (_, i) => ({
        title: `Movie ${i + 1}`,
        director: `Director ${i + 1}`,
        industry: "Hollywood" as const,
        genres: ["Drama"],
        status: "to watch" as const,
      }));

      const response = await request(app)
        .post("/api/movies/batch-add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ movies: moviesData })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should handle movies without directors", async () => {
      const moviesData = [
        {
          title: "Unknown Director Movie",
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
      ];

      const response = await request(app)
        .post("/api/movies/batch-add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ movies: moviesData })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.added).toBe(1);
      expect(response.body.data.movies[0].director).toBeUndefined();
    });
  });

  describe("POST /api/movies/check-duplicates", () => {
    beforeEach(async () => {
      // Create some existing movies
      await MovieModel.create([
        {
          userId,
          title: "The Shawshank Redemption",
          director: "Frank Darabont",
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
        {
          userId,
          title: "The Godfather",
          director: "Francis Ford Coppola",
          industry: "Hollywood",
          genres: ["Crime", "Drama"],
          status: "watched",
        },
      ]);
    });

    it("should identify duplicate movies", async () => {
      const moviesData = [
        {
          title: "The Shawshank Redemption", // Duplicate
          director: "Frank Darabont",
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
        {
          title: "Pulp Fiction", // Not duplicate
          director: "Quentin Tarantino",
          industry: "Hollywood",
          genres: ["Crime"],
          status: "to watch",
        },
        {
          title: "The Godfather", // Duplicate
          director: "Francis Ford Coppola",
          industry: "Hollywood",
          genres: ["Crime"],
          status: "to watch",
        },
      ];

      const response = await request(app)
        .post("/api/movies/check-duplicates")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ movies: moviesData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
      expect(response.body.data.duplicates).toContain(
        '"The Shawshank Redemption" by Frank Darabont'
      );
      expect(response.body.data.duplicates).toContain(
        '"The Godfather" by Francis Ford Coppola'
      );
    });

    it("should return empty array when no duplicates found", async () => {
      const moviesData = [
        {
          title: "Pulp Fiction",
          director: "Quentin Tarantino",
          industry: "Hollywood",
          genres: ["Crime"],
          status: "to watch",
        },
        {
          title: "Fight Club",
          director: "David Fincher",
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
      ];

      const response = await request(app)
        .post("/api/movies/check-duplicates")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ movies: moviesData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(0);
      expect(response.body.data.duplicates).toEqual([]);
    });

    it("should handle case-insensitive duplicate detection", async () => {
      const moviesData = [
        {
          title: "the shawshank redemption", // Different case
          director: "frank darabont", // Different case
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
      ];

      const response = await request(app)
        .post("/api/movies/check-duplicates")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ movies: moviesData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.duplicates).toContain(
        '"the shawshank redemption" by frank darabont'
      );
    });

    it("should handle movies without directors in duplicate check", async () => {
      // Create a movie without director
      await new MovieModel({
        userId,
        title: "Unknown Director Movie",
        industry: "Hollywood",
        genres: ["Drama"],
        status: "to watch",
      }).save();

      const moviesData = [
        {
          title: "Unknown Director Movie", // Duplicate (no director)
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
      ];

      const response = await request(app)
        .post("/api/movies/check-duplicates")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ movies: moviesData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.duplicates).toContain(
        '"Unknown Director Movie" by Unknown Director'
      );
    });

    it("should require authentication", async () => {
      const moviesData = [
        {
          title: "Test Movie",
          director: "Test Director",
          industry: "Hollywood",
          genres: ["Drama"],
          status: "to watch",
        },
      ];

      await request(app)
        .post("/api/movies/check-duplicates")
        .send({ movies: moviesData })
        .expect(401);
    });
  });
});
