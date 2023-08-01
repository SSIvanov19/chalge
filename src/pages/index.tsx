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

  const [valueForDate, setValueForDate] = useLocalStorage<Song>(
    `valueFor${date.toDateString()}`,
    {
      name: "",
      artists: [],
      yearOfPublish: 0,
      album: "",
      location: [],
      videoId: "",
    } as Song
  );

  const checkForCorrentInput = () => {
    
    mutation.mutate({
      name: valueForDate.name != "" ? valueForDate.name : inputValue,
      artists: [...valueForDate.artists, inputValue],
      yearOfPublish: valueForDate.yearOfPublish != 0 ? valueForDate.yearOfPublish : (parseInt(inputValue) || 0),
      album: valueForDate.album != "" ? valueForDate.album : inputValue,
      location: [...valueForDate.location, inputValue],
    });

    if (mutation.data) {
      if (mutation.data.success) {
        console.log("Correct input");
        return;
      }

      if (mutation.data.message?.name) {
        setValueForDate((prev) => ({ ...prev, name: inputValue }));
      }
      if (mutation.data.message?.artists) {
        console.log("artists");
        setValueForDate((prev) => ({
          ...prev,
          artist: [inputValue, ...prev.artists],
        }));
      }
      if (mutation.data.message?.yearOfPublish) {
        setValueForDate((prev) => ({
          ...prev,
          yearOfPublish: parseInt(inputValue),
        }));
      }
      if (mutation.data.message?.album) {
        setValueForDate((prev) => ({ ...prev, album: inputValue }));
      }
      if (mutation.data.message?.location) {
        setValueForDate((prev) => ({
          ...prev,
          location: [inputValue, ...prev.location],
        }));
      }
    }
  }

  useEffect(() => {
    if (localStorage.getItem("isFirstTimeVisit") === null) {
      setIsInfoModalOpen(true);
      localStorage.setItem("isFirstTimeVisit", "false");
    }
  }, []);

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
            <Link href={`https://www.youtube.com/watch?v=${valueForDate.videoId}`} target="_blank">
              <div className={`h-52 w-[23rem] rounded-2xl bg-[url('https://i3.ytimg.com/vi/${valueForDate.videoId}/maxresdefault.jpg')] bg-contain cursor-pointer`} />
            </Link>
          )}
          <div className="flex flex-col items-center justify-center space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
            <input
              type="text"
              id="inputBox"
              className="w-[24rem] border-b-2 text-center font-inter text-2xl text-main placeholder:text-center focus:outline-none"
              placeholder="Опитай се да познаеш ..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            />
            {valueForDate.videoId == "" ? (
              <button className="w-fit rounded-lg border-2 pl-2 pr-2 font-inter text-2xl text-main focus:outline-none" onClick={
                () => {
                  checkForCorrentInput();
                }
              }>
                Провери
              </button>
            ) : null}
          </div>
          <hr />
          <div className="w-[24rem] font-inter text-2xl text-main lg:w-[33rem]">
            <p className="cursor-default">Име: </p>
            <hr />
          </div>
          <div className="w-[24rem] font-inter text-2xl text-main lg:w-[33rem]">
            {song.data.artist == 1 ? (
              <p className="cursor-default">
                Изпълнител: {valueForDate.artists.concat(", ").slice(0, -2)}
              </p>
            ) : (
              <p className="cursor-default">
                Изпълнители (valueForDate.artist.length/{song.data?.artist}):{" "}
                {valueForDate.artists.concat(", ").slice(0, -2)}
              </p>
            )}
            <hr />
          </div>
          <div className="w-[24rem] font-inter text-2xl text-main lg:w-[33rem]">
            {song.data.yearOfPublish == 1 ? (
              <p className="cursor-default">Година на издаване: </p>
            ) : (
              <p className="cursor-default">
                Години на издаване: {valueForDate.yearOfPublish}
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
      {/* footer for information */}
    </>
  );
}
