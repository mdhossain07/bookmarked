import request from "supertest";
import express from "express";
import { BookModel } from "../models/Book";
import { UserModel } from "../models/User";
import bookRoutes from "../routes/book.routes";
import { authenticate } from "../middleware/auth.middleware";
import { errorHandler } from "../middleware/error.middleware";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use("/api/books", bookRoutes);
app.use(errorHandler);

describe("Batch Books API", () => {
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

  describe("POST /api/books/batch-add", () => {
    it("should successfully add multiple books", async () => {
      const booksData = [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          genres: ["Fiction", "Classic"],
          status: "will read",
        },
        {
          title: "1984",
          author: "George Orwell",
          genres: ["Fiction", "Dystopian"],
          status: "will read",
        },
      ];

      const response = await request(app)
        .post("/api/books/batch-add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ books: booksData })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.added).toBe(2);
      expect(response.body.data.failed).toBe(0);
      expect(response.body.data.duplicates).toBe(0);
      expect(response.body.data.books).toHaveLength(2);

      // Verify books were actually created in database
      const booksInDb = await BookModel.find({ userId });
      expect(booksInDb).toHaveLength(2);
    });

    it("should detect and skip duplicate books", async () => {
      // First, create a book
      await new BookModel({
        userId,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genres: ["Fiction"],
        status: "will read",
      }).save();

      const booksData = [
        {
          title: "The Great Gatsby", // Duplicate
          author: "F. Scott Fitzgerald",
          genres: ["Fiction", "Classic"],
          status: "will read",
        },
        {
          title: "1984",
          author: "George Orwell",
          genres: ["Fiction", "Dystopian"],
          status: "will read",
        },
      ];

      const response = await request(app)
        .post("/api/books/batch-add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ books: booksData })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.added).toBe(1);
      expect(response.body.data.failed).toBe(0);
      expect(response.body.data.duplicates).toBe(1);
      expect(response.body.data.errors).toContain(
        'Duplicate book: "The Great Gatsby" by F. Scott Fitzgerald'
      );

      // Verify only one new book was added
      const booksInDb = await BookModel.find({ userId });
      expect(booksInDb).toHaveLength(2); // 1 existing + 1 new
    });

    it("should handle validation errors gracefully", async () => {
      const booksData = [
        {
          title: "", // Invalid: empty title
          author: "F. Scott Fitzgerald",
          genres: ["Fiction"],
          status: "will read",
        },
        {
          title: "1984",
          author: "George Orwell",
          genres: [], // Invalid: empty genres array
          status: "will read",
        },
      ];

      const response = await request(app)
        .post("/api/books/batch-add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ books: booksData })
        .expect(400); // Should fail validation

      expect(response.body.success).toBe(false);
    });

    it("should require authentication", async () => {
      const booksData = [
        {
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction"],
          status: "will read",
        },
      ];

      await request(app)
        .post("/api/books/batch-add")
        .send({ books: booksData })
        .expect(401);
    });

    it("should enforce batch size limits", async () => {
      // Create more than 50 books (the limit)
      const booksData = Array.from({ length: 51 }, (_, i) => ({
        title: `Book ${i + 1}`,
        author: `Author ${i + 1}`,
        genres: ["Fiction"],
        status: "will read" as const,
      }));

      const response = await request(app)
        .post("/api/books/batch-add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ books: booksData })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/books/check-duplicates", () => {
    beforeEach(async () => {
      // Create some existing books
      await BookModel.create([
        {
          userId,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          genres: ["Fiction"],
          status: "will read",
        },
        {
          userId,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          genres: ["Fiction"],
          status: "read",
        },
      ]);
    });

    it("should identify duplicate books", async () => {
      const booksData = [
        {
          title: "The Great Gatsby", // Duplicate
          author: "F. Scott Fitzgerald",
          genres: ["Fiction"],
          status: "will read",
        },
        {
          title: "1984", // Not duplicate
          author: "George Orwell",
          genres: ["Fiction"],
          status: "will read",
        },
        {
          title: "To Kill a Mockingbird", // Duplicate
          author: "Harper Lee",
          genres: ["Fiction"],
          status: "will read",
        },
      ];

      const response = await request(app)
        .post("/api/books/check-duplicates")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ books: booksData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
      expect(response.body.data.duplicates).toContain(
        '"The Great Gatsby" by F. Scott Fitzgerald'
      );
      expect(response.body.data.duplicates).toContain(
        '"To Kill a Mockingbird" by Harper Lee'
      );
    });

    it("should return empty array when no duplicates found", async () => {
      const booksData = [
        {
          title: "1984",
          author: "George Orwell",
          genres: ["Fiction"],
          status: "will read",
        },
        {
          title: "Brave New World",
          author: "Aldous Huxley",
          genres: ["Fiction"],
          status: "will read",
        },
      ];

      const response = await request(app)
        .post("/api/books/check-duplicates")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ books: booksData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(0);
      expect(response.body.data.duplicates).toEqual([]);
    });

    it("should handle case-insensitive duplicate detection", async () => {
      const booksData = [
        {
          title: "the great gatsby", // Different case
          author: "f. scott fitzgerald", // Different case
          genres: ["Fiction"],
          status: "will read",
        },
      ];

      const response = await request(app)
        .post("/api/books/check-duplicates")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ books: booksData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.duplicates).toContain(
        '"the great gatsby" by f. scott fitzgerald'
      );
    });

    it("should require authentication", async () => {
      const booksData = [
        {
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction"],
          status: "will read",
        },
      ];

      await request(app)
        .post("/api/books/check-duplicates")
        .send({ books: booksData })
        .expect(401);
    });
  });
});
