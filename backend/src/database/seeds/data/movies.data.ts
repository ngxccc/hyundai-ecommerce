import type { NewMovie, NewMovieTranslation } from "@/database/schemas";

export type SeedMovieTranslation = Pick<
  NewMovieTranslation,
  "languageCode" | "title" | "description"
>;

export type SeedMovieData = Omit<
  NewMovie,
  "id" | "createdAt" | "updatedAt" | "tmdbId"
> & {
  tmdbId: string;
  genres: string[];
  translations: SeedMovieTranslation[];
};

/**
 * Authentic bilingual movie catalog fixtures with localized metadata.
 */
export const SEED_MOVIES_DATA: SeedMovieData[] = [
  {
    tmdbId: "tmdb-693134",
    imdbId: "tt15239678",
    durationMinutes: 166,
    releaseDate: "2024-03-01",
    posterUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    rating: "PG_13",
    genres: ["Science Fiction", "Adventure", "Action"],
    translations: [
      {
        languageCode: "vi",
        title: "Dune: Hành Tinh Cát - Phần Hai",
        description:
          "Paul Atreides hợp lực cùng Chani và người Fremen trên con đường tìm kiếm sự báo thù chống lại những kẻ đã hủy hoại gia tộc mình.",
      },
      {
        languageCode: "en",
        title: "Dune: Part Two",
        description:
          "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      },
    ],
  },
  {
    tmdbId: "tmdb-872585",
    imdbId: "tt15398776",
    durationMinutes: 180,
    releaseDate: "2023-07-21",
    posterUrl:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    rating: "R",
    genres: ["Drama", "History"],
    translations: [
      {
        languageCode: "vi",
        title: "Oppenheimer",
        description:
          "Câu chuyện lịch sử về nhà vật lý lý thuyết J. Robert Oppenheimer, người lãnh đạo Dự án Manhattan phát triển vũ khí hạt nhân đầu tiên.",
      },
      {
        languageCode: "en",
        title: "Oppenheimer",
        description:
          "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
      },
    ],
  },
  {
    tmdbId: "tmdb-533535",
    imdbId: "tt6263850",
    durationMinutes: 128,
    releaseDate: "2024-07-26",
    posterUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk",
    rating: "R",
    genres: ["Action", "Comedy", "Science Fiction"],
    translations: [
      {
        languageCode: "vi",
        title: "Deadpool & Wolverine",
        description:
          "Wade Wilson vô tình bị kéo vào nhiệm vụ giải cứu đa vũ trụ cùng với một biến thể Wolverine mang đầy tổn thương.",
      },
      {
        languageCode: "en",
        title: "Deadpool & Wolverine",
        description:
          "A listless Wade Wilson toils in civilian life until a threat to his home universe leads him to team up with a reluctant Wolverine.",
      },
    ],
  },
  {
    tmdbId: "tmdb-1022789",
    imdbId: "tt22022452",
    durationMinutes: 96,
    releaseDate: "2024-06-14",
    posterUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=LEjhY15eCx0",
    rating: "PG",
    genres: ["Animation", "Family", "Comedy"],
    translations: [
      {
        languageCode: "vi",
        title: "Những Mảnh Ghép Cảm Xúc 2",
        description:
          "Riley bước vào tuổi dậy thì với sự xuất hiện của những cảm xúc mới tinh vi như Lo Âu, Ganh Tị, Xấu Hổ và Chán Nản.",
      },
      {
        languageCode: "en",
        title: "Inside Out 2",
        description:
          "Teenager Riley's mind undergoes a sudden demolition to make room for brand new Emotions including Anxiety, Envy, and Ennui.",
      },
    ],
  },
];
