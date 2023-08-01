import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

type CorrectProperties = {
  name: boolean;
  artists: boolean;
  yearOfPublish: boolean;
  album: boolean;
  location: boolean;
};

export const songRouter = createTRPCRouter({
  getSongFieldsForDay: publicProcedure
    .input(z.date())
    .query(async ({ input, ctx }) => {
      // check if date is after 01.08.2023
      const dateAfter = new Date("2023-08-01");

      if (input < dateAfter) {
        return {
          error: "Date is before 01.08.2023",
        };
      }

      const currentServerDate = new Date(new Date().toDateString());
      currentServerDate.setDate(currentServerDate.getDate() + 1);

      if (input > currentServerDate) {
        return {
          error: "Date is in the future",
        };
      }

      // chose random song based on today date
      const songs = await ctx.prisma.song.findMany();

      const song =
        songs[
          (input.getFullYear() * input.getDate() * (input.getMonth() + 1)) %
            songs.length
        ];

      // return number of properties in song
      return {
        location: song?.location.length,
        artist: song?.artists.length,
        name: 1,
        yearOfPublish: 1,
        album: song?.album ? 1 : 0,
      };
    }),
  addSong: publicProcedure
    .meta({ openapi: { method: "POST", path: "/addSong" } })
    .input(
      z.object({
        name: z.string(),
        artists: z.array(z.string()),
        videoId: z.string(),
        yearOfPublish: z.number(),
        album: z.optional(z.string()),
        location: z.array(z.string()),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.req?.headers.authorization !== process.env.SECRET_KEY) {
        return {
          success: false,
          message: "Not authorized",
        };
      }

      await ctx.prisma.song.create({
        data: {
          name: input.name,
          artists: input.artists,
          videoId: input.videoId,
          yearOfPublish: input.yearOfPublish,
          album: input.album ?? "",
          location: input.location,
        },
      });

      return {
        success: true,
        message: "Song added successfully",
      };
    }),
  checkForCorrectInput: publicProcedure
    .input(
      z.object({
        name: z.string(),
        artists: z.array(z.string()),
        yearOfPublish: z.number(),
        album: z.optional(z.string()),
        location: z.array(z.string()),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.optional(z.object({
          name: z.boolean(),
          artists: z.boolean(),
          yearOfPublish: z.boolean(),
          album: z.boolean(),
          location: z.boolean(),
        })),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const songs = await ctx.prisma.song.findMany();

      // make the input and the song properties lowercase and make sure to handle the case where the input is an array and the element might be shuffled
      const inputName = input.name.toLowerCase();
      const inputArtists = input.artists
        .map((artist) => artist.toLowerCase())
        .sort();
      const inputYearOfPublish = input.yearOfPublish;
      const inputAlbum = input.album?.toLowerCase();
      const inputLocation = input.location
        .map((location) => location.toLowerCase())
        .sort();

      // need to return the properties of the song that are correct, event if not all are corrent and if all properties are correct, then return videoId
      const correctSong = songs.find((song) => {
        const songName = song.name.toLowerCase();
        const songArtists = song.artists
          .map((artist) => artist.toLowerCase())
          .sort();
        const songYearOfPublish = song.yearOfPublish;
        const songAlbum = song.album?.toLowerCase();
        const songLocation = song.location
          .map((location) => location.toLowerCase())
          .sort();

        if (
          songName === inputName &&
          songArtists === inputArtists &&
          songYearOfPublish === inputYearOfPublish &&
          songAlbum === inputAlbum &&
          songLocation === inputLocation
        ) {
          return true;
        }

        return false;
      });

      if (correctSong) {
        return {
          success: true,
        };
      }

      // if no song is correct, return the properties that are correct
      const correctProperties = {
        name: false,
        artists: false,
        yearOfPublish: false,
        album: false,
        location: false,
      };

      songs.forEach((song) => {
        const songName = song.name.toLowerCase();
        const songArtists = song.artists
          .map((artist) => artist.toLowerCase())
          .sort();
        const songYearOfPublish = song.yearOfPublish;
        const songAlbum = song.album?.toLowerCase();
        const songLocation = song.location
          .map((location) => location.toLowerCase())
          .sort();

        if (songName === inputName) {
          correctProperties.name = true;
        }

        // return true even if not all elements are correct
        if (songArtists.every((artist) => inputArtists.includes(artist))) {
          correctProperties.artists = true;
        }

        if (songYearOfPublish === inputYearOfPublish) {
          correctProperties.yearOfPublish = true;
        }

        if (songAlbum === inputAlbum) {
          correctProperties.album = true;
        }

        // return true even if not all elements are correct
        if (
          songLocation.every((location) => inputLocation.includes(location))
        ) {
          correctProperties.location = true;
        }
      });

      return {
        success: false,
        message: correctProperties,
      };
    }),
});
