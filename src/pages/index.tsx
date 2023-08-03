import Head from "next/head";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Navbar from "~/components/navbar";
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

type TimeRecord = {
  startTime: Date | null;
  endTime: Date | null;
  isShared: boolean | null;
};

type Leaderboard = {
  id: string;
  date: Date;
  username: string;
  startTime: Date;
  endTime: Date;
};

export default function Home() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [isShareScoreModalOpen, setIsShareScoreModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [leaderboard, setLeaderboard] = useState<Array<Leaderboard>>(
    Array<Leaderboard>()
  );
  const [isShareButtonPressed, setIsShareButtonPressed] = useState(false);
  const [username, setUsername] = useState("");
  const inputMutation = api.songs.checkForCorrectInput.useMutation();
  const leaderboardMutation = api.songs.addRecordToLeaderboard.useMutation();

  const date = new Date();
  date.setSeconds(0, 0);
  const song = api.songs.getSongFieldsForDay.useQuery(date);
  const leaderboardData = api.songs.getLeaderboard.useQuery(date);

  const [valueForDate, setValueForDate] = useState<Song>({
    name: "",
    artists: [],
    yearOfPublish: 0,
    album: "",
    location: [],
    videoId: "",
  } as Song);

  const [timeRecords, setTimeRecords] = useState<TimeRecord>({
    startTime: null,
    endTime: null,
    isShared: null,
  } as TimeRecord);

  useEffect(() => {
    setValueForDate(valueForDate);
  }, [setValueForDate, valueForDate]);

  const timeSpanToString = (startDateTime: Date, endDateTime: Date) => {
    const timeSpan =
      new Date(endDateTime).getTime() - new Date(startDateTime).getTime();
    const res = new Date(timeSpan);
    return res.toISOString().substring(11).substring(0, 12);
  };

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

    await inputMutation.mutateAsync(
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

          if (response.videoId != "") {
            const endDate = new Date();
            const startTime = timeRecords.startTime;

            console.log(startTime, endDate);
            setTimeRecords({
              startTime: new Date(timeRecords.startTime),
              endTime: endDate,
              isShared: false,
            } as TimeRecord);

            localStorage.setItem(
              `timeRecords${date.toDateString()}`,
              JSON.stringify({
                startTime: new Date(timeRecords.startTime),
                endTime: endDate,
                isShared: false,
              } as TimeRecord)
            );
          }
        },
      }
    );
  };

  const addRecordToLeaderboard = () => {
    if (isShareButtonPressed) {
      return;
    }

    setIsShareButtonPressed(true);

    document.getElementById("shareButton")?.setAttribute("disabled", "true");
    if (username == "") {
      document.getElementById("usernameInput")?.classList.add("animate-shake");
      setTimeout(() => {
        document
          .getElementById("usernameInput")
          ?.classList.remove("animate-shake");
      }, 1000);

      document.getElementById("shareButton")?.removeAttribute("disabled");
      setIsShareButtonPressed(false);
      return;
    }

    leaderboardMutation.mutate(
      {
        date: date,
        userName: username,
        startDateTime: new Date(timeRecords.startTime),
        endDateTime: new Date(timeRecords.endTime),
      },
      {
        onSuccess: (data) => {
          const temp = [
            ...leaderboard,
            {
              date: date,
              username: username,
              startTime: timeRecords.startTime,
              endTime: timeRecords.endTime,
            } as Leaderboard,
          ];
          temp.sort((a, b) => {
            const aTime =
              new Date(a.endTime).getTime() - new Date(a.startTime).getTime();
            const bTime =
              new Date(b.endTime).getTime() - new Date(b.startTime).getTime();

            return aTime - bTime;
          });
          setLeaderboard(temp);
          setIsShareScoreModalOpen(false);
          setIsLeaderboardModalOpen(true);
          setTimeRecords({
            startTime: new Date(timeRecords.startTime),
            endTime: new Date(timeRecords.endTime),
            isShared: true,
          } as TimeRecord);

          localStorage.setItem(
            `timeRecords${date.toDateString()}`,
            JSON.stringify({
              startTime: new Date(timeRecords.startTime),
              endTime: new Date(timeRecords.endTime),
              isShared: true,
            } as TimeRecord)
          );

          document.getElementById("shareButton")?.removeAttribute("disabled");
        
          setIsShareButtonPressed(false);
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

    const timeRecordsFromLocalStorage = localStorage.getItem(
      `timeRecords${date.toDateString()}`
    );

    if (timeRecordsFromLocalStorage) {
      setTimeRecords(JSON.parse(timeRecordsFromLocalStorage) as TimeRecord);
    } else {
      const startDate = new Date();
      setTimeRecords({
        startTime: startDate,
        endTime: null,
        isShared: false,
      } as TimeRecord);

      localStorage.setItem(
        `timeRecords${date.toDateString()}`,
        JSON.stringify({
          startTime: startDate,
          endTime: null,
          isShared: false,
        } as TimeRecord)
      );
    }

    setLeaderboard(leaderboardData.data as Array<Leaderboard>);
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

      <Transition appear show={isShareScoreModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setIsShareScoreModalOpen(false);
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
                    Сподели твоето време
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="pb-4 text-sm text-gray-500">
                      Поздравления, твоето време е{" "}
                      {timeSpanToString(
                        timeRecords.startTime,
                        timeRecords.endTime
                      )}
                    </p>
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                        }}
                        id="usernameInput"
                        className="w-2/3 border-b-2 text-center font-inter text-2xl text-main transition duration-150 ease-in-out placeholder:text-center focus:outline-none"
                        placeholder="Вашето име"
                      />
                      <button
                        id="shareButton"
                        className="w-full rounded-lg border-2 pl-2 pr-2 font-inter text-2xl text-main focus:outline-none"
                        onClick={() => {
                          addRecordToLeaderboard();
                        }}
                      >
                        Сподели
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsShareScoreModalOpen(false)}
                    >
                      Не, благодаря!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isLeaderboardModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setIsLeaderboardModalOpen(false);
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
                    onClick={() => {
                      window.open(
                        "https://www.youtube.com/watch?v=75ENws5_Bjc"
                      );
                    }}
                  >
                    Топ
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      {leaderboard && leaderboard.length != 0 ? (
                        <>
                          {leaderboard.map((record, index) => {
                            return (
                              <div
                                className="flex w-fit flex-row justify-between space-x-2"
                                key={index}
                              >
                                <p className="text-sm text-gray-500">
                                  {index + 1}. {record.username}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {timeSpanToString(
                                    record.startTime,
                                    record.endTime
                                  )}
                                </p>
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500">
                            Няма записани рекорди
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsLeaderboardModalOpen(false)}
                    >
                      Затвори
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
        onClickLeaderboardIcon={() => {
          setIsLeaderboardModalOpen(true);
        }}
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
              <h1 className="text-inter text-center text-3xl text-main">
                Поздравления, ти позна чалга песента!
              </h1>
              <h2 className="text-inter text-center text-2xl text-main">
                Ела пак утре, за да познаеш следващата!
              </h2>
              <h2>
                <div className="flex flex-col items-center justify-center space-x-0 space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
                  <span className="text-inter text-center text-2xl text-main">
                    Успя да познаеш за:{" "}
                    {timeSpanToString(
                      timeRecords.startTime,
                      timeRecords.endTime
                    )}
                  </span>
                  {timeRecords.isShared == false ? (
                    <button
                      className="w-fit rounded-lg border-2 pl-2 pr-2 font-inter text-2xl text-main focus:outline-none"
                      onClick={() => {
                        setIsShareScoreModalOpen(true);
                      }}
                    >
                      Сподели
                    </button>
                  ) : null}
                </div>
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
                Изпълнители ({valueForDate.artists.length}/{song.data?.artist}):{" "}
                {valueForDate.artists.join(", ")}
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
                Локация на заснемане ({valueForDate.location.length}/
                {song.data.location}):
                {valueForDate.location.join(", ")}
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
