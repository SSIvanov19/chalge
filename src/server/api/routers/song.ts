import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
      console.log(song);
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
        date: z.date(),
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
        message: z.optional(
          z.object({
            name: z.string(),
            artists: z.array(z.string()),
            yearOfPublish: z.number(),
            album: z.optional(z.string()),
            location: z.array(z.string()),
            videoId: z.optional(z.string()),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // check if date is after 01.08.2023
      const dateAfter = new Date("2023-08-01");

      if (input.date < dateAfter) {
        return {
          error: "Date is before 01.08.2023",
        };
      }

      const currentServerDate = new Date(new Date().toDateString());
      currentServerDate.setDate(currentServerDate.getDate() + 1);

      if (input.date > currentServerDate) {
        return {
          error: "Date is in the future",
        };
      }

      // chose random song based on today date
      const songs = await ctx.prisma.song.findMany();

      const song =
        songs[
          (input.date.getFullYear() *
            input.date.getDate() *
            (input.date.getMonth() + 1)) %
            songs.length
        ];

      // make the input and the song properties lowercase and make sure to handle the case where the input is an array and the element might be shuffled
      const inputName = input.name.toLowerCase();
      const inputArtists = input.artists
        .map((artist) => artist.toLowerCase())
        .sort();
      const inputYearOfPublish = input.yearOfPublish;
      let inputAlbum = input.album?.toLowerCase();
      let inputLocation = input.location
        .map((location) => location.toLowerCase())
        .sort();

      // need to return the properties of the song that are correct, event if not all are corrent and if all properties are correct, then return videoId
      const correctSong = (() => {
        const songName = song.name.toLowerCase();
        const songArtists = song.artists
          .map((artist) => artist.toLowerCase())
          .sort();
        const songYearOfPublish = song.yearOfPublish;
        const songAlbum = song.album?.toLowerCase();
        const songLocation = song.location
          .map((location) => location.toLowerCase())
          .sort();

        if (song.album === "") {
          inputAlbum = "";
        }

        if (song.location.length === 0) {
          inputLocation = [];
        }

        if (
          songName === inputName &&
          songArtists.toString() === inputArtists.toString() &&
          songYearOfPublish === inputYearOfPublish &&
          songAlbum === inputAlbum &&
          songLocation.toString() === inputLocation.toString()
        ) {
          return song;
        }

        return null;
      })();

      if (correctSong) {
        return {
          success: true,
          message: {
            name: input.name,
            artists: input.artists,
            yearOfPublish: input.yearOfPublish,
            album: input.album,
            location: input.location,
            videoId: correctSong.videoId,
          },
        };
      }
console.log
      // if no song is correct, return a new object with the properties that are correct. If the property is an array, return only the element that are correct
      const correctSongProperties = {
        name: inputName === song.name.toLowerCase() ? input.name : "",
        artists:
          inputArtists ===
          song.artists.map((artist) => artist.toLowerCase()).sort()
            ? input.artists
            : input.artists.filter((artist) =>
                song.artists
                  .map((artist) => artist.toLowerCase())
                  .includes(artist.toLowerCase())
              ),
        yearOfPublish:
          inputYearOfPublish === song.yearOfPublish ? input.yearOfPublish : 0,
        album: inputAlbum === song.album?.toLowerCase() ? input.album : "",
        location:
          inputLocation ===
          song.location.map((location) => location.toLowerCase()).sort()
            ? input.location
            : input.location.filter((location) =>
                song.location
                  .map((location) => location.toLowerCase())
                  .includes(location.toLowerCase())
              ),
        videoId: "",
      };

      return {
        success: false,
        message: correctSongProperties,
      };
    }),
});
