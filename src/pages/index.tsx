import Head from "next/head";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Navbar from "~/components/navbar";
import { useLocalStorage } from "~/services/localStorageService";
import { api } from "~/utils/api";
import Link from "next/link";

type Song = {
  name: string;
  artists: string[];
  yearOfPublish: number;
  album: string;
  location: string[];
  videoId: string;
};

export default function Home() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const mutation = api.songs.checkForCorrectInput.useMutation();

  const date = new Date();
  date.setSeconds(0, 0);
  const song = api.songs.getSongFieldsForDay.useQuery(date);

  const [valueForDate, setValueForDate] = useState<Song>({
    name: "",
    artists: [],
    yearOfPublish: 0,
    album: "",
    location: [],
    videoId: "",
  } as Song);

  useEffect(() => {
    setValueForDate(valueForDate);
  }, [setValueForDate, valueForDate]);

  const checkForCorrentInput = async () => {
    let artists = [...valueForDate.artists, inputValue];

    if (valueForDate.artists.length == song.data?.artist) {
      artists = valueForDate.artists;
    }

    let location = [...valueForDate.location, inputValue];

    if (valueForDate.location.length == song.data?.location) {
      location = valueForDate.location;
    }

    let album = valueForDate.album == "" ? inputValue : valueForDate.album;

    if (song.data?.album == 0) {
      album = "";
    }

    await mutation.mutateAsync(
      {
        date: date,
        name: valueForDate.name != "" ? valueForDate.name : inputValue,
        artists: artists,
        yearOfPublish:
          valueForDate.yearOfPublish != 0
            ? valueForDate.yearOfPublish
            : parseInt(inputValue) || 0,
        album: album,
        location: location,
      },
      {
        onSuccess: (data) => {
          const response = data.message as Song;

          // compate response with valueForDate if they are the same then consolo.log("You win")
          if (
            response.name == valueForDate.name &&
            response.artists.length == valueForDate.artists.length &&
            response.yearOfPublish == valueForDate.yearOfPublish &&
            response.album == valueForDate.album &&
            response.location.length == valueForDate.location.length
          ) {
            document.getElementById("inputBox")?.classList.add("animate-shake");
            setTimeout(() => {
              document
                .getElementById("inputBox")
                ?.classList.remove("animate-shake");
            }, 1000);
          }

          setValueForDate(response);
        },
      }
    );
  };

  useEffect(() => {
    if (localStorage.getItem("isFirstTimeVisit") === null) {
      setIsInfoModalOpen(true);
      localStorage.setItem("isFirstTimeVisit", "false");
    }

    const valueForDateFromLocalStorage = localStorage.getItem(
      `valueForDate${date.toDateString()}`
    );

    if (valueForDateFromLocalStorage) {
      setValueForDate(JSON.parse(valueForDateFromLocalStorage) as Song);
    }
  }, []);

  useEffect(() => {
    if (
      valueForDate.name == "" &&
      valueForDate.artists.length == 0 &&
      valueForDate.yearOfPublish == 0 &&
      valueForDate.album == "" &&
      valueForDate.location.length == 0 &&
      valueForDate.videoId == ""
    ) {
      return;
    }

    localStorage.setItem(
      `valueForDate${date.toDateString()}`,
      JSON.stringify(valueForDate)
    );
  }, [valueForDate]);

  return (
    <>
      <Transition appear show={isInfoModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setIsInfoModalOpen(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Как да играем?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Всеки ден трябва да познаеш нова чалга песен. За целта
                      трябва да познаете нейното име, изпълнители (може да са
                      повече от един), година на издаване, албум (не всяка песен
                      има) и локация на заснемане (не всяка песен има) (може да
                      са повече от една).
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsInfoModalOpen(false)}
                    >
                      Окей, благодаря!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Head>
        <title>Chalge</title>
        <meta
          name="description"
          content="A fun game where you need to guess a new chalga song every day."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar
        onClickOverHelpIcon={() => {
          setIsInfoModalOpen(true);
        }}
      />
      {song.data ? (
        <main className="flex h-[calc(100vh-5rem)] flex-col items-center justify-center space-y-6">
          {valueForDate.videoId == "" ? (
            <div className="h-52 w-96 rounded-2xl bg-[#D9D9D9]" />
          ) : (
            <>
              <h1 className="text-inter text-3xl text-main text-center">
                Поздравления, ти позна чалга песента!
              </h1>
              <h2 className="text-inter text-2xl text-main text-center">
                Ела пак утре, за да познаеш следващата!
              </h2>
              <Link
                href={`https://www.youtube.com/watch?v=${valueForDate.videoId}`}
                target="_blank"
              >
                <div
                  style={{
                    backgroundImage: `url(https://i3.ytimg.com/vi/${valueForDate.videoId}/maxresdefault.jpg)`,
                  }}
                  className={`h-52 w-[23rem] cursor-pointer rounded-2xl bg-contain`}
                />
              </Link>
            </>
          )}
          <div className="flex flex-col items-center justify-center space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
            <input
              type="text"
              id="inputBox"
              className="w-[24rem] border-b-2 text-center font-inter text-2xl text-main transition duration-150 ease-in-out placeholder:text-center focus:outline-none"
              placeholder="Опитай се да познаеш ..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              disabled={valueForDate.videoId != ""}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  checkForCorrentInput();
                }
              }}
            />
            {valueForDate.videoId == "" ? (
              <button
                className="w-fit rounded-lg border-2 pl-2 pr-2 font-inter text-2xl text-main focus:outline-none"
                onClick={() => {
                  checkForCorrentInput();
                }}
              >
                Провери
              </button>
            ) : null}
          </div>
          <hr />
          <div className="w-[24rem] font-inter text-2xl text-main lg:w-[33rem]">
            <p className="cursor-default">Име: {valueForDate.name}</p>
            <hr />
          </div>
          <div className="w-[24rem] font-inter text-2xl text-main lg:w-[33rem]">
            {song.data.artist == 1 ? (
              <p className="cursor-default">
                Изпълнител: {valueForDate.artists[0]}
              </p>
            ) : (
              <p className="cursor-default">
                Изпълнители (valueForDate.artist.length/{song.data?.artist}):{" "}
                {valueForDate.artists}
              </p>
            )}
            <hr />
          </div>
          <div className="w-[24rem] font-inter text-2xl text-main lg:w-[33rem]">
            {valueForDate.yearOfPublish == 0 ? (
              <p className="cursor-default">Година на издаване: </p>
            ) : (
              <p className="cursor-default">
                Година на издаване: {valueForDate.yearOfPublish}
              </p>
            )}
            <hr />
          </div>
          {song.data.album == 1 ? (
            <div className="w-[24rem] font-inter text-2xl text-main lg:w-[33rem]">
              <p className="cursor-default">Албум: {valueForDate.album}</p>
              <hr />
            </div>
          ) : null}
          {song.data.location != 0 ? (
            <div className="w-[24rem] font-inter text-2xl text-main lg:w-[33rem]">
              <p className="cursor-default">
                Локация на заснемане (valueForDate.location.length/
                {song.data.location}):
                {valueForDate.location.concat(", ").slice(0, -2)}
              </p>
              <hr />
            </div>
          ) : null}
        </main>
      ) : (
        <p>Loading...</p>
      )}
      <footer>
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-inter mb-6 text-center text-2xl text-main">
            Ако проекта ти харесва можеш да дадеш някой лев ей{" "}
            <span className="underline">
              <Link href={"https://github.com/sponsors/SSIvanov19"}>тука</Link>
            </span>
            . <br /> Всички пари отиват за подобряването и подържането на тези
            малки проекчета (Както и за Дока, разбира се :)
          </p>
        </div>
      </footer>
    </>
  );
}
